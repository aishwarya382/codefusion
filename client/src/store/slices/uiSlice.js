import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: localStorage.getItem('cf_theme') || 'dark',
    sidebarOpen: true,
    sidebarCollapsed: false,
    commandPaletteOpen: false,
    searchOpen: false,
    activeModal: null,
    notifications: { open: false },
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('cf_theme', action.payload)
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      state.theme = newTheme
      localStorage.setItem('cf_theme', newTheme)
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarCollapsed: (state, action) => { state.sidebarCollapsed = action.payload },
    setCommandPaletteOpen: (state, action) => { state.commandPaletteOpen = action.payload },
    setSearchOpen: (state, action) => { state.searchOpen = action.payload },
    setActiveModal: (state, action) => { state.activeModal = action.payload },
    setNotificationsOpen: (state, action) => { state.notifications.open = action.payload },
  },
})

export const {
  setTheme, toggleTheme, toggleSidebar, setSidebarCollapsed,
  setCommandPaletteOpen, setSearchOpen, setActiveModal, setNotificationsOpen,
} = uiSlice.actions
export const selectTheme = (state) => state.ui.theme
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export default uiSlice.reducer
