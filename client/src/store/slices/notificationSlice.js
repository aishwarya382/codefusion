import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    setNotifications: (state, action) => { state.notifications = action.payload },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    setUnreadCount: (state, action) => { state.unreadCount = action.payload },
    markRead: (state, action) => {
      const notif = state.notifications.find(n => n._id === action.payload)
      if (notif && !notif.isRead) {
        notif.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach(n => n.isRead = true)
      state.unreadCount = 0
    },
    removeNotification: (state, action) => {
      const notif = state.notifications.find(n => n._id === action.payload)
      if (notif && !notif.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1)
      state.notifications = state.notifications.filter(n => n._id !== action.payload)
    },
  },
})

export const {
  setNotifications, addNotification, setUnreadCount, markRead, markAllRead, removeNotification,
} = notificationSlice.actions
export const selectNotifications = (state) => state.notifications.notifications
export const selectUnreadCount = (state) => state.notifications.unreadCount
export default notificationSlice.reducer
