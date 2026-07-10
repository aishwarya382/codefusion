// client/src/pages/SearchPage.jsx (CORRECTED)
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import { FiSearch } from 'react-icons/fi'
import { Input } from '../components/ui/Input'
import { searchService } from '../services'
import { toast } from 'react-hot-toast'

export default function SearchPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await searchService.search({ q: query })
        if (res.success) setResults(res.results)
      } catch (err) {
        toast.error('Search query failed')
      } finally {
        setLoading(false)
      }
    }, 500) // Debounce

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="h-screen flex bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 pt-20 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <Input
                icon={FiSearch}
                placeholder="Search projects, users, or code..."
                className="py-3 text-base bg-[var(--color-surface)]"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            {loading ? (
              <div className="text-center py-20 text-[var(--color-muted)] text-sm">Searching...</div>
            ) : !results ? (
              <div className="text-center py-20 text-[var(--color-muted)]">
                <p className="text-sm">Enter at least 2 characters to start searching.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* Projects */}
                {results.projects?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">Workspaces</h3>
                    <div className="flex flex-col gap-2">
                      {results.projects.map(p => (
                        <Link key={p._id} to={`/editor/${p._id}`} style={{ textDecoration: 'none' }} className="p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] flex justify-between items-center hover:border-blue-500 transition-colors">
                          <div>
                            <p className="font-semibold text-sm text-[var(--color-text)]">{p.title}</p>
                            <p className="text-xs text-[var(--color-muted)]">{p.description || 'No description'}</p>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-blue-400">{p.language}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users */}
                {results.users?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">Collaborators</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {results.users.map(u => (
                        <Link key={u.username} to={`/profile/${u.username}`} style={{ textDecoration: 'none' }} className="p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] flex items-center gap-3 hover:border-blue-500 transition-colors">
                          <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`} className="w-8 h-8 rounded-full" />
                          <div style={{ minWidth: 0 }}>
                            <p className="font-semibold text-sm text-[var(--color-text)]">{u.username}</p>
                            <p className="text-xs text-[var(--color-muted)] capitalize">{u.role}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
