const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;
const onlineUsers = new Map(); // userId -> { socketId, username, avatar, projectId }
const projectRooms = new Map(); // projectId -> Set of userIds

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'codfusion_secret_key_2024');
      const user = await User.findById(decoded.id).select('username avatar role');
      if (!user) return next(new Error('User not found'));

      socket.user = { id: user._id.toString(), username: user.username, avatar: user.getAvatarUrl(), role: user.role };
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, username, avatar } = socket.user;
    console.log(`🔌 ${username} connected [${socket.id}]`);

    // Store online user
    onlineUsers.set(userId, { socketId: socket.id, username, avatar, projectId: null });

    // ────── EDITOR EVENTS ──────

    // Join project room
    socket.on('join-project', async ({ projectId }) => {
      socket.join(`project:${projectId}`);
      onlineUsers.get(userId).projectId = projectId;

      if (!projectRooms.has(projectId)) projectRooms.set(projectId, new Set());
      projectRooms.get(projectId).add(userId);

      // Notify others
      socket.to(`project:${projectId}`).emit('user-joined', {
        userId, username, avatar, projectId,
      });

      // Send current online users in this project
      const projectUsers = [];
      projectRooms.get(projectId).forEach(uid => {
        const u = onlineUsers.get(uid);
        if (u) projectUsers.push({ userId: uid, ...u });
      });
      socket.emit('presence-update', projectUsers);

      socket.to(`project:${projectId}`).emit('presence-update', projectUsers);
    });

    // Leave project room
    socket.on('leave-project', ({ projectId }) => {
      socket.leave(`project:${projectId}`);
      if (projectRooms.has(projectId)) {
        projectRooms.get(projectId).delete(userId);
      }
      socket.to(`project:${projectId}`).emit('user-left', { userId, username });
    });

    // Code change (real-time collaborative editing)
    socket.on('code-change', ({ projectId, code, delta, cursorPosition }) => {
      socket.to(`project:${projectId}`).emit('code-update', {
        userId, username, code, delta, cursorPosition, timestamp: Date.now(),
      });
    });

    // Cursor position sync
    socket.on('cursor-move', ({ projectId, position, selection }) => {
      socket.to(`project:${projectId}`).emit('cursor-update', {
        userId, username, avatar, position, selection,
        color: getUserColor(userId),
      });
    });

    // Typing indicator
    socket.on('typing-start', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('user-typing', { userId, username });
    });

    socket.on('typing-stop', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('user-stop-typing', { userId });
    });

    // Language change
    socket.on('language-change', ({ projectId, language }) => {
      socket.to(`project:${projectId}`).emit('language-changed', { userId, username, language });
    });

    // ────── CHAT EVENTS ──────

    socket.on('send-message', (messageData) => {
      io.to(`project:${messageData.projectId}`).emit('new-message', {
        ...messageData,
        sender: { _id: userId, username, avatar },
        createdAt: new Date(),
      });
    });

    socket.on('message-reaction', ({ messageId, emoji, projectId }) => {
      io.to(`project:${projectId}`).emit('reaction-update', { messageId, emoji, userId });
    });

    socket.on('chat-typing', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('chat-typing', { userId, username });
    });

    socket.on('chat-stop-typing', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('chat-stop-typing', { userId });
    });

    // ────── NOTIFICATION EVENTS ──────

    socket.on('join-notifications', () => {
      socket.join(`notifications:${userId}`);
    });

    // ────── VIDEO SIGNALING (WebRTC) ──────

    socket.on('video-join', ({ projectId, stream }) => {
      socket.to(`project:${projectId}`).emit('video-user-joined', {
        userId, username, avatar, socketId: socket.id,
      });
    });

    socket.on('video-offer', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('video-offer', { offer, fromSocketId: socket.id, fromUser: { userId, username, avatar } });
    });

    socket.on('video-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('video-answer', { answer, fromSocketId: socket.id });
    });

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', { candidate, fromSocketId: socket.id });
    });

    socket.on('video-leave', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('video-user-left', { userId, socketId: socket.id });
    });

    socket.on('raise-hand', ({ projectId }) => {
      io.to(`project:${projectId}`).emit('hand-raised', { userId, username });
    });

    // ────── DISCONNECT ──────

    socket.on('disconnect', () => {
      console.log(`❌ ${username} disconnected`);
      const userInfo = onlineUsers.get(userId);

      if (userInfo?.projectId) {
        const projectId = userInfo.projectId;
        socket.to(`project:${projectId}`).emit('user-left', { userId, username });
        socket.to(`project:${projectId}`).emit('video-user-left', { userId, socketId: socket.id });

        if (projectRooms.has(projectId)) {
          projectRooms.get(projectId).delete(userId);
        }
      }

      onlineUsers.delete(userId);
    });
  });

  return io;
};

const getUserColor = (userId) => {
  const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const sendNotification = (recipientId, notification) => {
  if (io) {
    io.to(`notifications:${recipientId}`).emit('new-notification', notification);
  }
};

const getIO = () => io;
const getOnlineUsers = () => onlineUsers;

module.exports = { initSocket, getIO, sendNotification, getOnlineUsers };
