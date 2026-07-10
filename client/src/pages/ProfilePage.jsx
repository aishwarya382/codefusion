// client/src/pages/ProfilePage.jsx (CORRECTED)
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import { FiActivity, FiMapPin, FiGlobe, FiCode, FiUser } from 'react-icons/fi'
import { Card } from '../components/ui/Card'
import { userService } from '../services'
import { toast } from 'react-hot-toast'
import { Skeleton } from '../components/ui/Skeleton'

export default function ProfilePage() {
  const { username } = useParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await userService.getProfile(username)
      if (res.success) {
        setProfile(res.user)
        setProjects(res.projects || [])
      }
    } catch (err) {
      toast.error('Failed to load profile details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 pt-20 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex flex-col gap-6">
                <Skeleton style={{ height: 160 }} />
                <Skeleton style={{ height: 200 }} />
              </div>
            ) : !profile ? (
              <div className="text-center py-20 text-[var(--color-muted)]">User profile not found.</div>
            ) : (
              <>
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-10 border-b border-[var(--color-border)] text-center sm:text-left">
                  <img
                    src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&size=120`}
                    alt={profile.username}
                    className="w-28 h-28 rounded-full border-2 border-blue-500 object-cover"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{profile.username}</h1>
                    <p className="text-blue-400 font-medium capitalize mb-2">{profile.role || 'Developer'}</p>
                    <p className="text-[var(--color-muted)] text-sm mb-4 max-w-xl">{profile.bio || 'No bio provided.'}</p>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-[var(--color-muted)]">
                      {profile.location && (
                        <span className="flex items-center gap-1"><FiMapPin /> {profile.location}</span>
                      )}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                          <FiGlobe /> {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Workspaces */}
                <div className="mb-10">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiCode /> Workspaces</h2>
                  {projects.length === 0 ? (
                    <Card className="text-center p-8 text-[var(--color-muted)] text-sm">No public workspaces available.</Card>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {projects.map(p => (
                        <Link key={p._id} to={`/editor/${p._id}`} style={{ textDecoration: 'none' }}>
                          <Card className="p-5 h-full hover:border-blue-500 transition-colors flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-sm text-[var(--color-text)] mb-2">{p.title}</h3>
                              <p className="text-xs text-[var(--color-muted)] line-clamp-2 mb-4">{p.description || 'No description'}</p>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-[var(--color-muted)] font-medium">
                              <span className="uppercase text-blue-400">{p.language}</span>
                              <span>{p.stats?.totalVersions || 0} snapshot(s)</span>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiActivity /> Contribution</h2>
                <Card className="text-center p-12 bg-[var(--color-surface)]/50">
                  <p className="text-[var(--color-muted)] text-sm">Contributions metrics will appear here.</p>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
