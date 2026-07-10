import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import { FiMoon, FiSun, FiMonitor, FiCheck } from 'react-icons/fi'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { selectUser, setCredentials } from '../store/slices/authSlice'
import { paymentService, userService } from '../services'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState(null)

  useEffect(() => {
    if (searchParams.get('billing_success')) {
      toast.success('Successfully updated subscription plan!')
      refreshUser()
    } else if (searchParams.get('billing_canceled')) {
      toast.error('Subscription update was canceled.')
    }
  }, [searchParams])

  const refreshUser = async () => {
    try {
      const res = await userService.getProfile(user.username)
      if (res.success) {
        // Maintain token in localStorage
        const token = localStorage.getItem('cf_token')
        dispatch(setCredentials({ user: res.user, token }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpgrade = async (plan) => {
    setLoadingPlan(plan)
    try {
      const res = await paymentService.createCheckoutSession(plan)
      if (res.success && res.url) {
        window.location.href = res.url
      }
    } catch (err) {
      toast.error('Failed to initiate checkout session')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Hobby plan.')) return
    setLoadingPlan('cancel')
    try {
      const res = await paymentService.cancelSubscription()
      if (res.success) {
        toast.success('Subscription canceled successfully')
        refreshUser()
      }
    } catch (err) {
      toast.error('Failed to cancel subscription')
    } finally {
      setLoadingPlan(null)
    }
  }

  const currentPlan = user?.subscription?.plan || 'hobby'

  return (
    <div className="h-screen flex bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 pt-20 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold tracking-tight mb-8">Settings</h1>
            
            {/* Appearance */}
            <Card className="mb-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)] mb-4 border-b border-[var(--color-border)] pb-2">Appearance</h2>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Theme Preference</p>
                  <p className="text-sm text-[var(--color-muted)]">Choose how CodeFusion looks to you.</p>
                </div>
                <div className="flex gap-2 bg-[var(--color-surface-2)] p-1 rounded-md border border-[var(--color-border)]">
                  <button className="p-2 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)]"><FiSun size={14}/></button>
                  <button className="p-2 rounded bg-[var(--color-text)] text-[var(--color-bg)]"><FiMoon size={14}/></button>
                  <button className="p-2 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)]"><FiMonitor size={14}/></button>
                </div>
              </div>
            </Card>

            {/* Subscriptions / Billing */}
            <Card className="mb-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)] mb-4 border-b border-[var(--color-border)] pb-2">Subscription Plan</h2>
              
              <div className="py-4 flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 bg-[#1f2937] rounded-lg border border-gray-700">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Current Plan</span>
                    <h3 className="text-lg font-bold uppercase text-blue-400 mt-1">{currentPlan}</h3>
                    <p className="text-xs text-gray-400 mt-1">Status: Active</p>
                  </div>
                  {currentPlan !== 'hobby' && (
                    <Button 
                      onClick={handleCancel} 
                      disabled={loadingPlan === 'cancel'} 
                      className="btn-secondary"
                    >
                      {loadingPlan === 'cancel' ? 'Canceling...' : 'Cancel Subscription'}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Hobby Plan */}
                  <div className={`p-4 rounded-lg border flex flex-col ${currentPlan === 'hobby' ? 'border-blue-500 bg-[#1e1b4b]05' : 'border-gray-800 bg-[#0d1117]'}`}>
                    <h4 className="font-bold text-sm">Hobby Plan</h4>
                    <p className="text-xs text-gray-400 mt-1">Free forever plan</p>
                    <p className="text-lg font-extrabold mt-3">$0 <span className="text-xs font-normal text-gray-400">/mo</span></p>
                    <ul className="text-xs text-gray-400 flex flex-col gap-2 mt-4 flex-1">
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> 3 Projects</li>
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> Standard AI</li>
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> Community Support</li>
                    </ul>
                    <Button disabled className="mt-4 w-full" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                      {currentPlan === 'hobby' ? 'Active' : 'Downgrade via Cancel'}
                    </Button>
                  </div>

                  {/* Pro Plan */}
                  <div className={`p-4 rounded-lg border flex flex-col ${currentPlan === 'pro' ? 'border-blue-500 bg-[#1e1b4b]05' : 'border-gray-800 bg-[#0d1117]'}`}>
                    <h4 className="font-bold text-sm">Pro Plan</h4>
                    <p className="text-xs text-gray-400 mt-1">For professional developers</p>
                    <p className="text-lg font-extrabold mt-3">$12 <span className="text-xs font-normal text-gray-400">/mo</span></p>
                    <ul className="text-xs text-gray-400 flex flex-col gap-2 mt-4 flex-1">
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> Unlimited Projects</li>
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> Priority AI Copilot</li>
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> Video Huddles</li>
                    </ul>
                    <Button 
                      onClick={() => handleUpgrade('pro')}
                      disabled={currentPlan === 'pro' || loadingPlan !== null}
                      className="mt-4 w-full btn-primary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      {currentPlan === 'pro' ? 'Active' : loadingPlan === 'pro' ? 'Upgrading...' : 'Upgrade to Pro'}
                    </Button>
                  </div>

                  {/* Team Plan */}
                  <div className={`p-4 rounded-lg border flex flex-col ${currentPlan === 'team' ? 'border-blue-500 bg-[#1e1b4b]05' : 'border-gray-800 bg-[#0d1117]'}`}>
                    <h4 className="font-bold text-sm">Team Plan</h4>
                    <p className="text-xs text-gray-400 mt-1">For growing teams</p>
                    <p className="text-lg font-extrabold mt-3">$29 <span className="text-xs font-normal text-gray-400">/mo</span></p>
                    <ul className="text-xs text-gray-400 flex flex-col gap-2 mt-4 flex-1">
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> Everything in Pro</li>
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> Advanced Analytics</li>
                      <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-green-500"/> Admin controls</li>
                    </ul>
                    <Button 
                      onClick={() => handleUpgrade('team')}
                      disabled={currentPlan === 'team' || loadingPlan !== null}
                      className="mt-4 w-full btn-primary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      {currentPlan === 'team' ? 'Active' : loadingPlan === 'team' ? 'Upgrading...' : 'Upgrade to Team'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)] mb-4 border-b border-[var(--color-border)] pb-2">Account</h2>
              <div className="py-2">
                <p className="text-sm text-[var(--color-muted)]">Manage settings and reset security credentials.</p>
              </div>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
