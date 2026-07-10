import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  FiGrid, FiFolder, FiSettings, FiUsers, FiActivity,
  FiChevronLeft, FiChevronRight, FiPlus, FiShield,
  FiBookOpen, FiGlobe, FiArchive, FiCode, FiSearch,
} from 'react-icons/fi'
import { selectUser } from '../../store/slices/authSlice'

const NAV = [
  { icon: FiGrid,     label: 'Dashboard',    to: '/dashboard' },
  { icon: FiFolder,   label: 'Projects',     to: '/dashboard?tab=projects' },
  { icon: FiActivity, label: 'Activity',     to: '/dashboard?tab=activity' },
  { icon: FiUsers,    label: 'Collaborators',to: '/dashboard?tab=collaborators' },
  { icon: FiBookOpen, label: 'Tasks',        to: '/dashboard?tab=tasks' },
  { icon: FiGlobe,    label: 'Explore',      to: '/dashboard?tab=explore' },
  { icon: FiArchive,  label: 'Archived',     to: '/dashboard?tab=archived' },
]

const NavItem = ({ icon: Icon, label, to, collapsed, isActive }) => (
  <NavLink
    to={to}
    data-tip={collapsed ? label : undefined}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      gap: 9,
      padding: collapsed ? '8px' : '7px 10px',
      borderRadius: 'var(--r)',
      color: isActive ? '#818CF8' : 'var(--text-2)',
      background: isActive ? 'var(--primary-m)' : 'transparent',
      border: `1px solid ${isActive ? 'var(--primary-b)' : 'transparent'}`,
      fontWeight: isActive ? 600 : 500,
      fontSize: '0.8125rem',
      textDecoration: 'none',
      transition: 'all var(--t)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      flexShrink: 0,
    }}
    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)' } }}
    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' } }}
  >
    <Icon size={15} style={{ flexShrink: 0 }} />
    {!collapsed && <span>{label}</span>}
  </NavLink>
)

export default function Sidebar({ collapsed, onToggle }) {
  const user = useSelector(selectUser)
  const location = useLocation()

  const isActive = (to) => {
    if (to === '/dashboard' && !location.search) return location.pathname === '/dashboard'
    return location.pathname + location.search === to
  }

  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=6366F1&color=fff&bold=true&size=64`

  return (
    <motion.aside
      animate={{ width: collapsed ? 58 : 228 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{
        flexShrink: 0,
        height: '100%',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="hidden lg:flex"
    >
      {/* Logo row */}
      <div style={{
        height: 'var(--nav-h)',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 15px' : '0 14px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        gap: 9,
        overflow: 'hidden',
      }}>
        <div style={{
          width: 28, height: 28, flexShrink: 0,
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(99,102,241,0.4)',
        }}>
          <FiCode size={13} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>
            CodeFusion
          </span>
        )}
      </div>

      {/* New project */}
      <div style={{ padding: '10px 8px 6px', flexShrink: 0 }}>
        <NavLink
          to="/dashboard?new=true"
          data-tip={collapsed ? 'New Project' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 7,
            padding: collapsed ? '8px' : '8px 12px',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: 'var(--r)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            textDecoration: 'none',
            transition: 'all var(--t)',
            boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-h)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.35)' }}
        >
          <FiPlus size={14} style={{ flexShrink: 0 }} />
          {!collapsed && <span>New Project</span>}
        </NavLink>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }} className="no-scroll">
        {NAV.map(item => (
          <NavItem key={item.label} {...item} collapsed={collapsed} isActive={isActive(item.to)} />
        ))}

        <div className="divider" style={{ margin: '8px 4px' }} />

        <NavItem icon={FiSettings} label="Settings" to="/settings" collapsed={collapsed} isActive={location.pathname === '/settings'} />

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            data-tip={collapsed ? 'Admin' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 9,
              padding: collapsed ? '8px' : '7px 10px',
              borderRadius: 'var(--r)',
              color: '#FCD34D',
              background: location.pathname === '/admin' ? 'var(--warning-m)' : 'transparent',
              border: `1px solid ${location.pathname === '/admin' ? 'rgba(245,158,11,0.25)' : 'transparent'}`,
              fontWeight: 500,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              transition: 'all var(--t)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <FiShield size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Admin Panel</span>}
          </NavLink>
        )}
      </nav>

      {/* User footer */}
      {!collapsed && (
        <div style={{
          padding: '10px 12px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flexShrink: 0,
        }}>
          <img src={avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-2)', flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role || 'developer'}</p>
          </div>
          <span className="status-dot status-online" />
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', right: -11, top: 76,
          width: 22, height: 22,
          background: 'var(--surface)',
          border: '1px solid var(--border-2)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-3)',
          cursor: 'pointer',
          transition: 'all var(--t)',
          zIndex: 10,
          boxShadow: 'var(--shadow-sm)',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--primary-b)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
      >
        {collapsed ? <FiChevronRight size={11} /> : <FiChevronLeft size={11} />}
      </button>
    </motion.aside>
  )
}
