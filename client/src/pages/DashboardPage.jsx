// client/src/pages/DashboardPage.jsx (CORRECTED)
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus, FiCode, FiClock, FiActivity, FiUsers, FiMoreVertical,
  FiArrowRight, FiZap, FiTrendingUp, FiStar, FiGitBranch,
  FiPlay, FiFolder, FiSearch, FiGlobe, FiArchive, FiX
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

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    transition: 'all var(--transition)',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
  >
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)' }}>{value}</p>
      {trend && <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><FiTrendingUp size={11} /> {trend}</p>}
    </div>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
  </div>
)

const ProjectCard = ({ project, index, onAction }) => {
  const langColor = langColors[project.language?.toLowerCase()] || langColors.default
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/editor/${project._id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all var(--transition)',
          cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: langColor + '18', border: `1px solid ${langColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiCode size={16} color={langColor} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{project.title}</h3>
                <span style={{ fontSize: '0.7rem', color: langColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{project.language}</span>
              </div>
            </div>
            <button
              onClick={e => { e.preventDefault(); onAction(project) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, borderRadius: 6, transition: 'all var(--transition-fast)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)' }}
            >
              <FiMoreVertical size={15} />
            </button>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, flex: 1, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.description || 'No description provided.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {project.members?.slice(0, 3).map((m, i) => (
                <img key={i} src={m.user?.avatar || `https://ui-avatars.com/api/?name=${m.user?.username || 'U'}&background=3B82F6&color=fff&size=32`} alt="" style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid var(--surface)', marginLeft: i > 0 ? -8 : 0, objectFit: 'cover' }} />
              ))}
              {project.members?.length > 3 && <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginLeft: 4 }}>+{project.members.length - 3}</span>}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
              {project.lastActivity ? formatDistanceToNow(new Date(project.lastActivity), { addSuffix: true }) : 'Recently'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
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

  const stats = [
    { icon: FiFolder, label: 'Projects', value: user?.stats?.projectsCreated || 0, color: '#3B82F6', trend: '+2 this week' },
    { icon: FiClock, label: 'Hours Coded', value: user?.stats?.hoursCoded || 0, color: '#8B5CF6', trend: '+12h this week' },
    { icon: FiUsers, label: 'Collaborations', value: user?.stats?.collaborations || 0, color: '#22C55E' },
    { icon: FiZap, label: 'AI Requests', value: user?.stats?.aiUsage || 0, color: '#F59E0B' },
  ]

  const quickActions = [
    { icon: FiPlus, label: 'New Project', desc: 'Start from scratch', color: '#3B82F6', onClick: () => setSearchParams({ new: 'true' }) },
    { icon: FiGitBranch, label: 'Version History', desc: 'Browse snapshots', color: '#8B5CF6', onClick: () => setSearchParams({ tab: 'activity' }) },
    { icon: FiUsers, label: 'Invite Team', desc: 'Collaborate together', color: '#22C55E', onClick: () => setSearchParams({ tab: 'collaborators' }) },
    { icon: FiSearch, label: 'Explore', desc: 'Discover projects', color: '#F59E0B', onClick: () => setSearchParams({ tab: 'explore' }) },
  ]

  return (
    <div style={{ height: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main style={{ flex: 1, overflowY: 'auto', paddingTop: 56 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px' }}>

            {tab === 'dashboard' && (
              <>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
                      Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.username} 👋
                    </h1>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.9375rem' }}>Here's what's happening with your projects today.</p>
                  </div>
                  <Button onClick={() => setSearchParams({ new: 'true' })} style={{ boxShadow: '0 4px 16px rgba(59,130,246,0.3)', flexShrink: 0 }}>
                    <FiPlus size={15} /> New Project
                  </Button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
                  {stats.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <StatCard {...s} />
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: 36 }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, letterSpacing: '-0.01em' }}>Quick Actions</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    {quickActions.map((a, i) => (
                      <div key={i} onClick={a.onClick} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          transition: 'all var(--transition)',
                          cursor: 'pointer',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = a.color + '50'; e.currentTarget.style.background = a.color + '08'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.transform = 'none' }}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color + '18', border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <a.icon size={16} color={a.color} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{a.label}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{a.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Content List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', textTransform: 'capitalize' }}>
                  {tab === 'dashboard' ? 'Recent Projects' : `${tab} Workspace`}
                </h2>
                {tab === 'dashboard' && (
                  <button onClick={() => setSearchParams({ tab: 'projects' })} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    View all <FiArrowRight size={13} />
                  </button>
                )}
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {[1, 2, 3].map(i => <Skeleton key={i} style={{ height: 160 }} />)}
                </div>
              ) : projects.length === 0 ? (
                <div style={{
                  border: '1px dashed var(--border-2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '60px 24px',
                  textAlign: 'center',
                  background: 'var(--surface)',
                }}>
                  <div style={{ width: 56, height: 56, background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <FiCode size={24} color="var(--text-3)" />
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No projects found</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: 20 }}>Get started by creating a new workspace.</p>
                  <Button onClick={() => setSearchParams({ new: 'true' })} style={{ boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
                    <FiPlus size={15} /> Create Project
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {projects.map((project, i) => (
                    <ProjectCard key={project._id} project={project} index={i} onAction={() => navigate(`/projects/${project._id}`)} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Polish Create Project Dialog Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              style={{
                width: '100%', maxWidth: 460,
                background: 'var(--surface)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Create Workspace</h3>
                <button onClick={closeCreateModal} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                  <FiX size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="Title"
                  placeholder="my-awesome-app"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Description</label>
                  <textarea
                    placeholder="Describe what your workspace does..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', padding: '10px',
                      background: 'var(--surface-2)', border: '1px solid var(--border-2)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                      fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Language</label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px',
                        background: 'var(--surface-2)', border: '1px solid var(--border-2)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                        fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit'
                      }}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="rust">Rust</option>
                      <option value="go">Go</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', marginTop: 18 }}>
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={e => setIsPublic(e.target.checked)}
                        style={{ width: 15, height: 15 }}
                      />
                      <span>Make public</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                  <Button type="button" variant="ghost" onClick={closeCreateModal}>Cancel</Button>
                  <Button type="submit" isLoading={creating}>Build Workspace</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
