import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { FiCode, FiEye, FiEyeOff, FiArrowRight, FiZap } from 'react-icons/fi'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { authService } from '../services'
import { setCredentials } from '../store/slices/authSlice'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authService.login(data)
      if (response.success) {
        dispatch(setCredentials({ user: response.user, token: response.token }))
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel — decorative */}
      <div style={{
        flex: 1,
        display: 'none',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)',
        borderRight: '1px solid var(--border)',
        padding: 48,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }} className="lg:flex">
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
            <FiCode size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>CodeFusion</span>
        </Link>

        <div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: 'var(--primary-muted)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FiZap size={22} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.2 }}>
              Code smarter,<br />ship faster.
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              Join thousands of developers building together with AI-powered collaboration.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Real-time multiplayer editing',
              'AI Copilot with Gemini',
              'Run code in 10+ languages',
              'Version history & snapshots',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--text-2)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--success-muted)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>© {new Date().getFullYear()} CodeFusion Inc.</p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minWidth: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Mobile logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40, justifyContent: 'center' }} className="lg:hidden">
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCode size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>CodeFusion</span>
          </Link>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9375rem' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                autoComplete="current-password"
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0, display: 'flex' }}>
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                }
                {...register('password')}
              />
            </div>

            <Button type="submit" isLoading={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '11px 20px', fontSize: '0.9375rem', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
              Sign in <FiArrowRight size={16} />
            </Button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-2)' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate("/register")}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Create account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
