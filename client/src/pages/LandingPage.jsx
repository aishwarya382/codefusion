// client/src/pages/LandingPage.jsx (REDESIGNED FOR AI & COLLABORATION)
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import {
  FiCode, FiZap, FiUsers, FiMessageSquare, FiArrowRight, FiStar, FiLayers, FiGlobe, FiSmile, FiCpu
} from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import { selectIsAuthenticated } from '../store/slices/authSlice'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const features = [
  { icon: FiUsers, title: 'Multiplayer Real-time IDE', desc: 'Code together in real-time with zero latency, live cursor labels, presence indicators, and team workspaces.', color: '#58A6FF' },
  { icon: FiZap, title: 'AI-Powered Reviewer', desc: 'Instant code reviews before publishing. Receives complexity scoring, error warnings, and refactoring recommendations.', color: '#A371F7' },
  { icon: FiCode, title: 'Multi-Language Support', desc: 'Write, debug, and execute code in 17 popular programming languages, from Python/Java to Rust and Go.', color: '#3FB950' },
  { icon: FiMessageSquare, title: 'Team Knowledge Chats', desc: 'Discuss contextually inside code channels, threads, and learning groups without any tab switching.', color: '#F0883E' },
  { icon: FiLayers, title: 'Collaborative Groups', desc: 'Create study and developer squads, share resource libraries, pin announcements, and discuss with AI mentors.', color: '#F85149' },
  { icon: FiGlobe, title: 'Showcase Feed', desc: 'Publish code logs, notes, and full projects to a GitHub+Medium style community timeline. Follow authors, comment, and like.', color: '#58A6FF' }
]

export default function LandingPage() {
  const isAuth = useSelector(selectIsAuthenticated)

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans overflow-x-hidden selection:bg-blue-600/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 text-center bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(88,166,255,0.15)_0%,transparent_75%)]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center">
            
            {/* Version Badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#161B22] border border-gray-800 text-[11px] font-semibold text-[#58A6FF]">
                <FiStar size={11} className="animate-pulse" /> CodeFusion v4.0 — Collaborative Workspace
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={fadeUp} 
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-white max-w-4xl mb-6"
            >
              Code Together. <br />
              <span className="bg-gradient-to-r from-[#58A6FF] via-[#A371F7] to-[#F0883E] bg-clip-text text-transparent">Learn Faster. Build Better.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeUp} 
              className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10 font-normal"
            >
              Collaborate with friends, learn programming, receive AI-powered code reviews, publish projects, and improve your coding skills—all in one platform.
            </motion.p>

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
              {isAuth ? (
                <Link 
                  to="/dashboard" 
                  className="px-6 py-3 bg-[#3FB950] hover:bg-green-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/30 text-white"
                >
                  Go to Dashboard <FiArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 text-white"
                  >
                    Start Coding <FiArrowRight size={16} />
                  </Link>
                  <a 
                    href="#features" 
                    className="px-6 py-3 bg-[#161B22] hover:bg-gray-800 border border-gray-800 rounded-xl text-sm font-bold transition-all text-gray-300 hover:text-white"
                  >
                    Explore Community
                  </a>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Editor Mockup Section */}
      <motion.section 
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="px-6 pb-24 max-w-5xl mx-auto"
      >
        <div className="bg-[#161B22] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Chrome header */}
          <div className="h-11 bg-[#161B22] border-b border-gray-850 flex items-center px-4 justify-between">
            <div className="flex gap-1.5">
              {['#FF5F56', '#FFBD2E', '#27C93F'].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <div className="flex bg-[#0D1117] border border-gray-800 rounded-lg px-3 py-1 text-xs text-gray-400 font-mono">
              collab_workspace.js
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 border border-green-500/20 rounded font-semibold">Live Mode</span>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex flex-col md:flex-row h-72 font-mono text-xs text-gray-300">
            {/* Editor workspace code */}
            <div className="flex-1 p-5 bg-[#0D1117] border-b md:border-b-0 md:border-r border-gray-800 overflow-y-auto relative">
              <span className="text-[#FF7B72]">import</span> {'{ '} <span className="text-[#79C0FF]">createWorkspace</span> {' }'} <span className="text-[#FF7B72]">from</span> <span className="text-[#A5D6FF]">"codefusion"</span>;
              <br /><br />
              <span className="text-gray-500">// 🚀 Setting up a live multi-cursor session with the team</span>
              <br />
              <span className="text-[#FF7B72]">const</span> session = <span className="text-[#D2A8FF]">createWorkspace</span>({'{'}
              <br />
              &nbsp;&nbsp;users: [<span className="text-[#A5D6FF]">"Sarah"</span>, <span className="text-[#A5D6FF]">"Alex"</span>],
              <br />
              &nbsp;&nbsp;aiMentor: <span className="text-[#79C0FF]">true</span>
              <br />
              {'}'});
              <br /><br />
              session.<span className="text-[#D2A8FF]">onConnect</span>(() =&gt; {'{'}
              <br />
              &nbsp;&nbsp;console.log(<span className="text-[#A5D6FF]">"✓ Connected successfully to group room."</span>);
              <br />
              {'}'});

              {/* Cursor mocks */}
              <div className="absolute top-[102px] left-[142px] flex flex-col">
                <div className="w-[1.5px] h-4 bg-purple-500" />
                <span className="bg-purple-600 text-white text-[8px] font-sans px-1 rounded-sm -mt-0.5 ml-0.5">Sarah</span>
              </div>
              <div className="absolute top-[126px] left-[262px] flex flex-col">
                <div className="w-[1.5px] h-4 bg-[#58A6FF]" />
                <span className="bg-[#58A6FF] text-white text-[8px] font-sans px-1 rounded-sm -mt-0.5 ml-0.5">Alex</span>
              </div>
            </div>

            {/* AI Review Pane */}
            <div className="w-full md:w-64 bg-[#161B22] p-4 flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <FiCpu size={12} /> AI Review Scorecard
                </span>
                <div className="p-3 bg-[#0D1117] rounded-xl border border-gray-800 text-xs">
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Performance</span>
                    <span className="text-green-400">9.5/10</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Readability</span>
                    <span className="text-[#58A6FF]">Solid</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 leading-relaxed font-sans mt-3">
                AI suggestion: Consider caching loop calculations to optimize execution times.
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 border-t border-gray-850 bg-[#161B22]/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white mb-3">Designed for Collaboration & Learning</h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
              No contest templates or scoreboard pressures. We focus on what developers do best: working together and building knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="p-6 bg-[#161B22] border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors shadow-sm flex flex-col"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-800/40 flex items-center justify-center text-white mb-4 border border-gray-850">
                  <feat.icon size={20} style={{ color: feat.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-black text-white mb-10">Used by Thousands of Learners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          {[
            { quote: "CodeFusion was essential during our student developer bootcamp. Real-time coding with live cursor tags let us pairing-program headlessly.", author: "Marcus, Cornell CS student" },
            { quote: "The AI Code review mode is unmatched. It scores my code, points out logical issues, and translates functions into simplified beginner explanation logs.", author: "Elena, Junior Dev" }
          ].map((test, idx) => (
            <div key={idx} className="p-6 bg-[#161B22] border border-gray-800 rounded-2xl relative shadow-md">
              <FiSmile size={24} className="text-blue-500 mb-4" />
              <p className="text-xs text-gray-300 italic leading-relaxed mb-4">"{test.quote}"</p>
              <span className="text-[10px] font-bold text-gray-400 block">— {test.author}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-850 bg-[#0D1117] text-center text-xs text-gray-500">
        <p className="mb-2">© 2026 CodeFusion Platform. Built for developers and coding squads.</p>
        <p>Start Code · Explore Groups · AI Mentor Review</p>
      </footer>
    </div>
  )
}
