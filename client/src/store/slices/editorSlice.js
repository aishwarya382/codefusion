import { createSlice } from '@reduxjs/toolkit'

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    code: '',
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: 'on',
    autoSave: true,
    formatOnSave: false,
    collaborators: [],
    cursors: {},
    output: null,
    isRunning: false,
    versions: [],
    selectedVersion: null,
    aiPanelOpen: false,
    chatPanelOpen: true,
    executionPanelOpen: false,
    versionPanelOpen: false,
    isFullscreen: false,
    isSaving: false,
    lastSaved: null,
    unsavedChanges: false,
  },
  reducers: {
    setCode: (state, action) => {
      state.code = action.payload
      state.unsavedChanges = true
    },
    setLanguage: (state, action) => { state.language = action.payload },
    setTheme: (state, action) => { state.theme = action.payload },
    setFontSize: (state, action) => { state.fontSize = action.payload },
    setTabSize: (state, action) => { state.tabSize = action.payload },
    toggleWordWrap: (state) => { state.wordWrap = !state.wordWrap },
    toggleMinimap: (state) => { state.minimap = !state.minimap },
    setCollaborators: (state, action) => { state.collaborators = action.payload },
    addCollaborator: (state, action) => {
      const exists = state.collaborators.find(c => c.userId === action.payload.userId)
      if (!exists) state.collaborators.push(action.payload)
    },
    removeCollaborator: (state, action) => {
      state.collaborators = state.collaborators.filter(c => c.userId !== action.payload)
    },
    updateCursor: (state, action) => {
      const { userId, position, selection, color } = action.payload
      state.cursors[userId] = { position, selection, color }
    },
    removeCursor: (state, action) => { delete state.cursors[action.payload] },
    setOutput: (state, action) => { state.output = action.payload },
    setIsRunning: (state, action) => { state.isRunning = action.payload },
    setVersions: (state, action) => { state.versions = action.payload },
    toggleAIPanel: (state) => { state.aiPanelOpen = !state.aiPanelOpen },
    toggleChatPanel: (state) => { state.chatPanelOpen = !state.chatPanelOpen },
    toggleExecutionPanel: (state) => { state.executionPanelOpen = !state.executionPanelOpen },
    toggleVersionPanel: (state) => { state.versionPanelOpen = !state.versionPanelOpen },
    toggleFullscreen: (state) => { state.isFullscreen = !state.isFullscreen },
    setSaving: (state, action) => { state.isSaving = action.payload },
    setLastSaved: (state, action) => {
      state.lastSaved = action.payload
      state.unsavedChanges = false
      state.isSaving = false
    },
  },
})

export const {
  setCode, setLanguage, setTheme, setFontSize, setTabSize, toggleWordWrap, toggleMinimap,
  setCollaborators, addCollaborator, removeCollaborator, updateCursor, removeCursor,
  setOutput, setIsRunning, setVersions, toggleAIPanel, toggleChatPanel,
  toggleExecutionPanel, toggleVersionPanel, toggleFullscreen, setSaving, setLastSaved,
} = editorSlice.actions
export const selectEditor = (state) => state.editor
export default editorSlice.reducer
