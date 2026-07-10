import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { FiCode, FiEye, FiEyeOff, FiArrowRight, FiUser, FiBook, FiStar } from 'react-icons/fi'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { authService } from '../services'
import { setCredentials } from '../store/slices/authSlice'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const schema = z.object({
  username: z.string().min(3, 'Min 3 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, _ and - only'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['developer', 'student', 'mentor']).default('developer'),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

const roles = [
  { value: 'developer', label: 'Developer', icon: FiCode, desc: 'Building products' },
  { value: 'student', label: 'Student', icon: FiBook, desc: 'Learning to code' },
  { value: 'mentor', label: 'Mentor', icon: FiStar, desc: 'Teaching others' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('developer')
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'developer' },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authService.register(data)
      if (response.success) {
        dispatch(setCredentials({ user: response.user, token: response.token }))
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setValue('role', role)
  }

  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left decorative panel */}
      <div style={{
        flex: 1, display: 'none',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)',
        borderRight: '1px solid var(--border)',
        padding: 48,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }} className="lg:flex">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
            <FiCode size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>CodeFusion</span>
        </Link>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.2 }}>
            Join 50,000+<br />developers worldwide
          </h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: 32 }}>
            Start collaborating, learning, and shipping code with the most powerful developer platform.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: '50K+', desc: 'Developers' },
              { label: '200K+', desc: 'Projects' },
              { label: '10+', desc: 'Languages' },
              { label: '99.9%', desc: 'Uptime' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>{s.label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>© {new Date().getFullYear()} CodeFusion Inc.</p>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto', minWidth: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40, justifyContent: 'center' }} className="lg:hidden">
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCode size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>CodeFusion</span>
          </Link>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Create your account</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9375rem' }}>Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Username"
              placeholder="johndoe"
              error={errors.username?.message}
              autoComplete="username"
              {...register('username')}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars"
                error={errors.password?.message}
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0, display: 'flex' }}>
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                }
                {...register('password')}
              />
              <Input
                label="Confirm"
                type="password"
                placeholder="Repeat"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            {/* Role selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>I am a...</label>
              <input type="hidden" {...register('role')} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {roles.map(({ value, label, icon: Icon, desc }) => {
                  const active = selectedRole === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRoleSelect(value)}
                      style={{
                        padding: '10px 8px',
                        background: active ? 'var(--primary-muted)' : 'var(--surface)',
                        border: `1px solid ${active ? 'rgba(59,130,246,0.4)' : 'var(--border-2)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Icon size={16} color={active ? 'var(--primary)' : 'var(--text-3)'} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: active ? 'var(--primary)' : 'var(--text-2)' }}>{label}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '11px 20px', fontSize: '0.9375rem', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
              Create account <FiArrowRight size={16} />
            </Button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-3)' }}>
            By signing up, you agree to our{' '}
            <a href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Privacy Policy</a>
          </p>

          <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-2)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
