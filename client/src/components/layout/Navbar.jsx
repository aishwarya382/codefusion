import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCode, FiSun, FiMoon, FiBell, FiSearch, FiSettings,
  FiLogOut, FiUser, FiChevronDown, FiZap, FiShield,
  FiCommand, FiMenu, FiMessageSquare, FiUsers,
} from 'react-icons/fi'
import { selectUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice'
import { selectTheme, toggleTheme, setSearchOpen, setNotificationsOpen } from '../../store/slices/uiSlice'
import { selectUnreadCount } from '../../store/slices/notificationSlice'

const navLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Community', to: '/dashboard?tab=explore' },
  { label: 'Projects', to: '/dashboard?tab=projects' },
  { label: 'Groups', to: '/dashboard?tab=friends' },
  { label: 'Learning', to: '/dashboard?tab=learning' },
  { label: 'AI Mentor', to: '/dashboard?tab=ai' },
]

export default function Navbar({ onMenuToggle }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const user = useSelector(selectUser)
  const isAuth = useSelector(selectIsAuthenticated)
  const theme = useSelector(selectTheme)
  const unreadCount = useSelector(selectUnreadCount)

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleLogout = () => { dispatch(logout()); navigate('/'); setMenuOpen(false) }

  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=6366F1&color=fff&bold=true&size=64`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-200 ${
        scrolled || !isLanding
          ? 'bg-[#0D1117]/90 backdrop-blur-xl border-b border-gray-800'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-5 h-full flex items-center gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuth && onMenuToggle && (
            <button onClick={onMenuToggle} className="p-2 rounded-xl hover:bg-gray-800/60 text-gray-400 hover:text-white transition-colors hidden">
              <FiMenu size={17} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 shrink-0 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_14px_rgba(59,130,246,0.45)]">
              <FiCode size={14} className="text-white" />
            </div>
            <span className="font-bold text-[0.9375rem] text-white tracking-tight">
              CodeFusion
            </span>
          </Link>
        </div>

        {/* Search */}
        {isAuth && (
          <button
            onClick={() => dispatch(setSearchOpen(true))}
            className="flex-1 max-w-[340px] min-w-[180px] flex items-center gap-2 py-[7px] px-3 bg-[#161B22] border border-gray-800 rounded-xl text-gray-500 text-[0.8125rem] cursor-pointer transition-all duration-200 hover:border-gray-700 hover:text-gray-400 font-[inherit]"
          >
            <FiSearch size={13} />
            <span className="flex-1 text-left">Search...</span>
            <div className="flex gap-0.5">
              <kbd className="px-1.5 py-0.5 text-[0.6875rem] bg-gray-800 border border-gray-700 rounded text-gray-500 font-mono leading-none">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[0.6875rem] bg-gray-800 border border-gray-700 rounded text-gray-500 font-mono leading-none">K</kbd>
            </div>
          </button>
        )}

        {/* Nav Links */}
        {isAuth && (
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors relative group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-200 group-hover:w-4/5" />
              </Link>
            ))}
          </nav>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-xl hover:bg-gray-800/60 text-gray-400 hover:text-white transition-colors"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <FiSun size={15} /> : <FiMoon size={15} />}
          </button>

          {isAuth ? (
            <>
              {/* Notifications */}
              <button
                onClick={() => dispatch(setNotificationsOpen(true))}
                className="p-2 rounded-xl hover:bg-gray-800/60 text-gray-400 hover:text-white transition-colors relative"
                title="Notifications"
              >
                <FiBell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0D1117]" />
                )}
              </button>

              {/* Messages */}
              <button
                className="p-2 rounded-xl hover:bg-gray-800/60 text-gray-400 hover:text-white transition-colors"
                title="Messages"
              >
                <FiMessageSquare size={15} />
              </button>

              {/* Friends */}
              <button
                className="p-2 rounded-xl hover:bg-gray-800/60 text-gray-400 hover:text-white transition-colors"
                title="Friends"
              >
                <FiUsers size={15} />
              </button>

              <div className="w-px h-5 bg-gray-800 mx-1" />

              {/* Profile */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-[7px] pl-1 pr-2 py-1 rounded-xl border cursor-pointer transition-all duration-150 font-[inherit] ${
                    menuOpen
                      ? 'bg-gray-800/80 border-gray-700'
                      : 'bg-transparent border-transparent hover:bg-gray-800/60 hover:border-gray-800'
                  }`}
                >
                  <img
                    src={avatar}
                    alt={user?.username}
                    className="w-[26px] h-[26px] rounded-full object-cover border-[1.5px] border-gray-700"
                  />
                  <span className="text-[0.8125rem] font-medium text-white max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {user?.username}
                  </span>
                  <FiChevronDown
                    size={12}
                    className={`text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute right-0 top-[calc(100%+6px)] w-56 z-[200] bg-[#161B22] border border-gray-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
                    >
                      {/* User info */}
                      <div className="px-3.5 py-3 border-b border-gray-800">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={avatar}
                            alt=""
                            className="w-[38px] h-[38px] rounded-full object-cover border-2 border-gray-700"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
                              {user?.username}
                            </p>
                            <p className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        {user?.role && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.6875rem] font-medium bg-indigo-500/15 text-indigo-400 rounded-md">
                              <FiZap size={9} /> {user.role}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Links */}
                      <div className="p-1.5">
                        <Link
                          to={`/profile/${user?.username}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors no-underline"
                        >
                          <FiUser size={14} /> Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors no-underline"
                        >
                          <FiSettings size={14} /> Settings
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors no-underline"
                          >
                            <FiShield size={14} /> Admin Panel
                          </Link>
                        )}
                      </div>

                      <div className="p-1.5 border-t border-gray-800">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full font-[inherit] cursor-pointer bg-transparent border-none"
                        >
                          <FiLogOut size={14} /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-400 hover:text-white no-underline px-2.5 py-1.5 rounded-xl transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 px-4 py-1.5 rounded-xl transition-all duration-200 no-underline shadow-lg shadow-blue-500/20"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
