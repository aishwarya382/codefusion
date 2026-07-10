// client/src/pages/AdminPage.jsx (CORRECTED)
import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import { FiShield, FiUsers, FiFolder, FiGitBranch, FiActivity } from 'react-icons/fi'
import { adminService } from '../services'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { toast } from 'react-hot-toast'

export default function AdminPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingUser, setUpdatingUser] = useState(null)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers()
      ])
      if (statsRes.success) setStats(statsRes.stats)
      if (usersRes.success) setUsers(usersRes.users)
    } catch (err) {
      toast.error('Failed to load admin metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId, currentStatus) => {
    setUpdatingUser(userId)
    try {
      const res = await adminService.updateUser(userId, { isActive: !currentStatus })
      if (res.success) {
        toast.success(currentStatus ? 'User deactivated' : 'User activated')
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u))
      }
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingUser(null)
    }
  }

  return (
    <div className="h-screen flex bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 pt-20 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <FiShield size={24} className="text-yellow-500" />
              <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
            </div>

            {loading ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton style={{ height: 100 }} />
                  <Skeleton style={{ height: 100 }} />
                  <Skeleton style={{ height: 100 }} />
                </div>
                <Skeleton style={{ height: 300 }} />
              </div>
            ) : (
              <>
                {/* Stats row */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Total Users', val: stats.totalUsers, icon: FiUsers, color: '#3b82f6' },
                      { label: 'Total Workspaces', val: stats.totalProjects, icon: FiFolder, color: '#8b5cf6' },
                      { label: 'Total Snapshots', val: stats.totalVersions, icon: FiGitBranch, color: '#10b981' },
                      { label: 'New (This Week)', val: stats.newUsersThisWeek, icon: FiActivity, color: '#f59e0b' }
                    ].map((card, i) => (
                      <Card key={i} className="p-5 flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold">{card.label}</p>
                          <p className="text-2xl font-bold mt-1">{card.val}</p>
                        </div>
                        <div style={{ background: card.color + '18', border: `1px solid ${card.color}30` }} className="w-10 h-10 rounded-lg flex items-center justify-center">
                          <card.icon size={18} color={card.color} />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* User management table */}
                <Card className="p-6">
                  <h2 className="text-base font-semibold mb-6">User Accounts</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[var(--color-text)]">
                      <thead className="text-xs uppercase text-[var(--color-muted)] border-b border-[var(--color-border)]">
                        <tr>
                          <th className="pb-3 pl-2">User</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right pr-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {users.map(u => (
                          <tr key={u._id} className="hover:bg-[var(--color-surface)]/20 transition-colors">
                            <td className="py-3.5 pl-2 flex items-center gap-3">
                              <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`} className="w-8 h-8 rounded-full border" />
                              <span className="font-semibold">{u.username}</span>
                            </td>
                            <td className="py-3.5">{u.email}</td>
                            <td className="py-3.5 capitalize"><span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-800 text-gray-300">{u.role}</span></td>
                            <td className="py-3.5">
                              <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                              {u.isActive ? 'Active' : 'Suspended'}
                            </td>
                            <td className="py-3.5 text-right pr-2">
                              <Button
                                size="sm"
                                variant={u.isActive ? 'secondary' : 'primary'}
                                onClick={() => handleToggleActive(u._id, u.isActive)}
                                disabled={updatingUser === u._id}
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                              >
                                {u.isActive ? 'Suspend' : 'Activate'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
