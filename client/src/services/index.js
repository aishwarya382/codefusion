import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  refreshToken: (token) => api.post('/auth/refresh', { token }),
}

export const userService = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/users/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  changePassword: (data) => api.put('/users/password', data),
  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),
  getUsers: (params) => api.get('/users', { params }),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
}

export const projectService = {
  create: (data) => api.post('/projects', data),
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  invite: (id, data) => api.post(`/projects/${id}/invite`, data),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
  toggleArchive: (id) => api.patch(`/projects/${id}/archive`),
  explore: (params) => api.get('/projects/explore', { params }),
}

export const aiService = {
  chat: (data) => api.post('/ai/chat', data),
  explain: (data) => api.post('/ai/explain', data),
  fix: (data) => api.post('/ai/fix', data),
  optimize: (data) => api.post('/ai/optimize', data),
  generateTests: (data) => api.post('/ai/tests', data),
  document: (data) => api.post('/ai/document', data),
}

export const executionService = {
  run: (data) => api.post('/execute', data),
  getLanguages: () => api.get('/execute/languages'),
}

export const messageService = {
  getMessages: (projectId, params) => api.get(`/messages/${projectId}`, { params }),
  send: (data) => api.post('/messages', data),
  react: (messageId, emoji) => api.post(`/messages/${messageId}/react`, { emoji }),
  pin: (messageId) => api.patch(`/messages/${messageId}/pin`),
  delete: (messageId) => api.delete(`/messages/${messageId}`),
}

export const versionService = {
  create: (data) => api.post('/versions', data),
  getAll: (projectId, params) => api.get(`/versions/${projectId}`, { params }),
  getOne: (id) => api.get(`/versions/single/${id}`),
  restore: (id) => api.post(`/versions/${id}/restore`),
}

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export const searchService = {
  search: (params) => api.get('/search', { params }),
}

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  sendAnnouncement: (data) => api.post('/admin/announcement', data),
}

export const paymentService = {
  createCheckoutSession: (plan) => api.post('/payments/create-checkout-session', { plan }),
  cancelSubscription: () => api.post('/payments/cancel'),
}
