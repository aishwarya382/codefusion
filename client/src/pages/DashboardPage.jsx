// client/src/pages/DashboardPage.jsx — Premium v5.0 VS Code-Inspired Dashboard
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus, FiCode, FiClock, FiActivity, FiUsers, FiArrowRight,
  FiZap, FiTrendingUp, FiFolder, FiSearch, FiGlobe, FiX,
  FiBookOpen, FiHeart, FiMessageSquare, FiGrid, FiCalendar,
  FiCpu, FiLayers, FiPlay, FiGitBranch, FiStar, FiTerminal
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import { selectUser } from '../store/slices/authSlice'
import { projectService } from '../services'
import { Button } from '../components/ui/Button'

/* ═══════════════════════════════════════════════════════════
   COLOUR PALETTE & LANGUAGE MAP
   ═══════════════════════════════════════════════════════════ */
const langColors = {
  javascript: '#F7DF1E', typescript: '#3178C6', python: '#3776AB',
  java: '#ED8B00', cpp: '#00599C', rust: '#CE422B', go: '#00ADD8',
  html: '#E34F26', default: '#6B7280',
}

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════ */
const ACTIVE_FRIENDS = [
  { username: 'alex_dev',   status: 'online',  avatar: 'https://ui-avatars.com/api/?name=Alex&background=58A6FF&color=fff',   coding: 'React Dashboard' },
  { username: 'sarah_code', status: 'online',  avatar: 'https://ui-avatars.com/api/?name=Sarah&background=A371F7&color=fff',  coding: 'Python ML Model' },
  { username: 'brandon_99', status: 'idle',    avatar: 'https://ui-avatars.com/api/?name=Brandon&background=F0883E&color=fff', coding: null },
  { username: 'jenny_js',   status: 'online',  avatar: 'https://ui-avatars.com/api/?name=Jenny&background=3FB950&color=fff',  coding: 'Node.js API' },
  { username: 'chris_cpp',  status: 'offline', avatar: 'https://ui-avatars.com/api/?name=Chris&background=6b7280&color=fff',  coding: null },
]

const COMMUNITY_FEED = [
  {
    id: 1, author: 'sara_dev',
    avatar: 'https://ui-avatars.com/api/?name=Sara&background=3FB950&color=fff',
    title: 'Exploring Async/Await Performance in JavaScript',
    snippet: `async function fetchData() {\n  const user = await api.getUser();\n  const stats = await api.getStats(user.id);\n  return { user, stats };\n}`,
    likes: 24, comments: 8, time: '2 hours ago',
  },
  {
    id: 2, author: 'mike_t',
    avatar: 'https://ui-avatars.com/api/?name=Mike&background=F0883E&color=fff',
    title: 'Python List Comprehensions vs Map/Filter',
    snippet: `# Standard Map Filter\nfiltered = map(lambda x: x * 2, filter(lambda x: x % 2 == 0, nums))\n# Comprehension\nfiltered = [x * 2 for x in nums if x % 2 == 0]`,
    likes: 42, comments: 11, time: '1 day ago',
  },
  {
    id: 3, author: 'luna_rs',
    avatar: 'https://ui-avatars.com/api/?name=Luna&background=CE422B&color=fff',
    title: 'Rust Ownership Model Explained Simply',
    snippet: `fn main() {\n    let s1 = String::from("hello");\n    let s2 = s1; // s1 is MOVED\n    // println!("{}", s1); // ERROR!\n    println!("{}", s2); // OK\n}`,
    likes: 67, comments: 19, time: '3 days ago',
  },
]

const LEARNING_RESOURCES = {
  javascript: [
    { title: 'Promises & Async/Await', desc: 'Handle asynchronous operations cleanly using Promise chains and modern async/await syntax with proper error handling.', snippet: `const fetchUser = async (id) => {\n  try {\n    const res = await fetch(\`/api/users/\${id}\`);\n    return await res.json();\n  } catch (err) {\n    console.error('Fetch failed:', err);\n  }\n}` },
    { title: 'Closures & Scope', desc: 'Understand how JavaScript closures capture variables and the difference between var, let, and const scoping.', snippet: `function counter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    getCount: () => count\n  };\n}\nconst c = counter();\nc.increment(); // 1` },
    { title: 'ES6 Destructuring', desc: 'Extract values from arrays and objects with concise, readable syntax.', snippet: `const { name, age, ...rest } = user;\nconst [first, , third] = items;\nconst greet = ({ name = 'World' }) =>\n  \`Hello \${name}!\`;` },
  ],
  python: [
    { title: 'Lists, Tuples & Dicts', desc: 'Master Python collections, indexing, slicing, dict lookups, and iteration patterns.', snippet: `fruits = ["apple", "banana", "cherry"]\nuser = {"id": 1, "name": "alex"}\nfor key, val in user.items():\n    print(f"{key}: {val}")` },
    { title: 'List Comprehensions', desc: 'Write clean, pythonic list generation with optional conditional filters.', snippet: `squares = [x**2 for x in range(10) if x % 2 == 0]\nflat = [x for row in matrix for x in row]\nnames = [u['name'].upper() for u in users]` },
    { title: 'Decorators', desc: 'Wrap functions with reusable behaviour using Python decorator syntax.', snippet: `def timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"Took {time.time()-start:.2f}s")\n        return result\n    return wrapper\n\n@timer\ndef slow_fn(): ...` },
  ],
  java: [
    { title: 'Variables & Data Types', desc: 'Understand Java primitives, references, static typing, and variable declarations.', snippet: `int score = 100;\nString username = "Sarah";\nfinal double PI = 3.14159;\nboolean isActive = true;` },
    { title: 'OOP Fundamentals', desc: 'Learn inheritance, encapsulation, polymorphism, and abstraction through practical examples.', snippet: `public abstract class Shape {\n    protected String color;\n    public abstract double area();\n}\npublic class Circle extends Shape {\n    private double radius;\n    public double area() {\n        return Math.PI * radius * radius;\n    }\n}` },
  ],
  cpp: [
    { title: 'Pointers & Memory', desc: 'Understand raw pointers, references, dynamic allocation, and smart pointers in modern C++.', snippet: `int x = 42;\nint* ptr = &x;\nstd::unique_ptr<int> sp =\n    std::make_unique<int>(100);\nstd::cout << *sp; // 100` },
    { title: 'STL Containers', desc: 'Use vector, map, set, and algorithms from the Standard Template Library.', snippet: `std::vector<int> nums = {3,1,4,1,5};\nstd::sort(nums.begin(), nums.end());\nstd::map<std::string, int> scores;\nscores["alice"] = 95;` },
  ],
}

const FRIEND_GROUPS = [
  { name: 'Algorithm Study Group', members: 12, icon: '🧠', activity: 'Discussing DP problems' },
  { name: 'Web Dev Club', members: 28, icon: '🌐', activity: 'Building a hackathon project' },
  { name: 'Open Source Contributors', members: 45, icon: '🚀', activity: 'Reviewing PRs on GitHub' },
]

const WEEKLY_ACTIVITY = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 4.0 },
  { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 5.0 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 6.0 },
  { day: 'Sun', hours: 2.0 },
]

/* ═══════════════════════════════════════════════════════════
   SIDEBAR NAV ITEMS
   ═══════════════════════════════════════════════════════════ */
const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Home',            icon: FiGrid },
  { id: 'projects',  label: 'My Projects',     icon: FiFolder },
  { id: 'explore',   label: 'Community Feed',  icon: FiGlobe },
  { id: 'learning',  label: 'Learning Center', icon: FiBookOpen },
  { id: 'friends',   label: 'Friends & Groups', icon: FiUsers },
  { id: 'ai',        label: 'AI Mentor',       icon: FiCpu },
]

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════ */
const fadeSlide = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

/* ═══════════════════════════════════════════════════════════
   WEEKLY ACTIVITY CHART WIDGET
   ═══════════════════════════════════════════════════════════ */
function WeeklyActivityChart() {
  const maxH = Math.max(...WEEKLY_ACTIVITY.map(d => d.hours))
  return (
    <div className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <FiActivity size={13} className="text-emerald-400" /> Weekly Activity
        </span>
        <span className="text-[10px] text-gray-500">
          {WEEKLY_ACTIVITY.reduce((s, d) => s + d.hours, 0).toFixed(1)}h total
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 h-28">
        {WEEKLY_ACTIVITY.map((d, i) => {
          const pct = (d.hours / maxH) * 100
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[9px] text-gray-500 font-semibold">{d.hours}h</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: 'easeOut' }}
                className="w-full rounded-lg min-h-[4px]"
                style={{
                  background: `linear-gradient(to top, #1e3a5f, #58A6FF)`,
                  opacity: 0.6 + (pct / 100) * 0.4,
                }}
              />
              <span className="text-[9px] text-gray-500 font-bold">{d.day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DAILY CODING PROGRESS RING
   ═══════════════════════════════════════════════════════════ */
function CodingProgressRing() {
  const target = 8
  const current = 5.2
  const pct = Math.min((current / target) * 100, 100)
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm flex flex-col items-center gap-3">
      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider self-start flex items-center gap-2">
        <FiClock size={13} className="text-purple-400" /> Daily Goal
      </span>
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#21262d" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r={r} fill="none"
            stroke="url(#progressGradient)" strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A371F7" />
              <stop offset="100%" stopColor="#58A6FF" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white">{current}h</span>
          <span className="text-[9px] text-gray-500 font-semibold">of {target}h</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400">{pct.toFixed(0)}% of daily goal</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const user = useSelector(selectUser)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'dashboard'
  const isCreateOpen = searchParams.get('new') === 'true'

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Create-project form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isPublic, setIsPublic] = useState(false)
  const [creating, setCreating] = useState(false)

  // Learning language selector
  const [learningLang, setLearningLang] = useState('javascript')

  // Feed interactions
  const [feedPosts, setFeedPosts] = useState(COMMUNITY_FEED)

  /* ─── DATA FETCH ─── */
  useEffect(() => {
    fetchProjects()
  }, [tab])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      let res
      if (tab === 'explore') {
        res = await projectService.explore()
      } else {
        res = await projectService.getAll()
      }
      if (res.success) setProjects(res.projects)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  /* ─── CREATE PROJECT ─── */
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
    setSearchParams(prev => { prev.delete('new'); return prev })
    setTitle('')
    setDescription('')
    setLanguage('javascript')
    setIsPublic(false)
  }

  /* ─── FEED LIKE ─── */
  const handleLikePost = (id) => {
    setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
    toast.success('Snippet liked!')
  }

  /* ─── STATS ─── */
  const stats = [
    { icon: FiFolder,   label: 'Projects',       value: user?.stats?.projectsCreated || 0, color: '#58A6FF', bg: 'from-blue-900/30 to-blue-800/10' },
    { icon: FiClock,    label: 'Hours Coded',     value: user?.stats?.hoursCoded || 0,      color: '#A371F7', bg: 'from-purple-900/30 to-purple-800/10' },
    { icon: FiUsers,    label: 'Collaborations',  value: user?.stats?.collaborators || 0,   color: '#3FB950', bg: 'from-green-900/30 to-green-800/10' },
    { icon: FiZap,      label: 'AI Reviews',      value: user?.stats?.aiUsage || 0,         color: '#F0883E', bg: 'from-orange-900/30 to-orange-800/10' },
  ]

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* ──────────────────── SIDEBAR ──────────────────── */}
        <aside className="w-64 bg-[#161B22] border-r border-gray-800 flex flex-col py-6 shrink-0">
          <div className="px-6 mb-5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#58A6FF] flex items-center gap-2">
              <FiTerminal size={11} /> Navigation
            </span>
          </div>

          <nav className="flex-1 flex flex-col gap-1 px-3">
            {SIDEBAR_NAV.map(item => (
              <button
                key={item.id}
                onClick={() => setSearchParams({ tab: item.id })}
                className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left
                  ${tab === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              >
                <item.icon size={15} className={tab === item.id ? '' : 'group-hover:text-blue-400 transition-colors'} />
                <span>{item.label}</span>
                {tab === item.id && (
                  <motion.div layoutId="sidebar-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar quick action */}
          <div className="px-3 mb-4">
            <button
              onClick={() => setSearchParams({ new: 'true' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/25 transition-all duration-200"
            >
              <FiPlus size={14} /> New Project
            </button>
          </div>

          {/* User card */}
          <div className="px-5 pt-5 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=161B22&color=58A6FF`}
                className="w-9 h-9 rounded-full border-2 border-gray-700 shadow-md"
                alt=""
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-200 truncate">{user?.username}</span>
                <span className="text-[9px] text-[#58A6FF] font-bold uppercase tracking-wider">{user?.role || 'Developer'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ──────────────────── MAIN CONTENT ──────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#21262d #0D1117' }}>
          <AnimatePresence mode="wait">

            {/* ══════════ DASHBOARD TAB ══════════ */}
            {tab === 'dashboard' && (
              <motion.div key="dashboard" {...fadeSlide} className="flex flex-col gap-8">
                {/* Greeting Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-[#161B22] via-[#161B22] to-[#0f2035] p-6 md:p-8">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Welcome back, {user?.username || 'Developer'}
                        <motion.span animate={{ rotate: [0, 14, -8, 14, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}>
                          👋
                        </motion.span>
                      </h1>
                      <p className="text-sm text-gray-400 mt-1.5 max-w-lg">
                        Your coding workspace is ready. Pick up where you left off or start something new.
                      </p>
                    </div>
                    <Button
                      onClick={() => setSearchParams({ new: 'true' })}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold py-2.5 px-5 shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all duration-200"
                    >
                      <FiPlus size={14} /> New Project
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((st, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItem}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      className={`p-5 bg-gradient-to-br ${st.bg} border border-gray-800 rounded-2xl flex items-center justify-between shadow-sm cursor-default`}
                    >
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">{st.label}</span>
                        <span className="text-2xl font-black text-white">{st.value}</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center">
                        <st.icon size={18} style={{ color: st.color }} />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Main 2-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Continue Coding (2 cols) */}
                  <div className="lg:col-span-2 flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <FiPlay size={12} className="text-blue-400" /> Continue Coding
                      </span>
                      <button
                        onClick={() => setSearchParams({ tab: 'projects' })}
                        className="text-[10px] text-[#58A6FF] font-semibold hover:underline flex items-center gap-1"
                      >
                        See All <FiArrowRight size={10} />
                      </button>
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-40 bg-[#161B22] border border-gray-800 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="p-10 bg-[#161B22] border border-gray-800 border-dashed rounded-2xl text-center">
                        <FiFolder size={32} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-sm text-gray-400 font-medium">No projects yet</p>
                        <p className="text-xs text-gray-500 mt-1">Create your first project to start coding!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.slice(0, 4).map(p => {
                          const lc = langColors[p.language?.toLowerCase()] || langColors.default
                          return (
                            <motion.div
                              key={p._id}
                              whileHover={{ y: -3, borderColor: '#30363d' }}
                              className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between transition-colors"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <h3 className="font-extrabold text-sm text-white truncate max-w-[170px]">{p.title}</h3>
                                  <span
                                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border"
                                    style={{ color: lc, borderColor: `${lc}33`, backgroundColor: `${lc}11` }}
                                  >
                                    {p.language}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                                  {p.description || 'No description provided.'}
                                </p>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-gray-800/50">
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                  <FiUsers size={10} /> {p.members?.length || 1} member{(p.members?.length || 1) > 1 ? 's' : ''}
                                </span>
                                <Link
                                  to={`/editor/${p._id}`}
                                  className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                                >
                                  <FiCode size={10} /> Open Editor
                                </Link>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}

                    {/* Weekly Activity Chart */}
                    <WeeklyActivityChart />
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col gap-5">
                    {/* Active Friends */}
                    <div className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <FiUsers size={12} className="text-green-400" /> Active Friends
                      </span>
                      <div className="flex flex-col gap-3">
                        {ACTIVE_FRIENDS.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <img src={f.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#161B22] ${
                                  f.status === 'online' ? 'bg-green-500' : f.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                                }`} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-200">@{f.username}</span>
                                {f.coding && <span className="text-[9px] text-gray-500 truncate max-w-[120px]">{f.coding}</span>}
                              </div>
                            </div>
                            <span className={`text-[9px] font-semibold capitalize ${
                              f.status === 'online' ? 'text-green-400' : f.status === 'idle' ? 'text-yellow-400' : 'text-gray-500'
                            }`}>
                              {f.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Daily Coding Progress */}
                    <CodingProgressRing />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════ PROJECTS TAB ══════════ */}
            {tab === 'projects' && (
              <motion.div key="projects" {...fadeSlide} className="flex flex-col gap-6 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                      <FiFolder className="text-blue-400" /> My Projects
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">All your workspaces and collaborative projects.</p>
                  </div>
                  <Button
                    onClick={() => setSearchParams({ new: 'true' })}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold py-2.5 px-5 shadow-lg shadow-blue-900/30 flex items-center gap-2"
                  >
                    <FiPlus size={14} /> New Project
                  </Button>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-44 bg-[#161B22] border border-gray-800 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="p-12 bg-[#161B22] border border-gray-800 border-dashed rounded-2xl text-center">
                    <FiFolder size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-sm text-gray-400 font-medium">No projects found</p>
                    <p className="text-xs text-gray-500 mt-1">Create one to get started!</p>
                  </div>
                ) : (
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(p => {
                      const lc = langColors[p.language?.toLowerCase()] || langColors.default
                      return (
                        <motion.div
                          key={p._id}
                          variants={staggerItem}
                          whileHover={{ y: -3 }}
                          className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h3 className="font-extrabold text-sm text-white truncate">{p.title}</h3>
                              <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border shrink-0"
                                style={{ color: lc, borderColor: `${lc}33`, backgroundColor: `${lc}11` }}
                              >
                                {p.language}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                              {p.description || 'No description provided.'}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-800/50">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <FiUsers size={10} /> {p.members?.length || 1} member{(p.members?.length || 1) > 1 ? 's' : ''}
                            </span>
                            <Link
                              to={`/editor/${p._id}`}
                              className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                            >
                              <FiCode size={10} /> Open Editor
                            </Link>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══════════ EXPLORE TAB ══════════ */}
            {tab === 'explore' && (
              <motion.div key="explore" {...fadeSlide} className="max-w-2xl mx-auto flex flex-col gap-6">
                <div className="mb-2">
                  <h1 className="text-2xl font-black text-white flex items-center gap-3">
                    <FiGlobe className="text-green-400" /> Community Feed
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">Discover code snippets, tutorials, and discussions from the community.</p>
                </div>

                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-5">
                  {feedPosts.map(post => (
                    <motion.div
                      key={post.id}
                      variants={staggerItem}
                      className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm flex flex-col gap-4 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={post.avatar} className="w-9 h-9 rounded-full border border-gray-700 object-cover" alt="" />
                          <div>
                            <span className="text-xs font-bold text-gray-200">@{post.author}</span>
                            <span className="text-[10px] text-gray-500 block flex items-center gap-1">
                              <FiClock size={9} /> {post.time}
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-500 hover:text-white transition-colors">
                          <FiStar size={14} />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-white mb-3">{post.title}</h3>
                        <pre className="p-4 bg-[#0d1117] rounded-xl border border-gray-800 font-mono text-[11px] leading-relaxed text-green-300/80 overflow-x-auto">
                          {post.snippet}
                        </pre>
                      </div>

                      <div className="flex items-center gap-5 pt-3 border-t border-gray-800/50 text-xs text-gray-400">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center gap-1.5 hover:text-red-400 transition-colors group"
                        >
                          <FiHeart size={14} className="group-hover:fill-red-400" /> <span>{post.likes}</span>
                        </button>
                        <span className="flex items-center gap-1.5">
                          <FiMessageSquare size={14} /> <span>{post.comments} comments</span>
                        </span>
                        <button className="ml-auto flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                          <FiGitBranch size={13} /> Fork
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ══════════ LEARNING TAB ══════════ */}
            {tab === 'learning' && (
              <motion.div key="learning" {...fadeSlide} className="flex flex-col gap-6 max-w-4xl mx-auto">
                <div className="mb-2">
                  <h1 className="text-2xl font-black text-white flex items-center gap-3">
                    <FiBookOpen className="text-yellow-400" /> Learning Center
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">Interactive tutorials and code examples across multiple languages.</p>
                </div>

                {/* Language Tabs */}
                <div className="flex gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
                  {['javascript', 'python', 'java', 'cpp'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLearningLang(lang)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap
                        ${learningLang === lang
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/25'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: langColors[lang] || langColors.default }} />
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>

                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-5">
                  {(LEARNING_RESOURCES[learningLang] || []).map((res, i) => (
                    <motion.div
                      key={`${learningLang}-${i}`}
                      variants={staggerItem}
                      className="p-6 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm flex flex-col gap-4 hover:border-gray-700 transition-colors"
                    >
                      <div>
                        <h3 className="text-base font-extrabold text-white mb-1.5 flex items-center gap-2">
                          <FiCode size={15} className="text-blue-400" /> {res.title}
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed">{res.desc}</p>
                      </div>

                      <pre className="p-4 bg-[#0d1117] rounded-xl border border-gray-800 font-mono text-[11px] leading-relaxed text-emerald-300/80 overflow-x-auto">
                        {res.snippet}
                      </pre>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5">
                          <FiCpu size={10} className="text-purple-400" /> Includes AI Mentor Review
                        </span>
                        <button
                          onClick={() => {
                            toast.success('Starting interactive workspace...')
                            setSearchParams({ tab: 'dashboard' })
                          }}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-bold text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-900/25"
                        >
                          <FiPlay size={10} /> Try Code
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ══════════ FRIENDS TAB ══════════ */}
            {tab === 'friends' && (
              <motion.div key="friends" {...fadeSlide} className="flex flex-col gap-6 max-w-4xl mx-auto">
                <div className="mb-2">
                  <h1 className="text-2xl font-black text-white flex items-center gap-3">
                    <FiUsers className="text-purple-400" /> Friends & Groups
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">Connect with fellow developers and join coding communities.</p>
                </div>

                {/* Friends list */}
                <div>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 block">Online Friends</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ACTIVE_FRIENDS.map((f, i) => (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        initial="initial"
                        animate="animate"
                        className="p-4 bg-[#161B22] border border-gray-800 rounded-2xl flex items-center justify-between hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={f.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#161B22] ${
                              f.status === 'online' ? 'bg-green-500' : f.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`} />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-200">@{f.username}</span>
                            <span className="text-[10px] text-gray-500 block">
                              {f.coding ? `Working on: ${f.coding}` : 'Away'}
                            </span>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-bold transition-colors">
                          Invite
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Groups */}
                <div>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 block">Your Groups</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {FRIEND_GROUPS.map((g, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        className="p-5 bg-[#161B22] border border-gray-800 rounded-2xl shadow-sm hover:border-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="text-2xl mb-3">{g.icon}</div>
                        <h3 className="text-sm font-extrabold text-white mb-1">{g.name}</h3>
                        <p className="text-[10px] text-gray-400 mb-3">{g.activity}</p>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <FiUsers size={10} /> {g.members} members
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════ AI MENTOR TAB ══════════ */}
            {tab === 'ai' && (
              <motion.div key="ai" {...fadeSlide} className="flex flex-col gap-6 max-w-3xl mx-auto">
                <div className="mb-2">
                  <h1 className="text-2xl font-black text-white flex items-center gap-3">
                    <FiCpu className="text-cyan-400" /> AI Mentor
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">Get intelligent code reviews, suggestions, and learning guidance.</p>
                </div>

                <div className="p-8 bg-gradient-to-br from-[#161B22] to-[#0f1a2e] border border-gray-800 rounded-2xl text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20"
                  >
                    <FiZap size={28} className="text-cyan-400" />
                  </motion.div>
                  <h2 className="text-lg font-black text-white mb-2">AI-Powered Code Review</h2>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed mb-5">
                    Open any project in the editor and click the AI Review button to receive intelligent feedback on your code quality, performance, and best practices.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {[
                      { icon: FiSearch, label: 'Code Analysis', desc: 'Deep static analysis of your code patterns' },
                      { icon: FiTrendingUp, label: 'Performance Tips', desc: 'Optimize runtime and memory usage' },
                      { icon: FiLayers, label: 'Best Practices', desc: 'Industry-standard coding conventions' },
                    ].map((feat, i) => (
                      <div key={i} className="p-4 bg-[#0D1117] rounded-xl border border-gray-800">
                        <feat.icon size={18} className="text-cyan-400 mb-2" />
                        <h4 className="text-xs font-bold text-white mb-1">{feat.label}</h4>
                        <p className="text-[10px] text-gray-500">{feat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ──────────────────── NEW PROJECT MODAL ──────────────────── */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-md p-6 bg-[#161B22] border border-gray-800 rounded-2xl shadow-2xl text-white"
            >
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <FiPlus size={15} className="text-blue-400" /> Create New Project
                </span>
                <button onClick={closeCreateModal} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800">
                  <FiX size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="my-awesome-app"
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what your project does..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Programming Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                    <option value="html">HTML/CSS</option>
                  </select>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    id="isPublic"
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500/30"
                  />
                  <label htmlFor="isPublic" className="text-xs text-gray-300">Make this project public for community exploration</label>
                </div>

                <Button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-2.5 font-bold text-xs shadow-lg shadow-blue-900/30 text-white mt-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block">
                        <FiActivity size={12} />
                      </motion.span>
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FiZap size={12} /> Create Project
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
