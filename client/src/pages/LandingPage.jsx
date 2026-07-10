import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import {
  FiCode, FiZap, FiUsers, FiMessageSquare, FiVideo,
  FiGitBranch, FiCheck, FiArrowRight, FiPlay, FiStar,
} from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import { selectIsAuthenticated } from '../store/slices/authSlice'

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

const features = [
  { icon: FiUsers, title: 'Multiplayer Editing', desc: 'Code together in real-time with zero latency, live cursors, and presence tracking.', color: '#3B82F6' },
  { icon: FiZap, title: 'AI Copilot', desc: 'Context-aware AI assistance to generate, explain, fix, and refactor code instantly.', color: '#8B5CF6' },
  { icon: FiCode, title: 'Secure Execution', desc: 'Run code in 10+ languages in sandboxed containers directly from your browser.', color: '#22C55E' },
  { icon: FiGitBranch, title: 'Version History', desc: 'Automatic snapshots and branching so you never lose a single line of code.', color: '#F59E0B' },
  { icon: FiMessageSquare, title: 'Integrated Chat', desc: 'Discuss contextually with threads, reactions, and code snippets without leaving the editor.', color: '#EF4444' },
  { icon: FiVideo, title: 'Quick Huddles', desc: 'Start a video call with one click, right inside your project workspace.', color: '#06B6D4' },
]

const tiers = [
  { name: 'Hobby', price: '$0', period: '/mo', desc: 'Perfect for personal projects', features: ['3 Projects', 'Basic Collaboration', 'Standard AI (50 req/day)', 'Community Support'] },
  { name: 'Pro', price: '$12', period: '/mo', desc: 'For professional developers', popular: true, features: ['Unlimited Projects', 'Advanced AI (unlimited)', 'Priority Execution', 'Video Huddles', 'Version History'] },
  { name: 'Team', price: '$29', period: '/mo', desc: 'For growing engineering teams', features: ['Everything in Pro', 'SSO & Admin Controls', 'Advanced Analytics', 'Custom Domains', 'Priority Support'] },
]

export default function LandingPage() {
  const isAuth = useSelector(selectIsAuthenticated)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        paddingTop: 120, paddingBottom: 80,
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59,130,246,0.15) 0%, transparent 70%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
              <span className="cf-badge cf-badge-primary" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                <FiStar size={11} /> CodeFusion v3.0 — Early Access
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: 24,
            }}>
              Code together.{' '}
              <span className="gradient-text">Ship faster.</span>
            </motion.h1>

            <motion.p variants={fadeUp} style={{
              fontSize: '1.125rem',
              color: 'var(--text-2)',
              maxWidth: 560,
              margin: '0 auto 40px',
              lineHeight: 1.7,
            }}>
              The modern collaborative coding platform with AI assistance, real-time multiplayer editing, and instant code execution.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isAuth ? (
                <Link to="/dashboard" className="cf-btn cf-btn-primary cf-btn-lg">
                  Go to Dashboard <FiArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="cf-btn cf-btn-primary cf-btn-lg" style={{ boxShadow: '0 0 24px rgba(59,130,246,0.35)' }}>
                    Start for free <FiArrowRight size={16} />
                  </Link>
                  <a href="#features" className="cf-btn cf-btn-secondary cf-btn-lg">
                    Explore features
                  </a>
                </>
              )}
            </motion.div>

            <motion.p variants={fadeUp} style={{ marginTop: 16, fontSize: '0.8125rem', color: 'var(--text-3)' }}>
              No credit card required · Free forever plan available
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Editor Mockup */}
      <motion.section
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}
      >
        <div style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid var(--border-2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)',
          background: '#0D1117',
        }}>
          {/* Window chrome */}
          <div style={{
            height: 44,
            background: '#161B22',
            borderBottom: '1px solid #30363D',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#FF5F56', '#FFBD2E', '#27C93F'].map((c, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                display: 'flex', gap: 1,
                background: '#0D1117',
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid #30363D',
              }}>
                {['main.ts', 'utils.ts', 'api.ts'].map((f, i) => (
                  <div key={f} style={{
                    padding: '4px 14px',
                    fontSize: '0.75rem',
                    color: i === 0 ? '#E6EDF3' : '#8B949E',
                    background: i === 0 ? '#1C2128' : 'transparent',
                    borderRight: '1px solid #30363D',
                    cursor: 'pointer',
                  }}>{f}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#3B82F6', '#22C55E', '#8B5CF6'].map((c, i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: c + '22', border: `1px solid ${c}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                </div>
              ))}
            </div>
          </div>
          {/* Code area */}
          <div style={{ display: 'flex', height: 340 }}>
            {/* Line numbers */}
            <div style={{
              width: 48, background: '#0D1117',
              borderRight: '1px solid #21262D',
              padding: '20px 0',
              textAlign: 'right',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: '#484F58',
              lineHeight: '24px',
              userSelect: 'none',
              paddingRight: 12,
            }}>
              {Array.from({ length: 12 }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            {/* Code */}
            <div style={{ flex: 1, padding: '20px 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', lineHeight: '24px', overflowX: 'auto', position: 'relative' }}>
              <div><span style={{ color: '#FF7B72' }}>import</span> <span style={{ color: '#E6EDF3' }}>{'{ '}</span><span style={{ color: '#79C0FF' }}>createServer</span><span style={{ color: '#E6EDF3' }}>{', '}</span><span style={{ color: '#79C0FF' }}>Socket</span><span style={{ color: '#E6EDF3' }}>{' }'}</span> <span style={{ color: '#FF7B72' }}>from</span> <span style={{ color: '#A5D6FF' }}>'codfusion'</span><span style={{ color: '#E6EDF3' }}>;</span></div>
              <div>&nbsp;</div>
              <div><span style={{ color: '#8B949E' }}>// 🚀 Real-time collaborative server</span></div>
              <div><span style={{ color: '#FF7B72' }}>const</span> <span style={{ color: '#79C0FF' }}>app</span> <span style={{ color: '#E6EDF3' }}>=</span> <span style={{ color: '#D2A8FF' }}>createServer</span><span style={{ color: '#E6EDF3' }}>({'{'}</span></div>
              <div>&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>port</span><span style={{ color: '#E6EDF3' }}>:</span> <span style={{ color: '#79C0FF' }}>3000</span><span style={{ color: '#E6EDF3' }}>,</span></div>
              <div>&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>ai</span><span style={{ color: '#E6EDF3' }}>:</span> <span style={{ color: '#79C0FF' }}>true</span><span style={{ color: '#E6EDF3' }}>,</span></div>
              <div>&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>collaboration</span><span style={{ color: '#E6EDF3' }}>:</span> <span style={{ color: '#79C0FF' }}>true</span><span style={{ color: '#E6EDF3' }}>,</span></div>
              <div><span style={{ color: '#E6EDF3' }}>{'}'});</span></div>
              <div>&nbsp;</div>
              <div><span style={{ color: '#79C0FF' }}>app</span><span style={{ color: '#E6EDF3' }}>.</span><span style={{ color: '#D2A8FF' }}>start</span><span style={{ color: '#E6EDF3' }}>()</span><span style={{ color: '#E6EDF3' }}>.</span><span style={{ color: '#D2A8FF' }}>then</span><span style={{ color: '#E6EDF3' }}>(</span><span style={{ color: '#FF7B72' }}>()</span> <span style={{ color: '#FF7B72' }}>=&gt;</span> <span style={{ color: '#E6EDF3' }}>{'{'}</span></div>
              <div>&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>console</span><span style={{ color: '#E6EDF3' }}>.</span><span style={{ color: '#D2A8FF' }}>log</span><span style={{ color: '#E6EDF3' }}>(</span><span style={{ color: '#A5D6FF' }}>'✓ Server running in real-time...'</span><span style={{ color: '#E6EDF3' }}>);</span></div>
              <div><span style={{ color: '#E6EDF3' }}>{'}'});</span></div>
              {/* Blinking cursor */}
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{ position: 'absolute', top: 20 + 24 * 9, left: 24 + 8 * 2, width: 2, height: 18, background: '#3B82F6', borderRadius: 1 }}
              />
              {/* Collaborator cursors */}
              <div style={{ position: 'absolute', top: 20 + 24 * 4, left: 24 + 8 * 14, display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                <div style={{ width: 2, height: 18, background: '#22C55E', borderRadius: 1 }} />
                <div style={{ background: '#22C55E', color: '#fff', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '0 4px 4px 4px', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>Alex</div>
              </div>
            </div>
            {/* Right panel */}
            <div style={{
              width: 220,
              borderLeft: '1px solid #21262D',
              background: '#161B22',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Copilot</div>
              <div style={{ background: '#0D1117', borderRadius: 8, padding: 10, border: '1px solid #30363D' }}>
                <div style={{ fontSize: '0.7rem', color: '#8B949E', marginBottom: 6 }}>Suggestion</div>
                <div style={{ fontSize: '0.7rem', color: '#A5D6FF', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.5 }}>
                  Add error handling<br />with try/catch block
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Online</div>
              {[{ name: 'You', color: '#3B82F6' }, { name: 'Alex', color: '#22C55E' }, { name: 'Sam', color: '#8B5CF6' }].map(u => (
                <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: u.color + '33', border: `1.5px solid ${u.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: u.color, fontWeight: 700 }}>{u.name[0]}</div>
                  <span style={{ fontSize: '0.75rem', color: '#E6EDF3' }}>{u.name}</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="cf-badge cf-badge-secondary" style={{ marginBottom: 16, display: 'inline-flex' }}>Features</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Built for modern teams
          </h2>
          <p style={{ color: 'var(--text-2)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Everything you need to ship software faster, without the overhead.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              style={{
                padding: 24,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                transition: 'all var(--transition)',
                cursor: 'default',
              }}
              whileHover={{ y: -3, boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${f.color}22` }}
            >
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: f.color + '18',
                border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
                color: f.color,
              }}>
                <f.icon size={20} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 24px 120px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="cf-badge cf-badge-success" style={{ marginBottom: 16, display: 'inline-flex' }}>Pricing</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ color: 'var(--text-2)', maxWidth: 400, margin: '0 auto' }}>
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: 28,
                background: tier.popular ? 'var(--surface)' : 'var(--surface)',
                border: `1px solid ${tier.popular ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: tier.popular ? '0 0 0 1px rgba(59,130,246,0.3), 0 8px 32px rgba(59,130,246,0.15)' : 'none',
              }}
            >
              {tier.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 12px',
                  borderRadius: 99,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 4 }}>{tier.name}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>{tier.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em' }}>{tier.price}</span>
                <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{tier.period}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, flex: 1 }}>
                {tier.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--text-2)' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--success-muted)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={10} color="var(--success)" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`cf-btn ${tier.popular ? 'cf-btn-primary' : 'cf-btn-secondary'}`}
                style={{ justifyContent: 'center', boxShadow: tier.popular ? '0 4px 16px rgba(59,130,246,0.3)' : 'none' }}
              >
                Get started
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCode size={12} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>CodeFusion</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>
            © {new Date().getFullYear()} CodeFusion Inc. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Docs', 'Status'].map(l => (
              <a key={l} href="#" style={{ fontSize: '0.8125rem', color: 'var(--text-3)', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
