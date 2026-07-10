import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCode, FiSun, FiMoon, FiBell, FiSearch, FiSettings,
  FiLogOut, FiUser, FiChevronDown, FiZap, FiShield,
  FiCommand, FiMenu,
} from 'react-icons/fi'
import { selectUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice'
import { selectTheme, toggleTheme, setSearchOpen, setNotificationsOpen } from '../../store/slices/uiSlice'
import { selectUnreadCount } from '../../store/slices/notificationSlice'

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

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: 'var(--nav-h)',
    transition: 'background 0.2s, border-color 0.2s, backdrop-filter 0.2s',
    background: scrolled || !isLanding ? 'rgba(9,9,11,0.88)' : 'transparent',
    backdropFilter: scrolled || !isLanding ? 'blur(24px) saturate(180%)' : 'none',
    WebkitBackdropFilter: scrolled || !isLanding ? 'blur(24px) saturate(180%)' : 'none',
    borderBottom: `1px solid ${scrolled || !isLanding ? 'var(--border)' : 'transparent'}`,
  }

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {isAuth && onMenuToggle && (
            <button onClick={onMenuToggle} className="btn btn-ghost btn-icon-sm" style={{ display: 'none' }}>
              <FiMenu size={17} />
            </button>
          )}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 28, height: 28, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px rgba(99,102,241,0.45)',
            }}>
              <FiCode size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', letterSpacing: '-0.025em' }}>
              CodeFusion
            </span>
          </Link>
        </div>

        {/* Search */}
        {isAuth && (
          <button
            onClick={() => dispatch(setSearchOpen(true))}
            style={{
              flex: 1, maxWidth: 340, minWidth: 180,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--r)',
              color: 'var(--text-4)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all var(--t-md)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-3)'; e.currentTarget.style.color = 'var(--text-3)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-4)' }}
          >
            <FiSearch size={13} />
            <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
            <div style={{ display: 'flex', gap: 2 }}>
              <kbd>⌘</kbd><kbd>K</kbd>
            </div>
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="btn btn-ghost btn-icon"
            data-tip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark'
              ? <FiSun size={15} />
              : <FiMoon size={15} />}
          </button>

          {isAuth ? (
            <>
              {/* Notifications */}
              <button
                onClick={() => dispatch(setNotificationsOpen(true))}
                className="btn btn-ghost btn-icon"
                style={{ position: 'relative' }}
                data-tip="Notifications"
              >
                <FiBell size={15} />
                {unreadCount > 0 && <span className="notif-badge" />}
              </button>

              <div className="divider-v" style={{ height: 20, margin: '0 4px' }} />

              {/* Profile */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '4px 8px 4px 4px',
                    background: menuOpen ? 'var(--surface-2)' : 'transparent',
                    border: `1px solid ${menuOpen ? 'var(--border-2)' : 'transparent'}`,
                    borderRadius: 'var(--r)',
                    cursor: 'pointer',
                    transition: 'all var(--t)',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { if (!menuOpen) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)' } }}
                  onMouseLeave={e => { if (!menuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
                >
                  <img src={avatar} alt={user?.username} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-2)' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username}
                  </span>
                  <FiChevronDown size={12} style={{ color: 'var(--text-3)', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                      className="dropdown"
                      style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 224, zIndex: 200 }}
                    >
                      {/* User info */}
                      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={avatar} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-2)' }} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                          </div>
                        </div>
                        {user?.role && (
                          <div style={{ marginTop: 8 }}>
                            <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                              <FiZap size={9} /> {user.role}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Links */}
                      <div style={{ padding: 6 }}>
                        <Link to={`/profile/${user?.username}`} onClick={() => setMenuOpen(false)} className="dropdown-item">
                          <FiUser size={14} /> Profile
                        </Link>
                        <Link to="/settings" onClick={() => setMenuOpen(false)} className="dropdown-item">
                          <FiSettings size={14} /> Settings
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setMenuOpen(false)} className="dropdown-item">
                            <FiShield size={14} /> Admin Panel
                          </Link>
                        )}
                      </div>

                      <div style={{ padding: 6, borderTop: '1px solid var(--border)' }}>
                        <button onClick={handleLogout} className="dropdown-item danger" style={{ width: '100%' }}>
                          <FiLogOut size={14} /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <Link to="/login" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', textDecoration: 'none', padding: '6px 10px', borderRadius: 'var(--r)', transition: 'color var(--t)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
              >
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
