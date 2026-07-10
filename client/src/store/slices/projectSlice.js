import { createSlice } from '@reduxjs/toolkit'

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    filters: { search: '', language: '', archived: false },
    pagination: { page: 1, total: 0, limit: 12 },
  },
  reducers: {
    setProjects: (state, action) => { state.projects = action.payload },
    setCurrentProject: (state, action) => { state.currentProject = action.payload },
    addProject: (state, action) => { state.projects.unshift(action.payload) },
    updateProject: (state, action) => {
      const idx = state.projects.findIndex(p => p._id === action.payload._id)
      if (idx !== -1) state.projects[idx] = action.payload
      if (state.currentProject?._id === action.payload._id) state.currentProject = action.payload
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter(p => p._id !== action.payload)
    },
    setLoading: (state, action) => { state.loading = action.payload },
    setError: (state, action) => { state.error = action.payload },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload } },
  },
})

export const {
  setProjects, setCurrentProject, addProject, updateProject, removeProject,
  setLoading, setError, setFilters, setPagination,
} = projectSlice.actions
export const selectProjects = (state) => state.projects.projects
export const selectCurrentProject = (state) => state.projects.currentProject
export default projectSlice.reducer
