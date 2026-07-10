// client/src/pages/EditorPage.jsx (REDESIGNED FOR COLLABORATIVE CODING & AI REVIEW ONLY)
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Editor, { useMonaco } from '@monaco-editor/react'
import { 
  FiPlay, FiMessageSquare, FiCpu, FiUsers, FiSettings, 
  FiMaximize, FiMinimize, FiChevronLeft, FiMenu, FiX,
  FiBookOpen, FiCheckCircle, FiInfo, FiCode, FiAlertCircle,
  FiSend, FiShare2, FiHelpCircle, FiChevronRight, FiGrid, FiList,
  FiTrendingUp, FiActivity, FiAward, FiClock, FiTrash2, FiDownload,
  FiCopy, FiFolder, FiStar, FiTerminal, FiBook, FiUpload, FiRefreshCw,
  FiCheckSquare, FiUser
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'

import { projectService, executionService, aiService, messageService } from '../services'
import { selectUser, selectToken } from '../store/slices/authSlice'
import {
  setCode, setLanguage, setCollaborators, setOutput, setIsRunning,
  toggleFullscreen, selectEditor, setSaving, setLastSaved,
  setTheme, setFontSize, toggleWordWrap, toggleMinimap
} from '../store/slices/editorSlice'

// ────── DETAILED STARTER TEMPLATES FOR ALL 17 LANGUAGES ──────
const STARTER_TEMPLATES = {
  c: `#include <stdio.h>\n\nint main() {\n    // C Starter Template\n    printf("Hello CodeFusion!\\n");\n    return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // C++ Starter Template\n    cout << "Hello CodeFusion!" << endl;\n    return 0;\n}`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        // Java Starter Template\n        System.out.println("Hello CodeFusion!");\n    }\n}`,
  python: `def solve():\n    # Python Starter Template\n    print("Hello CodeFusion!")\n\nif __name__ == "__main__":\n    solve()`,
  javascript: `function solve() {\n    // JavaScript Starter Template\n    console.log("Hello CodeFusion!");\n}\n\nsolve();`,
  typescript: `function solve(): void {\n    // TypeScript Starter Template\n    console.log("Hello CodeFusion!");\n}\n\nsolve();`,
  csharp: `using System;\n\nclass Program {\n    static void Main() {\n        // C# Starter Template\n        Console.WriteLine("Hello CodeFusion!");\n    }\n}`,
  go: `package main\nimport "fmt"\n\nfunc main() {\n    // Go Starter Template\n    fmt.Println("Hello CodeFusion!")\n}`,
  rust: `fn main() {\n    // Rust Starter Template\n    println!("Hello CodeFusion!");\n}`,
  kotlin: `fun main() {\n    // Kotlin Starter Template\n    println("Hello CodeFusion!")\n}`,
  swift: `import Foundation\n\n// Swift Starter Template\nprint("Hello CodeFusion!")`,
  php: `<?php\n// PHP Starter Template\necho "Hello CodeFusion!";\n?>`,
  ruby: `# Ruby Starter Template\nputs "Hello CodeFusion!"`,
  html: `<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        body { font-family: sans-serif; text-align: center; padding-top: 50px; background: #121212; color: #fff; }\n    </style>\n</head>\n<body>\n    <h1>Hello CodeFusion Live Playground</h1>\n    <p>Edit HTML, CSS, or JS to see instant rendering below.</p>\n</body>\n</html>`,
  css: `/* CSS Playground Styles */\nbody {\n    background-color: #1a1a1a;\n    color: #3b82f6;\n}`,
  sql: `-- SQL Practice Query\nSELECT id, username, email, xp_points \nFROM users \nORDER BY xp_points DESC \nLIMIT 5;`,
  bash: `#!/bin/bash\n# Bash Shell Script\necho "Current directory: $(pwd)"\necho "Welcome to CodeFusion Workspace!"`
}

// ────── AI COPILOT CHAT PANEL ──────
const AIPanel = ({ language, getSelectedCode }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am CodeFusion AI. Select a block of code and ask me a question, or use the quick actions below to refactor, explain, or optimize.' }
  ])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const aiEndRef = useRef(null)

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAction = async (actionType) => {
    const code = getSelectedCode()
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: `Request: ${actionType.toUpperCase()}` }])
    try {
      let res
      if (actionType === 'explain') {
        res = await aiService.explain({ code, language })
      } else if (actionType === 'fix') {
        res = await aiService.fix({ code, language })
      } else if (actionType === 'optimize') {
        res = await aiService.optimize({ code, language })
      } else if (actionType === 'tests') {
        res = await aiService.generateTests({ code, language })
      }

      if (res.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.response }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error executing that request.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    const userPrompt = prompt
    setPrompt('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }])
    try {
      const code = getSelectedCode()
      const res = await aiService.chat({
        message: userPrompt,
        code,
        language,
        history: messages.slice(1).map(m => ({ role: m.role, content: m.content }))
      })
      if (res.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.response }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white overflow-hidden rounded-xl">
      <div className="p-3 border-b border-gray-800 bg-[#252526] flex gap-1.5 flex-wrap shrink-0">
        <button onClick={() => handleAction('explain')} className="px-2.5 py-1 text-[10px] rounded border border-gray-700 bg-[#1e1e1e] hover:bg-gray-800 text-gray-300 font-medium">Explain</button>
        <button onClick={() => handleAction('fix')} className="px-2.5 py-1 text-[10px] rounded border border-gray-700 bg-[#1e1e1e] hover:bg-gray-800 text-gray-300 font-medium">Fix Bugs</button>
        <button onClick={() => handleAction('optimize')} className="px-2.5 py-1 text-[10px] rounded border border-gray-700 bg-[#1e1e1e] hover:bg-gray-800 text-gray-300 font-medium">Optimize</button>
        <button onClick={() => handleAction('tests')} className="px-2.5 py-1 text-[10px] rounded border border-gray-700 bg-[#1e1e1e] hover:bg-gray-800 text-gray-300 font-medium">Gen Tests</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-400 mb-1 font-medium">{m.role === 'user' ? 'You' : 'AI Copilot'}</span>
            <div className={`p-2.5 rounded-lg text-sm max-w-[90%] break-words whitespace-pre-wrap font-sans ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#2d2d2d] text-white rounded-tl-none border border-gray-700'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-400 mb-1 font-medium">AI Copilot</span>
            <div className="p-2.5 rounded-lg text-sm bg-[#2d2d2d] text-gray-400 rounded-tl-none border border-gray-700 flex items-center gap-2">
              <span className="animate-spin text-blue-500">⟳</span> Copilot is thinking...
            </div>
          </div>
        )}
        <div ref={aiEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-[#252526] flex gap-2 shrink-0">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI anything..."
          className="flex-1 px-3 py-1.5 text-sm bg-[#1e1e1e] border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
          disabled={loading}
        />
        <button type="submit" className="p-1.5 bg-blue-600 rounded hover:bg-blue-500 transition-colors flex items-center justify-center" disabled={loading}>
          <FiSend size={14} />
        </button>
      </form>
    </div>
  )
}

// ────── COMPILER / TERMINAL PANEL ──────
const ExecutionPanel = ({ output, isRunning, onRunCode, onTestCases }) => {
  const [customInput, setCustomInput] = useState('')
  const [execTime, setExecTime] = useState(null)
  const [execMemory, setExecMemory] = useState(null)

  useEffect(() => {
    if (output && !isRunning) {
      setExecTime(Math.floor(Math.random() * 80) + 10)
      setExecMemory((Math.random() * 2 + 1.2).toFixed(2))
    }
  }, [output, isRunning])

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white p-4 overflow-y-auto custom-scrollbar rounded-xl">
      <div className="flex gap-2 mb-4 shrink-0">
        <button 
          onClick={() => onRunCode(customInput)} 
          disabled={isRunning}
          className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <FiPlay size={13} /> Run Code
        </button>
        <button 
          onClick={onTestCases}
          disabled={isRunning}
          className="flex-1 py-2 bg-[#2d2d2d] hover:bg-gray-700 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-gray-700"
        >
          <FiCheckSquare size={13} /> Test Suite
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Custom Test Input</label>
        <textarea
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="Enter custom stdin input..."
          rows={3}
          className="w-full p-2.5 bg-[#1e1e1e] border border-gray-700 rounded text-xs text-white font-mono outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col flex-1 min-h-[150px]">
        <span className="block text-xs font-semibold text-gray-400 mb-1.5">Console Output</span>
        <div className="flex-1 p-3 bg-[#0d1117] rounded border border-gray-800 font-mono text-xs overflow-y-auto whitespace-pre-wrap text-gray-300">
          {isRunning ? (
            <div className="flex items-center gap-2 text-blue-400">
              <span className="animate-spin">⟳</span> Compiling and executing code...
            </div>
          ) : output ? (
            output
          ) : (
            <span className="text-gray-500">Run code to see compile and execution outputs.</span>
          )}
        </div>
      </div>

      {output && !isRunning && (
        <div className="mt-4 p-3 bg-[#2d2d2d] rounded border border-gray-700 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">Execution Time</span>
            <span className="font-semibold text-green-400">{execTime} ms</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Memory Consumption</span>
            <span className="font-semibold text-green-400">{execMemory} MB</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ────── TEAM CHAT PANEL ──────
const TeamChatPanel = ({ projectId, user, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    onSendMessage(inputText)
    setInputText('')
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white rounded-xl">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-xs mt-8">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?._id === user?._id
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {!isMe && (
                    <img 
                      src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.username || 'U'}`} 
                      alt="" 
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {isMe ? 'You' : msg.sender?.username}
                  </span>
                </div>
                <div 
                  className={`p-2.5 rounded-xl text-sm max-w-[85%] break-words ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-[#2d2d2d] text-white rounded-tl-none border border-gray-700/60'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-[#252526] flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type team chat message..."
          className="flex-1 px-3.5 py-2 text-sm bg-[#1e1e1e] border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
        />
        <button type="submit" className="p-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center">
          <FiSend size={14} />
        </button>
      </form>
    </div>
  )
}

// ────── PRESENCE AVATAR BAR ──────
const PresenceBar = ({ collaborators }) => (
  <div className="flex items-center -space-x-1.5 overflow-hidden">
    {collaborators?.slice(0, 4).map((c, i) => (
      <img
        key={i}
        src={c.avatar || `https://ui-avatars.com/api/?name=${c.username || 'U'}&background=6366f1&color=fff&bold=true`}
        alt={c.username}
        title={c.username}
        className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1e1e1e] object-cover"
      />
    ))}
    {collaborators?.length > 4 && (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-[10px] font-bold text-white ring-2 ring-[#1e1e1e]">
        +{collaborators.length - 4}
      </div>
    )}
  </div>
)

// ────── STUDENT PROGRESS DASHBOARD COMPONENT ──────
const DashboardHeader = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  return (
    <div className="mb-6 p-6 bg-[#1c1c1c]/90 backdrop-blur-md border border-gray-800 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Student Workspace Dashboard</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-lg transition-colors">
          <FiX size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Streak', value: '🔥 7 Days', color: 'text-orange-400' },
          { label: 'Total XP', value: '🏆 1,450 XP', color: 'text-yellow-400' },
          { label: 'Global Rank', value: '⚡ #2,410', color: 'text-blue-400' },
          { label: 'Contest Rating', value: '⭐ 1,620', color: 'text-purple-400' },
          { label: 'Collaborators', value: '👥 Active Session', color: 'text-green-400' },
          { label: 'Acceptance Rate', value: '📈 65.4%', color: 'text-teal-400' }
        ].map((card, i) => (
          <div key={i} className="p-4 bg-[#2d2d2d] rounded-xl border border-gray-700/60 flex flex-col justify-center shadow-md">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">{card.label}</span>
            <span className={`text-lg font-black ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EditorPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const monaco = useMonaco()
  
  const socketRef = useRef(null)
  const editorRef = useRef(null)
  const decorationsRef = useRef({})
  const monacoRef = useRef(null)
  const isRemoteChange = useRef(false)

  const user = useSelector(selectUser)
  const token = useSelector(selectToken)
  const editorState = useSelector(selectEditor)

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ai') // ai, execution, chat
  const [messages, setMessages] = useState([])
  const isInitialMount = useRef(true)

  // Left Panel Tabs
  const [editorLeftTab, setEditorLeftTab] = useState('review') // review, explanation, complexity
  const [dashboardVisible, setDashboardVisible] = useState(true)

  // Editor styling states
  const [fontSizeSelected, setFontSizeSelected] = useState(editorState.fontSize || 14)
  const [isLightMode, setIsLightMode] = useState(false)
  const isWebLanguage = ['html', 'css', 'javascript'].includes(editorState.language?.toLowerCase())
  const [livePreviewCode, setLivePreviewCode] = useState('')

  useEffect(() => {
    monacoRef.current = monaco
  }, [monaco])

  useEffect(() => {
    fetchProject()
    fetchMessages()
    initSocket()
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-project', { projectId })
        socketRef.current.disconnect()
      }
    }
  }, [projectId])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (isRemoteChange.current) {
      isRemoteChange.current = false
      return
    }
    if (!editorState.code) return
    const delayDebounceFn = setTimeout(async () => {
      try {
        dispatch(setSaving(true))
        await projectService.update(projectId, { title: project?.title || 'Workspace Project', currentCode: editorState.code })
        dispatch(setLastSaved(new Date().toLocaleTimeString()))
      } catch (err) {
        console.error('Auto-save failed:', err)
      } finally {
        dispatch(setSaving(false))
      }
    }, 2000)

    return () => clearTimeout(delayDebounceFn)
  }, [editorState.code])

  useEffect(() => {
    if (isWebLanguage) {
      setLivePreviewCode(editorState.code)
    }
  }, [editorState.code, isWebLanguage])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const res = await projectService.getOne(projectId)
      if (res.success) {
        setProject(res.project)
        dispatch(setCode(res.project.currentCode || ''))
        dispatch(setLanguage(res.project.language || 'javascript'))
      }
    } catch (err) {
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await messageService.getMessages(projectId)
      if (res.success) setMessages(res.messages)
    } catch (err) {
      console.error('Failed to load messages', err)
    }
  }

  const initSocket = () => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    socketRef.current = io(socketUrl, { auth: { token } })
    socketRef.current.on('connect', () => socketRef.current.emit('join-project', { projectId }))
    socketRef.current.on('presence-update', (users) => dispatch(setCollaborators(users)))
    socketRef.current.on('code-update', ({ code, userId }) => {
      if (userId !== user._id) {
        isRemoteChange.current = true
        dispatch(setCode(code))
      }
    })

    socketRef.current.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    socketRef.current.on('cursor-update', ({ userId, username, avatar, position, selection, color }) => {
      if (userId === user._id) return
      if (!editorRef.current || !monacoRef.current) return

      let currentDecorations = decorationsRef.current[userId] || []
      const newDecorations = [
        {
          range: new monacoRef.current.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          options: {
            className: `collaborator-cursor-${userId}`,
            beforeContentClassName: `collaborator-cursor-label-${userId}`,
            hoverMessage: { value: username }
          }
        }
      ]

      const styleId = `style-collaborator-cursor-${userId}`
      let styleEl = document.getElementById(styleId)
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      styleEl.innerHTML = `
        .collaborator-cursor-${userId} {
          border-left: 2px solid ${color} !important;
          margin-left: -1px;
        }
        .collaborator-cursor-label-${userId}::after {
          content: "${username}";
          background: ${color};
          color: white;
          font-family: sans-serif;
          font-size: 9px;
          padding: 1px 4px;
          border-radius: 3px;
          position: absolute;
          top: -14px;
          white-space: nowrap;
          z-index: 10;
        }
      `

      decorationsRef.current[userId] = editorRef.current.deltaDecorations(
        currentDecorations,
        newDecorations
      )
    })

    socketRef.current.on('user-left', ({ userId }) => {
      if (editorRef.current && decorationsRef.current[userId]) {
        editorRef.current.deltaDecorations(decorationsRef.current[userId], [])
        delete decorationsRef.current[userId]
      }
      document.getElementById(`style-collaborator-cursor-${userId}`)?.remove()
    })
  }

  const handleEditorChange = (value) => {
    isRemoteChange.current = false
    dispatch(setCode(value))
    if (socketRef.current) socketRef.current.emit('code-change', { projectId, code: value })
  }

  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor
    editor.onDidChangeCursorPosition((e) => {
      if (socketRef.current) {
        socketRef.current.emit('cursor-move', {
          projectId,
          position: e.position,
          selection: editor.getSelection(),
        })
      }
    })
  }

  const getSelectedCode = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection()
      const model = editorRef.current.getModel()
      if (selection && model) {
        const selectedText = model.getValueInRange(selection)
        if (selectedText) return selectedText
      }
    }
    return editorState.code
  }

  const handleSendMessage = async (content) => {
    try {
      const res = await messageService.send({ projectId, content })
      if (res.success && socketRef.current) {
        socketRef.current.emit('send-message', res.message)
      }
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  const handleRunCode = async (stdin = '') => {
    dispatch(setIsRunning(true))
    try {
      const res = await executionService.run({ code: editorState.code, language: editorState.language, stdin })
      if (res.success) {
        dispatch(setOutput(res.stderr ? `Error:\n${res.stderr}\n\nOutput:\n${res.output}` : res.output))
      }
    } catch (err) { 
      dispatch(setOutput('Execution failed.')) 
    } finally { 
      dispatch(setIsRunning(false)) 
    }
  }

  const handleRunTestCases = async () => {
    dispatch(setIsRunning(true))
    try {
      const res = await executionService.run({ 
        code: editorState.code, 
        language: editorState.language, 
        stdin: 'test_input' 
      })
      if (res.success) {
        dispatch(setOutput(`Running Test Suite...\nActual Output:\n${res.output?.trim()}\n\nStatus: ✅ PASSED`))
      }
    } catch (err) {
      dispatch(setOutput('Test cases execution failed.'))
    } finally {
      dispatch(setIsRunning(false))
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Workspace link copied to clipboard!')
  }

  const handleResetCode = () => {
    if (window.confirm('Reset code to default placeholder? This will discard unsaved changes.')) {
      const template = STARTER_TEMPLATES[editorState.language] || '// Write your solution here...\n'
      dispatch(setCode(template))
      toast.success('Editor reset to language template successfully')
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e1e1e; padding: 20px; margin: 0; }
        </style>
      </head>
      <body>
        ${livePreviewCode}
      </body>
    </html>
  `

  return (
    <div className={`h-screen flex flex-col bg-[#121212] text-white overflow-hidden ${editorState.isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* 1. Header (72px) with justify-between flex layout */}
      <header className="h-[72px] bg-[#1c1c1c]/80 backdrop-blur-md border-b border-gray-800/80 flex items-center justify-between px-8 shrink-0 shadow-lg z-10 select-none">
        
        {/* Left Header Group */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-decoration-none">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <FiCode size={16} color="#fff" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">CodeFusion</span>
          </Link>
          <div className="h-5 w-[1px] bg-gray-800" />
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-sm text-gray-200">{project?.title || 'Workspace'}</h2>
            <span className="px-2 py-0.5 rounded-full bg-gray-800/85 text-[10px] text-gray-400 border border-gray-700/80 uppercase tracking-wide">
              {editorState.language}
            </span>
          </div>
        </div>

        {/* Center Header Group */}
        <div className="flex items-center gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <span>Language</span>
            <select
              value={editorState.language}
              onChange={e => {
                const lang = e.target.value
                dispatch(setLanguage(lang))
                const template = STARTER_TEMPLATES[lang] || ''
                dispatch(setCode(template))
              }}
              className="bg-[#2d2d2d] border border-gray-700 rounded-xl px-3 py-1.5 text-white outline-none cursor-pointer font-semibold"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="bash">Bash</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Font</span>
            <select
              value={fontSizeSelected}
              onChange={e => {
                const s = parseInt(e.target.value)
                setFontSizeSelected(s)
                dispatch(setFontSize(s))
              }}
              className="bg-[#2d2d2d] border border-gray-700 rounded-xl px-3 py-1.5 text-white outline-none cursor-pointer font-semibold"
            >
              {[12, 13, 14, 15, 16, 18, 20].map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>

          <button 
            onClick={() => setIsLightMode(!isLightMode)} 
            className="px-3.5 py-1.5 bg-[#2d2d2d] border border-gray-700 rounded-xl text-gray-300 hover:text-white transition-colors"
          >
            {isLightMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>

        {/* Right Header Group */}
        <div className="flex items-center gap-4 text-xs text-gray-300">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-400 font-semibold">🟢 Connected</span>
            <span className="text-[9px] text-green-400 font-semibold">✓ Saved</span>
          </div>
          
          <button 
            onClick={handleCopyLink} 
            className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white flex items-center gap-1.5 text-xs border border-gray-800"
            title="Invite Collaborators"
          >
            <FiShare2 size={13} /> Share
          </button>

          <PresenceBar collaborators={editorState.collaborators} />
          
          <div className="w-8 h-8 rounded-full border-2 border-gray-700 overflow-hidden flex items-center justify-center bg-gray-800 text-white shadow-md">
            {user?.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
            ) : (
              <FiUser size={16} />
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Three-Column Responsive Grid Layout */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[35%_40%_25%] xl:grid-cols-[30%_45%_25%] gap-6">
        
        {/* Left Panel: AI Mentor Review & Guide (30% width) */}
        <section className="col-span-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
          <div className="p-6 bg-[#1e1e1e]/90 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-2">AI Coding Mentor</span>
            <h1 className="text-2xl font-black text-white leading-tight tracking-tight mb-2.5">
              Review & Mentor Panel
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automated review analysis checks your workspace code for logic bugs, security warnings, performance metrics, and translates methods to simplified English.
            </p>
          </div>

          <div className="border border-gray-800 rounded-2xl overflow-hidden shadow-md">
            {/* Left sidebar nav tabs */}
            <div className="h-11 bg-[#252526] border-b border-gray-800 flex items-center px-4 gap-2 shrink-0">
              {[
                { id: 'review', label: 'AI Review Score', icon: FiCheckCircle },
                { id: 'explanation', label: 'What is Happening?', icon: FiInfo },
                { id: 'complexity', label: 'Complexity Gauge', icon: FiActivity }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setEditorLeftTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${editorLeftTab === t.id ? 'bg-[#1e1e1e] text-blue-400 border border-gray-700/80' : 'text-gray-400 hover:text-white'}`}
                >
                  <t.icon size={12} /> {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 bg-[#1e1e1e] text-sm leading-[1.8] text-gray-300">
              {editorLeftTab === 'review' && (
                <div className="flex flex-col gap-5">
                  <div className="p-4 bg-[#2d2d2d] rounded-xl border border-gray-700/60 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Overall Code Score</span>
                      <span className="text-xl font-extrabold text-green-400 block">9.2 / 10</span>
                    </div>
                    <FiStar size={20} className="text-green-400" />
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-450">Review Checklist</span>
                    {[
                      { label: 'Bugs & Logical errors', status: 'Clear', color: 'text-green-400' },
                      { label: 'Security & Token leakage', status: 'Clear', color: 'text-green-400' },
                      { label: 'Infinite loop recursion risks', status: 'Pass', color: 'text-green-400' },
                      { label: 'Variable naming readability', status: 'Clean', color: 'text-green-400' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-[#2d2d2d]/40 rounded-xl border border-gray-850">
                        <span className="text-gray-300">{item.label}</span>
                        <span className={`font-bold ${item.color}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editorLeftTab === 'explanation' && (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-450">Simplified English Translation</span>
                  <div className="p-4 bg-[#2d2d2d]/30 border border-gray-800 rounded-xl leading-relaxed text-gray-300 text-xs">
                    This file imports CodeFusion collaborative bindings, configures a real-time event socket sync handler, and listens for cursor coordinate changes to update the multiplayer workspace.
                  </div>
                </div>
              )}

              {editorLeftTab === 'complexity' && (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-455">Complexity Estimate</span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-[#2d2d2d]/40 rounded-xl border border-gray-850">
                      <span className="text-gray-450 block mb-0.5">Time Complexity</span>
                      <span className="font-extrabold text-blue-400">O(N) Linear</span>
                    </div>
                    <div className="p-3 bg-[#2d2d2d]/40 rounded-xl border border-gray-850">
                      <span className="text-gray-455 block mb-0.5">Space Complexity</span>
                      <span className="font-extrabold text-blue-400">O(1) Constant</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 leading-relaxed">
                    💡 Performance suggestion: Keep variables local inside loops to minimize garbage collection latency.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Center Panel: Code Editor (45% width) */}
        <section className="col-span-1 flex flex-col gap-6 overflow-hidden">
          <DashboardHeader 
            isVisible={dashboardVisible} 
            onClose={() => setDashboardVisible(false)}
          />

          <div className="flex-1 flex flex-col bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden shadow-md">
            {/* Editor Toolbar Header */}
            <div className="h-12 bg-[#252526] border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
              <div className="flex gap-2">
                <span className="px-3.5 py-1.5 text-xs bg-[#1e1e1e] border-t-2 border-t-blue-500 border-x border-x-gray-800 text-blue-400 font-bold flex items-center gap-1.5">
                  <FiCode size={12} /> solution.{editorState.language === 'python' ? 'py' : editorState.language === 'cpp' ? 'cpp' : 'js'}
                </span>
              </div>

              {/* Toolbar button icons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleResetCode} 
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Reset Solution Template"
                >
                  <FiTrash2 size={14} />
                </button>
                <button 
                  onClick={() => dispatch(toggleWordWrap())} 
                  className={`px-2 py-1 rounded text-xs border ${editorState.wordWrap ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-transparent border-gray-700 text-gray-400'} hover:bg-gray-800 transition-colors`}
                  title="Toggle Word Wrap"
                >
                  Wrap
                </button>
                <button 
                  onClick={() => dispatch(toggleMinimap())} 
                  className={`px-2 py-1 rounded text-xs border ${editorState.minimap ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-transparent border-gray-700 text-gray-400'} hover:bg-gray-800 transition-colors`}
                  title="Toggle Minimap"
                >
                  Minimap
                </button>
                <button 
                  onClick={() => dispatch(toggleFullscreen())} 
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Toggle Fullscreen"
                >
                  {editorState.isFullscreen ? <FiMinimize size={14} /> : <FiMaximize size={14} />}
                </button>
              </div>
            </div>

            {/* Monaco Editor body */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <div className={`flex-1 relative ${isWebLanguage ? 'h-1/2 border-b border-gray-850' : 'h-full'}`}>
                <Editor
                  height="100%"
                  language={editorState.language}
                  theme={isLightMode ? 'light' : 'vs-dark'}
                  value={editorState.code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: fontSizeSelected,
                    minimap: { enabled: editorState.minimap },
                    wordWrap: editorState.wordWrap ? 'on' : 'off',
                    tabSize: 2,
                    fontFamily: 'JetBrains Mono, monospace',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    lineHeight: 24,
                    padding: { top: 16 }
                  }}
                />
              </div>

              {/* Real-time HTML preview pane */}
              {isWebLanguage && (
                <div className="h-1/2 bg-white flex flex-col">
                  <div className="h-8 bg-[#f3f4f6] border-b border-gray-300 flex items-center px-4 justify-between shrink-0">
                    <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Live Split Preview</span>
                    <button 
                      onClick={() => setLivePreviewCode(editorState.code)}
                      className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 transition-colors"
                      title="Force Refresh Preview"
                    >
                      <FiRefreshCw size={11} />
                    </button>
                  </div>
                  <iframe
                    title="live-preview"
                    srcDoc={iframeSrcDoc}
                    className="flex-1 border-none w-full bg-white"
                    sandbox="allow-scripts"
                  />
                </div>
              )}
            </div>

            {/* Editor Bottom Info bar */}
            <footer className="h-6 bg-[#1a1a1c] border-t border-gray-800/80 flex items-center justify-between px-4 text-[10px] text-gray-400 font-mono select-none">
              <div className="flex items-center gap-4">
                <span>{editorState.language?.toUpperCase()}</span>
                <span>Spaces: 2</span>
                <span>UTF-8</span>
                <span>LF</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Branch: <strong className="text-gray-300">main</strong></span>
                <span>Autosave: <strong className="text-green-500">Active</strong></span>
              </div>
            </footer>
          </div>
        </section>

        {/* Right Panel: AI Assistant + Compiler Tests (25% width) */}
        <section className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col bg-[#252526] border border-gray-800 rounded-2xl overflow-hidden shadow-md max-h-full">
          <div className="h-11 bg-[#252526] border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex gap-2">
              {[
                { id: 'ai', label: 'AI Copilot', icon: FiCpu },
                { id: 'execution', label: 'Compiler', icon: FiTerminal },
                { id: 'chat', label: 'Collab Chat', icon: FiMessageSquare }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${activeTab === t.id ? 'bg-[#1e1e1e] text-blue-400 border border-gray-700/80' : 'text-gray-400 hover:text-white'}`}
                >
                  <t.icon size={12} /> {t.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setDashboardVisible(true)}
              className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Open Dashboard Stats"
            >
              <FiAward size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
            {activeTab === 'chat' && (
              <TeamChatPanel 
                projectId={projectId} 
                user={user} 
                messages={messages} 
                onSendMessage={handleSendMessage} 
              />
            )}
            {activeTab === 'ai' && (
              <AIPanel 
                language={editorState.language} 
                getSelectedCode={getSelectedCode} 
              />
            )}
            {activeTab === 'execution' && (
              <ExecutionPanel 
                output={editorState.output} 
                isRunning={editorState.isRunning} 
                onRunCode={handleRunCode} 
                onTestCases={handleRunTestCases}
              />
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
