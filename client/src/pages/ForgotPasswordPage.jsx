import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { FiCode, FiMail, FiArrowLeft, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { authService } from '../services'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const schema = z.object({ email: z.string().email('Enter a valid email address') })

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [resetToken, setResetToken] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authService.forgotPassword(data.email)
      if (response.success) {
        setIsSent(true)
        if (response.resetToken) setResetToken(response.resetToken)
      }
    } catch (error) { } finally { setIsLoading(false) }
  }

  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
            <FiCode size={15} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>CodeFusion</span>
        </Link>

        {!isSent ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, background: 'var(--primary-muted)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FiMail size={24} color="var(--primary)" />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Reset password</h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9375rem' }}>Enter your email and we'll send you a reset link</p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  autoFocus
                  {...register('email')}
                />
                <Button type="submit" isLoading={isLoading} style={{ width: '100%', justifyContent: 'center', padding: '11px 20px', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
                  Send reset link <FiArrowRight size={15} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--success-muted)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <FiCheckCircle size={28} color="var(--success)" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Check your inbox</h1>
            <p style={{ color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.6 }}>
              We've sent password reset instructions to your email address.
            </p>

            {resetToken && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: 16, textAlign: 'left', marginBottom: 24 }}>
                <p style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dev Mode — Reset Link</p>
                <Link to={`/reset-password/${resetToken}`} style={{ fontSize: '0.8125rem', color: 'var(--primary)', wordBreak: 'break-all', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  /reset-password/{resetToken}
                </Link>
              </div>
            )}
          </motion.div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            <FiArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
