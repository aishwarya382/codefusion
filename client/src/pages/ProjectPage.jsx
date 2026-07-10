import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiCode, FiUsers, FiClock, FiSettings, FiPlay, FiGitCommit, FiMoreHorizontal } from 'react-icons/fi'
import { format } from 'date-fns'
import { projectService } from '../services'
import { selectUser } from '../store/slices/authSlice'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => { fetchProject() }, [id])

  const fetchProject = async () => {
    try {
      const res = await projectService.getOne(id)
      if (res.success) setProject(res.project)
    } catch (err) { navigate('/dashboard') } finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (window.confirm('Delete project? This is permanent.')) {
      try {
        const res = await projectService.delete(id)
        if (res.success) {
          toast.success('Project deleted')
          navigate('/dashboard')
        }
      } catch (err) { toast.error('Failed to delete') }
    }
  }

  const handleInvite = async () => {
    const username = window.prompt('Enter username of the collaborator to invite:')
    if (!username) return
    try {
      const res = await projectService.invite(id, { username })
      if (res.success) {
        toast.success(res.message || `${username} invited successfully!`)
        fetchProject()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to invite collaborator')
    }
  }

  if (loading) return <div className="h-screen bg-[var(--color-bg)] flex items-center justify-center"><Skeleton className="w-12 h-12 rounded-full" /></div>
  if (!project) return null

  const isOwner = project.owner._id === user?._id

  return (
    <div className="h-screen flex bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 pt-20 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[var(--color-border)] mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="primary">{project.language}</Badge>
                  <span className="text-[var(--color-muted)] text-sm">Updated {format(new Date(project.lastActivity), 'MMM d, yyyy')}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{project.title}</h1>
                <p className="text-[var(--color-muted)] max-w-2xl">{project.description || 'No description provided.'}</p>
              </div>
              <div className="flex items-center gap-3">
                {isOwner && (
                  <Button variant="ghost" size="icon" title="Settings">
                    <FiSettings size={16} />
                  </Button>
                )}
                <Link to={`/editor/${project._id}`}>
                  <Button><FiCode size={16} className="mr-2" /> Open Editor</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: FiGitCommit, val: project.stats.totalVersions, label: 'Commits' },
                { icon: FiUsers, val: project.members.length, label: 'Members' },
                { icon: FiPlay, val: project.stats.totalSessions, label: 'Sessions' },
                { icon: FiClock, val: format(new Date(project.lastActivity), 'MMM d'), label: 'Last Active' },
              ].map((stat, i) => (
                <Card key={i} className="p-5 flex flex-col items-center justify-center text-center">
                  <stat.icon size={20} className="text-[var(--color-muted)] mb-2" />
                  <div className="text-xl font-bold">{stat.val}</div>
                  <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider">{stat.label}</div>
                </Card>
              ))}
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border)]">
                <h2 className="font-semibold">Team Members</h2>
                {isOwner && <Button variant="secondary" size="sm" onClick={handleInvite}>Invite</Button>}
              </div>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.members.map((member) => (
                  <Card key={member.user._id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.username}`} alt={member.user.username} className="w-8 h-8 rounded-full border border-[var(--color-border)]" />
                      <div>
                        <p className="font-medium text-sm">{member.user.username}</p>
                        <p className="text-xs text-[var(--color-muted)] capitalize">{member.role}</p>
                      </div>
                    </div>
                    {isOwner && member.user._id !== user._id && (
                      <button className="text-[var(--color-muted)] hover:text-red-500">
                        <FiMoreHorizontal />
                      </button>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {isOwner && (
              <div className="p-6 border border-red-500/20 rounded-xl bg-red-500/5">
                <h3 className="font-semibold text-red-500 mb-1">Danger Zone</h3>
                <p className="text-sm text-[var(--color-muted)] mb-4">Deleting this project will permanently remove all code, history, and chat.</p>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors">
                  Delete Project
                </button>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  )
}
