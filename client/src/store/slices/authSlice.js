import { createSlice } from '@reduxjs/toolkit'

const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('cf_user')
    return user ? JSON.parse(user) : null
  } catch { return null }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromStorage(),
    token: localStorage.getItem('cf_token') || null,
    isAuthenticated: !!localStorage.getItem('cf_token'),
    isLoading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      state.error = null
      localStorage.setItem('cf_token', token)
      localStorage.setItem('cf_user', JSON.stringify(user))
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('cf_user', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('cf_token')
      localStorage.removeItem('cf_user')
    },
    setLoading: (state, action) => { state.isLoading = action.payload },
    setError: (state, action) => { state.error = action.payload },
  },
})

export const { setCredentials, updateUser, logout, setLoading, setError } = authSlice.actions
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export default authSlice.reducer
