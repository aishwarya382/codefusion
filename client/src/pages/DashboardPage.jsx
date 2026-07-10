// client/src/pages/DashboardPage.jsx (REDESIGNED SIDEBAR, FEED & INTERACTIVE LESSONS)
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus, FiCode, FiClock, FiActivity, FiUsers, FiMoreVertical,
  FiArrowRight, FiZap, FiTrendingUp, FiStar, FiGitBranch,
  FiPlay, FiFolder, FiSearch, FiGlobe, FiArchive, FiX, FiLayers,
  FiBookOpen, FiSmile, FiHeart, FiMessageSquare, FiSettings, FiUser, FiBell, FiGrid
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import { selectUser } from '../store/slices/authSlice'
import { projectService } from '../services'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Input } from '../components/ui/Input'
import { toast } from 'react-hot-toast'

const langColors = {
  javascript: '#F7DF1E', typescript: '#3178C6', python: '#3776AB',
  java: '#ED8B00', cpp: '#00599C', rust: '#CE422B', go: '#00ADD8',
  default: '#6B7280',
}

// ────── MOCK DATA FOR THE NEW FEATURES ──────
const ACTIVE_FRIENDS = [
  { username: 'alex_dev', status: 'online', avatar: 'https://ui-avatars.com/api/?name=Alex&background=58A6FF&color=fff' },
  { username: 'sarah_code', status: 'online', avatar: 'https://ui-avatars.com/api/?name=Sarah&background=A371F7&color=fff' },
  { username: 'brandon_99', status: 'offline', avatar: 'https://ui-avatars.com/api/?name=Brandon&background=6b7280&color=fff' }
]

const COMMUNITY_FEED = [
  {
    id: 1,
    author: 'sara_dev',
    avatar: 'https://ui-avatars.com/api/?name=Sara&background=3FB950&color=fff',
    title: 'Exploring Async/Await Performance in JavaScript',
    snippet: `async function fetchData() {\n  const user = await api.getUser();\n  const stats = await api.getStats(user.id);\n  return { user, stats };\n}`,
    likes: 24,
    comments: 8,
    time: '2 hours ago'
  },
  {
    id: 2,
    author: 'mike_t',
    avatar: 'https://ui-avatars.com/api/?name=Mike&background=F0883E&color=fff',
    title: 'Python List Comprehensions vs Map Filter Speedups',
    snippet: `# Standard Map Filter\nfiltered = map(lambda x: x * 2, filter(lambda x: x % 2 == 0, nums))\n# Comprehension\nfiltered = [x * 2 for x in nums if x % 2 == 0]`,
    likes: 42,
    comments: 11,
    time: '1 day ago'
  }
]

const LEARNING_RESOURCES = {
  java: [
    { title: 'Variables & Data Types', desc: 'Understand Java primitives, references, static memory bounds, and variable declarations.', snippet: 'int score = 100;\nString username = "Sarah";\nfinal double PI = 3.14159;' },
    { title: 'Object-Oriented Programming (OOP)', desc: 'Learn the pillars of OOP: inheritance, encapsulation, polymorphism, and abstraction.', snippet: 'public class Animal {\n    protected String name;\n    public abstract void makeSound();\n}' }
  ],
  python: [
    { title: 'Lists, Tuples & Dicts', desc: 'Master Python collections, indexing, slicing, dict lookups, and iteration.', snippet: 'fruits = ["apple", "banana"]\nuser_profile = {"id": 1, "username": "alex"}' },
    { title: 'List Comprehensions', desc: 'Write clean, pythonic list generation statements with optional filters.', snippet: 'squares = [x**2 for x in range(10) if x % 2 == 0]' }
  ],
  javascript: [
    { title: 'Promises & Async/Await', desc: 'Handle asynchronous operations cleanly using Promise chains and try-catch async blocks.', snippet: 'const fetchUser = async (id) => {\n  try {\n    const res = await fetch(`/api/users/${id}`);\n    return await res.json();\n  } catch (err) { console.error(err); }\n}' }
  ]
}

export default function DashboardPage() {
  const user = useSelector(selectUser)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'dashboard'
  const isCreateOpen = searchParams.get('new') === 'true'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Creation form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isPublic, setIsPublic] = useState(false)
  const [creating, setCreating] = useState(false)

  // Learning section selected language
  const [learningLang, setLearningLang] = useState('javascript')

  // Feed comment/likes state
  const [feedPosts, setFeedPosts] = useState(COMMUNITY_FEED)

  useEffect(() => {
    fetchProjects()
  }, [tab])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      let res
      if (tab === 'explore') {
        res = await projectService.explore()
      } else if (tab === 'archived') {
        res = await projectService.getAll({ archived: true })
      } else {
        res = await projectService.getAll()
      }
      if (res.success) setProjects(res.projects)
    } catch (err) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Project title is required')
    setCreating(true)
    try {
      const res = await projectService.create({ title, description, language, isPublic })
      if (res.success) {
        toast.success('Project created successfully!')
        closeCreateModal()
        navigate(`/editor/${res.project._id}`)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const closeCreateModal = () => {
    setSearchParams(prev => {
      prev.delete('new')
      return prev
    })
    setTitle('')
    setDescription('')
    setLanguage('javascript')
    setIsPublic(false)
  }

  const handleLikePost = (id) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === id) {
        return { ...post, likes: post.likes + 1 }
      }
      return post
    }))
    toast.success('Snippet liked!')
  }

  const stats = [
    { icon: FiFolder, label: 'Projects', value: user?.stats?.projectsCreated || 0, color: '#58A6FF' },
    { icon: FiClock, label: 'Hours Coded', value: user?.stats?.hoursCoded || 0, color: '#A371F7' },
    { icon: FiUsers, label: 'Collaborations', value: user?.stats?.collaborators || 0, color: '#3FB950' },
    { icon: FiZap, label: 'AI Reviews', value: user?.stats?.aiUsage || 0, color: '#F0883E' },
  ]

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans flex flex-col">
      <Navbar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Modern Minimalist Sidebar Menu */}
        <aside className="w-64 bg-[#161B22] border-r border-gray-800 flex flex-col py-6 shrink-0">
          <div className="px-6 mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#58A6FF]">Navigation</span>
          </div>

          <nav className="flex-1 flex flex-col gap-1 px-3">
            {[
              { id: 'dashboard', label: 'Home Dashboard', icon: FiGrid },
              { id: 'projects', label: 'My Projects', icon: FiFolder },
              { id: 'explore', label: 'Community Feed', icon: FiGlobe },
              { id: 'learning', label: 'Learning Section', icon: FiBookOpen },
              { id: 'friends', label: 'Friends & Groups', icon: FiUsers }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSearchParams({ tab: item.id })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${tab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/25' : 'text-gray-400 hover:text-white hover:bg-gray-800/40'}`}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-6 mt-auto pt-6 border-t border-gray-850 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'U'}`} className="w-8 h-8 rounded-full border border-gray-700" alt="" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-200 block truncate">{user?.username}</span>
                <span className="text-[9px] text-[#58A6FF] block font-semibold uppercase tracking-wider">{user?.role || 'Developer'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dashboard Center View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {tab === 'dashboard' && (
            <div className="flex flex-col gap-8">
              {/* Top Banner Greeting */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Welcome back, {user?.username}!</h1>
                  <p className="text-xs text-gray-400 mt-1">Review active group project channels or study dynamic code tutorials.</p>
                </div>
                <Button 
                  onClick={() => setSearchParams({ new: 'true' })}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold py-2.5 px-4 shadow-lg shadow-blue-900/25 flex items-center gap-2"
                >
                  <FiPlus size={14} /> New Project
                </Button>
              </div>

              {/* Responsive Dashboard Widgets grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((st, i) => (
                  <div key={i} className="p-4 bg-[#161B22] border border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">{st.label}</span>
                      <span className="text-xl font-extrabold text-white">{st.value}</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gray-800/40 flex items-center justify-center text-white">
                      <st.icon size={15} style={{ color: st.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Dashboard Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Recent Workspaces (Spans 2 columns) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Active Workspace Projects</span>
                    <button onClick={() => setSearchParams({ tab: 'projects' })} className="text-[10px] text-[#58A6FF] font-semibold hover:underline flex items-center gap-1">
                      See All <FiArrowRight size={10} />
                    </button>
                  </div>

                  {projects.length === 0 ? (
                    <div className="p-8 bg-[#161B22] border border-gray-800 rounded-2xl text-center text-gray-400 text-xs">
                      No active workspaces found. Create a project to start collaborating with friends!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.slice(0, 4).map((p, idx) => (
                        <div key={p._id} className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h3 className="font-extrabold text-sm text-white truncate max-w-[150px]">{p.title}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[9px] font-semibold uppercase text-gray-400 border border-gray-750">
                                {p.language}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                              {p.description || 'No description provided.'}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-850">
                            <span className="text-[10px] text-gray-500">Active members: {p.members?.length || 1}</span>
                            <Link to={`/editor/${p._id}`} className="px-3 py-1 bg-[#1e293b] hover:bg-gray-800 rounded-lg text-[10px] font-bold text-white transition-colors">
                              Join Editor
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Panel: Active Friends & Groups (Spans 1 column) */}
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Active Friends</span>
                  <div className="p-4 bg-[#161B22] border border-gray-800 rounded-2xl flex flex-col gap-4 shadow-sm">
                    {ACTIVE_FRIENDS.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={f.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                          <span className="font-bold text-gray-200">@{f.username}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${f.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                          <span className="text-[10px] text-gray-400 capitalize">{f.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* tab explore: Community feed */}
          {tab === 'explore' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              <div className="mb-4">
                <h1 className="text-2xl font-black text-white">Community Developer Feed</h1>
                <p className="text-xs text-gray-400 mt-1">Read and review code snippets, logs, and tutorials published by other users.</p>
              </div>

              {feedPosts.map((post) => (
                <div key={post.id} className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={post.avatar} className="w-8 h-8 rounded-full border border-gray-700 object-cover" alt="" />
                      <div>
                        <span className="text-xs font-bold text-gray-200">@{post.author}</span>
                        <span className="text-[10px] text-gray-500 block">{post.time}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-2">{post.title}</h3>
                    <pre className="p-4 bg-[#0d1117] rounded-xl border border-gray-850 font-mono text-[11px] leading-relaxed text-gray-300 overflow-x-auto">
                      {post.snippet}
                    </pre>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-gray-850 text-xs text-gray-400">
                    <button onClick={() => handleLikePost(post.id)} className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                      <FiHeart size={14} /> <span>{post.likes}</span>
                    </button>
                    <span className="flex items-center gap-1.5">
                      <FiMessageSquare size={14} /> <span>{post.comments} comments</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* tab learning: Tutorial Guides */}
          {tab === 'learning' && (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              <div className="mb-4">
                <h1 className="text-2xl font-black text-white">Interactive Learning Guides</h1>
                <p className="text-xs text-gray-400 mt-1">Select a programming language to browse explanations, examples, and study templates.</p>
              </div>

              {/* Language selectors */}
              <div className="flex gap-2 border-b border-gray-800 pb-3 shrink-0">
                {['javascript', 'python', 'java'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLearningLang(lang)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${learningLang === lang ? 'bg-[#161B22] text-blue-400 border border-gray-750' : 'text-gray-400 hover:text-white'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-6 mt-4">
                {LEARNING_RESOURCES[learningLang].map((res, i) => (
                  <div key={i} className="p-6 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm flex flex-col gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white mb-1.5">{res.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{res.desc}</p>
                    </div>

                    <pre className="p-4 bg-[#0d1117] rounded-xl border border-gray-850 font-mono text-[11px] leading-relaxed text-gray-300 overflow-x-auto">
                      {res.snippet}
                    </pre>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] text-gray-500 font-medium">Includes AI Mentor Review</span>
                      <button 
                        onClick={() => {
                          toast.success('Starting interactive snippet workspace...');
                          setSearchParams({ tab: 'dashboard' });
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-bold text-white transition-colors"
                      >
                        Try Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* standard tabs fallback */}
          {tab === 'projects' && (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              <h1 className="text-2xl font-black text-white">My Workspace Projects</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p, index) => {
                  const langColor = langColors[p.language?.toLowerCase()] || langColors.default
                  return (
                    <div key={p._id} className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-extrabold text-sm text-white truncate">{p.title}</h3>
                          <span style={{ color: langColor }} className="text-[10px] font-extrabold uppercase">{p.language}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-850">
                        <span className="text-[10px] text-gray-500">Members: {p.members?.length || 1}</span>
                        <Link to={`/editor/${p._id}`} className="px-3.5 py-1.5 bg-[#1e293b] hover:bg-gray-800 rounded-xl text-[10px] font-bold text-white transition-colors">
                          Open Editor
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Reusable Create Workspace modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 bg-[#161B22] border border-gray-800 rounded-2xl shadow-2xl text-white"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-blue-450">Create New Project</span>
                <button onClick={closeCreateModal} className="text-gray-450 hover:text-white"><FiX size={16} /></button>
              </div>

              <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Project Title</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="my-cool-app"
                    className="w-full px-3.5 py-2 bg-[#0D1117] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Description</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what your workspace does..."
                    rows={3}
                    className="w-full px-3.5 py-2 bg-[#0D1117] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Programming Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0D1117] border border-gray-800 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="html">HTML/CSS</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    id="isPublic"
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 focus:ring-0"
                  />
                  <label htmlFor="isPublic" className="text-xs text-gray-300">Make this project public for community exploration</label>
                </div>

                <Button 
                  type="submit" 
                  disabled={creating}
                  className="w-full bg-blue-650 hover:bg-blue-600 rounded-xl py-2.5 font-bold text-xs shadow-lg text-white mt-2"
                >
                  {creating ? 'Building Workspace...' : 'Build Workspace'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
