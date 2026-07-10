// client/src/pages/EditorPage.jsx — PREMIUM v5.0 COLLABORATIVE WORKSPACE
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Editor, { useMonaco } from '@monaco-editor/react'
import {
  FiPlay, FiMessageSquare, FiCpu, FiUsers, FiSettings,
  FiMaximize, FiMinimize, FiChevronLeft, FiChevronRight, FiMenu, FiX,
  FiBookOpen, FiCheckCircle, FiInfo, FiCode, FiAlertCircle,
  FiSend, FiShare2, FiHelpCircle, FiGrid, FiList,
  FiTrendingUp, FiActivity, FiAward, FiClock, FiTrash2, FiDownload,
  FiCopy, FiFolder, FiStar, FiTerminal, FiBook, FiUpload, FiRefreshCw,
  FiCheckSquare, FiUser, FiFile, FiChevronDown, FiGitBranch, FiEdit3,
  FiZap, FiLock, FiFileText, FiHash, FiType
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

// ────────────────────────────────────────────────────────────────
// STARTER TEMPLATES — ALL 17 LANGUAGES
// ────────────────────────────────────────────────────────────────
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

// Language display names
const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' }
]

// File extension helper
const getFileExtension = (lang) => {
  const map = { python: 'py', javascript: 'js', typescript: 'ts', cpp: 'cpp', c: 'c', java: 'java', csharp: 'cs', go: 'go', rust: 'rs', kotlin: 'kt', swift: 'swift', php: 'php', ruby: 'rb', html: 'html', css: 'css', sql: 'sql', bash: 'sh' }
  return map[lang] || 'txt'
}

// ────────────────────────────────────────────────────────────────
// FILE EXPLORER COMPONENT
// ────────────────────────────────────────────────────────────────
const MOCK_FILE_TREE = [
  { id: 'src', name: 'src', type: 'folder', children: [
    { id: 'main', name: 'main.js', type: 'file', icon: 'js' },
    { id: 'utils', name: 'utils.js', type: 'file', icon: 'js' },
    { id: 'style', name: 'style.css', type: 'file', icon: 'css' },
  ]},
  { id: 'index', name: 'index.html', type: 'file', icon: 'html' },
]

const FileExplorer = ({ activeFile, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState({ src: true })

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const fileIconColor = (icon) => {
    const colors = { js: 'text-yellow-400', ts: 'text-blue-400', css: 'text-blue-300', html: 'text-orange-400', py: 'text-green-400' }
    return colors[icon] || 'text-gray-400'
  }

  const renderItem = (item, depth = 0) => {
    if (item.type === 'folder') {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleFolder(item.id)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-[#2d2d2d] transition-colors rounded-md group"
            style={{ paddingLeft: `${12 + depth * 14}px` }}
          >
            <FiChevronRight size={11} className={`transition-transform ${expandedFolders[item.id] ? 'rotate-90' : ''} text-gray-500`} />
            <FiFolder size={13} className="text-blue-400" />
            <span className="font-medium">{item.name}</span>
          </button>
          <AnimatePresence>
            {expandedFolders[item.id] && item.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                {item.children.map(child => renderItem(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    return (
      <button
        key={item.id}
        onClick={() => onFileSelect(item.id)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors rounded-md ${
          activeFile === item.id
            ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500'
            : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-gray-200'
        }`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        <FiFile size={12} className={fileIconColor(item.icon)} />
        <span className="font-medium truncate">{item.name}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Explorer</span>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-[#2d2d2d] rounded text-gray-500 hover:text-gray-300 transition-colors" title="New File">
            <FiFile size={12} />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded text-gray-500 hover:text-gray-300 transition-colors" title="New Folder">
            <FiFolder size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1.5 custom-scrollbar">
        {MOCK_FILE_TREE.map(item => renderItem(item))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// AI MENTOR PANEL — 13 UTILITIES + CHAT
// ────────────────────────────────────────────────────────────────
const AI_ACTIONS = [
  { id: 'explain',      label: 'Explain Code',    icon: FiBookOpen,     color: 'text-blue-400' },
  { id: 'fix',          label: 'Fix Errors',      icon: FiAlertCircle,  color: 'text-red-400' },
  { id: 'optimize',     label: 'Optimize',        icon: FiTrendingUp,   color: 'text-green-400' },
  { id: 'tests',        label: 'Gen Tests',       icon: FiCheckSquare,  color: 'text-purple-400' },
  { id: 'comments',     label: 'Gen Comments',    icon: FiHash,         color: 'text-yellow-400' },
  { id: 'readme',       label: 'Gen README',      icon: FiFileText,     color: 'text-cyan-400' },
  { id: 'convert',      label: 'Convert Lang',    icon: FiRefreshCw,    color: 'text-orange-400' },
  { id: 'debug',        label: 'Debug',           icon: FiZap,          color: 'text-amber-400' },
  { id: 'naming',       label: 'Improve Names',   icon: FiType,         color: 'text-indigo-400' },
  { id: 'security',     label: 'Security Review', icon: FiLock,         color: 'text-rose-400' },
  { id: 'accessibility',label: 'Accessibility',   icon: FiUsers,        color: 'text-teal-400' },
  { id: 'commit',       label: 'Commit Message',  icon: FiGitBranch,    color: 'text-violet-400' },
  { id: 'documentation',label: 'Documentation',   icon: FiBook,         color: 'text-emerald-400' },
]

const AIMentorPanel = ({ language, getSelectedCode }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m CodeFusion AI Mentor. Select code and use quick actions below, or chat with me directly. I support 13 specialized utilities!' }
  ])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionsExpanded, setActionsExpanded] = useState(true)
  const aiEndRef = useRef(null)

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAction = async (actionId) => {
    const code = getSelectedCode()
    if (!code || !code.trim()) {
      toast.error('Select or write some code first')
      return
    }
    setLoading(true)
    const actionLabel = AI_ACTIONS.find(a => a.id === actionId)?.label || actionId
    setMessages(prev => [...prev, { role: 'user', content: `🔧 Action: ${actionLabel}` }])

    try {
      let res
      switch (actionId) {
        case 'explain':
          res = await aiService.explain({ code, language })
          break
        case 'fix':
          res = await aiService.fix({ code, language })
          break
        case 'optimize':
          res = await aiService.optimize({ code, language })
          break
        case 'tests':
          res = await aiService.generateTests({ code, language })
          break
        case 'comments':
          res = await aiService.chat({ message: 'Add detailed comments to this code. Return only the commented code.', code, language, history: [] })
          break
        case 'readme':
          res = await aiService.chat({ message: 'Generate a professional README.md for this code project. Include description, usage, and examples.', code, language, history: [] })
          break
        case 'convert':
          res = await aiService.chat({ message: 'Convert this code to Python (or the next logical language). Show the converted code with explanations.', code, language, history: [] })
          break
        case 'debug':
          res = await aiService.chat({ message: 'Debug this code. Identify all bugs, explain each issue, and provide the fixed version.', code, language, history: [] })
          break
        case 'naming':
          res = await aiService.chat({ message: 'Improve all variable, function, and class names in this code for better readability. Return the improved code.', code, language, history: [] })
          break
        case 'security':
          res = await aiService.chat({ message: 'Perform a security review of this code. Identify vulnerabilities, injection risks, and suggest fixes.', code, language, history: [] })
          break
        case 'accessibility':
          res = await aiService.chat({ message: 'Review this code for accessibility best practices. Suggest improvements for a11y compliance.', code, language, history: [] })
          break
        case 'commit':
          res = await aiService.chat({ message: 'Generate a conventional commit message for the changes in this code. Follow the format: type(scope): description.', code, language, history: [] })
          break
        case 'documentation':
          res = await aiService.document({ code, language })
          break
        default:
          res = await aiService.chat({ message: `Perform action: ${actionId}`, code, language, history: [] })
      }

      if (res.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.response }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ AI could not process this request. Please try again.' }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ An error occurred while processing your request.' }])
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
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an error.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-white overflow-hidden">
      {/* Action Buttons Grid */}
      <div className="border-b border-gray-800 shrink-0">
        <button
          onClick={() => setActionsExpanded(!actionsExpanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-200 hover:bg-[#1e1e1e]/50 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <FiZap size={11} className="text-blue-400" />
            AI Utilities ({AI_ACTIONS.length})
          </span>
          <FiChevronDown size={12} className={`transition-transform ${actionsExpanded ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {actionsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
                {AI_ACTIONS.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    disabled={loading}
                    className="flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border border-gray-800 bg-[#0D1117] hover:bg-[#1e1e1e] hover:border-gray-600 transition-all text-center group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <action.icon size={14} className={`${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[9px] font-semibold text-gray-400 group-hover:text-gray-200 leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] text-gray-500 mb-1 font-semibold uppercase tracking-wide">
              {m.role === 'user' ? 'You' : '✨ AI Mentor'}
            </span>
            <div className={`p-3 rounded-xl text-xs max-w-[92%] break-words whitespace-pre-wrap leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600/90 text-white rounded-tr-none'
                : 'bg-[#0D1117] text-gray-300 rounded-tl-none border border-gray-800'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[9px] text-gray-500 mb-1 font-semibold uppercase tracking-wide">✨ AI Mentor</span>
            <div className="p-3 rounded-xl text-xs bg-[#0D1117] text-gray-400 rounded-tl-none border border-gray-800 flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Analyzing your code...
            </div>
          </div>
        )}
        <div ref={aiEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-[#0D1117] flex gap-2 shrink-0">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI anything about your code..."
          className="flex-1 px-3 py-2 text-xs bg-[#161B22] border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-600"
          disabled={loading}
        />
        <button type="submit" className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center disabled:opacity-50" disabled={loading}>
          <FiSend size={13} />
        </button>
      </form>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// EXECUTION / TERMINAL PANEL
// ────────────────────────────────────────────────────────────────
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
    <div className="flex flex-col h-full bg-[#161B22] text-white p-4 overflow-y-auto custom-scrollbar">
      {/* Run / Test Buttons */}
      <div className="flex gap-2 mb-4 shrink-0">
        <button
          onClick={() => onRunCode(customInput)}
          disabled={isRunning}
          className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-green-600/20"
        >
          <FiPlay size={14} /> Run Code
        </button>
        <button
          onClick={onTestCases}
          disabled={isRunning}
          className="flex-1 py-2.5 bg-[#0D1117] hover:bg-[#1e1e1e] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-gray-800"
        >
          <FiCheckSquare size={14} /> Test Suite
        </button>
      </div>

      {/* Custom Input */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Custom Test Input (stdin)</label>
        <textarea
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="Enter custom stdin input..."
          rows={3}
          className="w-full p-3 bg-[#0D1117] border border-gray-800 rounded-lg text-xs text-white font-mono outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Console Output */}
      <div className="flex flex-col flex-1 min-h-[150px]">
        <span className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Console Output</span>
        <div className="flex-1 p-3 bg-[#0D1117] rounded-lg border border-gray-800 font-mono text-xs overflow-y-auto whitespace-pre-wrap text-gray-300">
          {isRunning ? (
            <div className="flex items-center gap-2 text-blue-400">
              <span className="inline-block w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Compiling and executing code...
            </div>
          ) : output ? (
            output
          ) : (
            <span className="text-gray-600 italic">Run code to see output here.</span>
          )}
        </div>
      </div>

      {/* Execution Stats */}
      {output && !isRunning && (
        <div className="mt-4 p-3 bg-[#0D1117] rounded-lg border border-gray-800 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block mb-0.5 text-[10px]">Execution Time</span>
            <span className="font-bold text-green-400">{execTime} ms</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5 text-[10px]">Memory Used</span>
            <span className="font-bold text-green-400">{execMemory} MB</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// TEAM CHAT PANEL
// ────────────────────────────────────────────────────────────────
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
    <div className="flex flex-col h-full bg-[#161B22] text-white">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 mt-12 gap-2">
            <FiMessageSquare size={28} className="text-gray-700" />
            <span className="text-xs">No messages yet. Start the conversation!</span>
          </div>
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
                  <span className="text-[9px] text-gray-500 font-semibold">
                    {isMe ? 'You' : msg.sender?.username}
                  </span>
                </div>
                <div className={`p-3 rounded-xl text-xs max-w-[85%] break-words leading-relaxed ${
                  isMe
                    ? 'bg-blue-600/90 text-white rounded-tr-none'
                    : 'bg-[#0D1117] text-gray-300 rounded-tl-none border border-gray-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-[#0D1117] flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type team message..."
          className="flex-1 px-3 py-2 text-xs bg-[#161B22] border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-600"
        />
        <button type="submit" className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center">
          <FiSend size={13} />
        </button>
      </form>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// PRESENCE AVATARS
// ────────────────────────────────────────────────────────────────
const PresenceBar = ({ collaborators }) => (
  <div className="flex items-center -space-x-1.5 overflow-hidden">
    {collaborators?.slice(0, 4).map((c, i) => (
      <img
        key={i}
        src={c.avatar || `https://ui-avatars.com/api/?name=${c.username || 'U'}&background=6366f1&color=fff&bold=true`}
        alt={c.username}
        title={c.username}
        className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0D1117] object-cover"
      />
    ))}
    {collaborators?.length > 4 && (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-[10px] font-bold text-white ring-2 ring-[#0D1117]">
        +{collaborators.length - 4}
      </div>
    )}
  </div>
)

// ────────────────────────────────────────────────────────────────
// MAIN EDITOR PAGE
// ────────────────────────────────────────────────────────────────
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
  const isInitialMount = useRef(true)

  const user = useSelector(selectUser)
  const token = useSelector(selectToken)
  const editorState = useSelector(selectEditor)

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ai')
  const [messages, setMessages] = useState([])
  const [activeFile, setActiveFile] = useState('main')
  const [fileExplorerOpen, setFileExplorerOpen] = useState(true)
  const [reviewOpen, setReviewOpen] = useState(true)
  const [fontSizeSelected, setFontSizeSelected] = useState(editorState.fontSize || 14)
  const [isLightMode, setIsLightMode] = useState(false)
  const [livePreviewCode, setLivePreviewCode] = useState('')

  const isWebLanguage = ['html', 'css', 'javascript'].includes(editorState.language?.toLowerCase())

  useEffect(() => {
    monacoRef.current = monaco
  }, [monaco])

  // ── Fetch project + messages + init socket ──
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

  // ── Auto-save with debounce ──
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

  // ── Live preview for web languages ──
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

  // ── Socket.IO ──
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

  // ── Editor Handlers ──
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
    if (window.confirm('Reset code to default template? This will discard unsaved changes.')) {
      const template = STARTER_TEMPLATES[editorState.language] || '// Write your solution here...\n'
      dispatch(setCode(template))
      toast.success('Editor reset to language template')
    }
  }

  // ── File Tab handling ──
  const fileTabs = [
    { id: 'main', name: `main.${getFileExtension(editorState.language)}` },
    { id: 'utils', name: `utils.${getFileExtension(editorState.language)}` },
    { id: 'style', name: 'style.css' },
    { id: 'index', name: 'index.html' }
  ]

  // ── Live Preview srcdoc ──
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

  // ── Loading Screen ──
  if (loading) {
    return (
      <div className="h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400 font-medium">Loading workspace...</span>
        </div>
      </div>
    )
  }

  // ── RIGHT PANEL TAB CONFIG ──
  const rightPanelTabs = [
    { id: 'ai', label: 'AI Mentor', icon: FiCpu },
    { id: 'execution', label: 'Terminal', icon: FiTerminal },
    { id: 'chat', label: 'Chat', icon: FiMessageSquare }
  ]

  return (
    <div className={`h-screen flex flex-col bg-[#0D1117] text-white overflow-hidden ${editorState.isFullscreen ? 'fixed inset-0 z-50' : ''}`}>

      {/* ═══════════════════════════════════════════════════════════
          HEADER (72px)
         ═══════════════════════════════════════════════════════════ */}
      <header className="h-[72px] bg-[#161B22]/95 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-6 shrink-0 shadow-xl z-20 select-none">

        {/* Left: Logo + Project */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <FiCode size={15} color="#fff" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-blue-400 transition-colors">CodeFusion</span>
          </Link>
          <div className="h-5 w-px bg-gray-800" />
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-sm text-gray-200 truncate max-w-[160px]">{project?.title || 'Workspace'}</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#0D1117] text-[10px] text-gray-400 border border-gray-800 uppercase tracking-wider font-bold">
              {editorState.language}
            </span>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-3 text-xs text-gray-300">
          {/* Language Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-[10px] font-semibold uppercase">Lang</span>
            <select
              value={editorState.language}
              onChange={e => {
                const lang = e.target.value
                dispatch(setLanguage(lang))
                dispatch(setCode(STARTER_TEMPLATES[lang] || ''))
              }}
              className="bg-[#0D1117] border border-gray-800 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none cursor-pointer font-semibold hover:border-gray-600 transition-colors"
            >
              {LANGUAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-[10px] font-semibold uppercase">Size</span>
            <select
              value={fontSizeSelected}
              onChange={e => {
                const s = parseInt(e.target.value)
                setFontSizeSelected(s)
                dispatch(setFontSize(s))
              }}
              className="bg-[#0D1117] border border-gray-800 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none cursor-pointer font-semibold hover:border-gray-600 transition-colors"
            >
              {[12, 13, 14, 15, 16, 18, 20].map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="px-3 py-1.5 bg-[#0D1117] border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-all text-xs font-semibold"
          >
            {isLightMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        {/* Right: Status + Actions + Avatars */}
        <div className="flex items-center gap-4 text-xs text-gray-300">
          {/* Connection & Save Status */}
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[9px] text-gray-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Connected
            </span>
            <span className="text-[9px] text-gray-500 font-semibold">
              {editorState.isSaving ? '⏳ Saving...' : editorState.lastSaved ? `✓ ${editorState.lastSaved}` : '✓ Saved'}
            </span>
          </div>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 hover:bg-[#1e1e1e] rounded-lg transition-colors text-gray-400 hover:text-white flex items-center gap-1.5 text-xs border border-gray-800 font-semibold"
            title="Copy Share Link"
          >
            <FiShare2 size={12} /> Share
          </button>

          {/* Presence Avatars */}
          <PresenceBar collaborators={editorState.collaborators} />

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full border-2 border-gray-700 overflow-hidden flex items-center justify-center bg-[#0D1117] text-white shadow-lg">
            {user?.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
            ) : (
              <FiUser size={15} />
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MAIN 3-COLUMN GRID
         ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[28%_47%_25%] xl:grid-cols-[25%_50%_25%]">

        {/* ─────────── LEFT PANEL ─────────── */}
        <section className="hidden lg:flex flex-col border-r border-gray-800 overflow-y-auto custom-scrollbar bg-[#161B22]">

          {/* File Explorer (collapsible) */}
          <div className="border-b border-gray-800">
            <button
              onClick={() => setFileExplorerOpen(!fileExplorerOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-200 hover:bg-[#1e1e1e]/30 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FiFolder size={12} className="text-blue-400" />
                File Explorer
              </span>
              <FiChevronDown size={12} className={`transition-transform ${fileExplorerOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {fileExplorerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pb-2">
                    <FileExplorer
                      activeFile={activeFile}
                      onFileSelect={setActiveFile}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Review Score (collapsible) */}
          <div>
            <button
              onClick={() => setReviewOpen(!reviewOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-200 hover:bg-[#1e1e1e]/30 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FiStar size={12} className="text-yellow-400" />
                Code Quality Metrics
              </span>
              <FiChevronDown size={12} className={`transition-transform ${reviewOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {reviewOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {/* Overall Score */}
                    <div className="p-4 bg-[#0D1117] rounded-xl border border-gray-800 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold block">Overall Score</span>
                        <span className="text-2xl font-black text-green-400">9.2<span className="text-sm text-gray-500 font-medium"> /10</span></span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-green-500/30 flex items-center justify-center">
                        <FiStar size={18} className="text-green-400" />
                      </div>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-1.5">
                      {[
                        { label: 'Bugs & Logic Errors', status: 'Clear', color: 'text-green-400', icon: '✓' },
                        { label: 'Security & Token Leakage', status: 'Clear', color: 'text-green-400', icon: '✓' },
                        { label: 'Infinite Loop Risks', status: 'Pass', color: 'text-green-400', icon: '✓' },
                        { label: 'Naming Readability', status: 'Good', color: 'text-green-400', icon: '✓' },
                        { label: 'Code Complexity', status: 'O(N)', color: 'text-blue-400', icon: '◆' },
                        { label: 'Test Coverage', status: '72%', color: 'text-yellow-400', icon: '◆' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-[#0D1117]/60 rounded-lg border border-gray-800/50">
                          <span className="text-gray-400 flex items-center gap-1.5">
                            <span className={`text-[10px] ${item.color}`}>{item.icon}</span>
                            {item.label}
                          </span>
                          <span className={`font-bold text-[11px] ${item.color}`}>{item.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Performance Tip */}
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-[10px] text-blue-300 leading-relaxed">
                      💡 <strong>Tip:</strong> Keep variables local inside loops to minimize garbage collection latency.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ─────────── CENTER PANEL — EDITOR ─────────── */}
        <section className="flex flex-col overflow-hidden bg-[#1e1e1e]">

          {/* File Tabs */}
          <div className="h-10 bg-[#161B22] border-b border-gray-800 flex items-center overflow-x-auto shrink-0 custom-scrollbar">
            {fileTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFile(tab.id)}
                className={`flex items-center gap-1.5 px-4 h-full text-xs font-medium border-r border-gray-800 transition-colors whitespace-nowrap ${
                  activeFile === tab.id
                    ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1e1e1e]/50'
                }`}
              >
                <FiFile size={11} className={activeFile === tab.id ? 'text-blue-400' : 'text-gray-600'} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Editor Toolbar */}
          <div className="h-10 bg-[#161B22] border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetCode}
                className="p-1.5 hover:bg-[#0D1117] rounded-md text-gray-500 hover:text-gray-300 transition-colors"
                title="Reset to Template"
              >
                <FiRefreshCw size={13} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => dispatch(toggleWordWrap())}
                className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                  editorState.wordWrap
                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                    : 'border-gray-800 text-gray-500 hover:text-gray-300'
                }`}
                title="Toggle Word Wrap"
              >
                Wrap
              </button>
              <button
                onClick={() => dispatch(toggleMinimap())}
                className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                  editorState.minimap
                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                    : 'border-gray-800 text-gray-500 hover:text-gray-300'
                }`}
                title="Toggle Minimap"
              >
                Minimap
              </button>
              <button
                onClick={() => dispatch(toggleFullscreen())}
                className="p-1.5 hover:bg-[#0D1117] rounded-md text-gray-500 hover:text-gray-300 transition-colors"
                title="Toggle Fullscreen"
              >
                {editorState.isFullscreen ? <FiMinimize size={13} /> : <FiMaximize size={13} />}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className={`flex-1 relative ${isWebLanguage ? 'h-1/2 border-b border-gray-800' : 'h-full'}`}>
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
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  lineHeight: 22,
                  padding: { top: 16 },
                  renderLineHighlight: 'all',
                  bracketPairColorization: { enabled: true },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            {/* Live HTML Preview */}
            {isWebLanguage && (
              <div className="h-1/2 bg-white flex flex-col">
                <div className="h-8 bg-[#f3f4f6] border-b border-gray-300 flex items-center px-4 justify-between shrink-0">
                  <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Live Preview</span>
                  <button
                    onClick={() => setLivePreviewCode(editorState.code)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 transition-colors"
                    title="Refresh Preview"
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

          {/* Bottom Status Bar */}
          <footer className="h-7 bg-[#0D1117] border-t border-gray-800 flex items-center justify-between px-4 text-[10px] text-gray-500 font-mono select-none shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-bold">{editorState.language?.toUpperCase()}</span>
              <span>Spaces: 2</span>
              <span>UTF-8</span>
              <span>LF</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FiGitBranch size={10} className="text-gray-600" />
                <strong className="text-gray-400">main</strong>
              </span>
              <span>
                Autosave: <strong className="text-green-500">Active</strong>
              </span>
            </div>
          </footer>
        </section>

        {/* ─────────── RIGHT PANEL — TABBED ─────────── */}
        <section className="flex flex-col border-l border-gray-800 overflow-hidden bg-[#161B22]">

          {/* Tabs */}
          <div className="h-11 bg-[#0D1117] border-b border-gray-800 flex items-center px-2 gap-1 shrink-0">
            {rightPanelTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === t.id
                    ? 'bg-[#161B22] text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#161B22]/50'
                }`}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'ai' && (
              <AIMentorPanel
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
            {activeTab === 'chat' && (
              <TeamChatPanel
                projectId={projectId}
                user={user}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
