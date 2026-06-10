import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: 'https://eliteholdingtraders.com/login',
      })
      if (error) setError(error.message)
      else setResetSent(true)
      setLoading(false)
      return
    }
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) setError(error.message)
      else navigate('/dashboard')
    } else {
      if (!form.fullName.trim()) { setError('Please enter your full name'); setLoading(false); return }
      const { error } = await signUp(form.email, form.password, form.fullName)
      if (error) setError(error.message)
      else setError('Check your email to confirm your account, then log in.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #d4af37, #f5d76e, #d4af37);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Hero login section */}
      <div style={{
        minHeight: '100vh', display: 'flex',
        background: 'linear-gradient(135deg, #0a0800 0%, #1a1200 60%, #0a0800 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', width: '70vw', height: '70vw', maxWidth: 600, maxHeight: 600, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.06)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '50vw', height: '50vw', maxWidth: 400, maxHeight: 400, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.1)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 70, height: 70, borderRadius: 18, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 50px rgba(212,175,55,0.4)',
            }}>
              <span style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>E</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, marginBottom: 6 }}>
              <span className="gold-shimmer">Elite Holding</span>
              <span style={{ color: 'var(--text)' }}> Traders</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Professional crypto trading platform</p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 32, justifyContent: 'center' }}>
            {[['8+', 'Assets'], ['24/7', 'Trading'], ['Live', 'Prices']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{val}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Form card */}
          <div style={{
            width: '100%', maxWidth: 400,
            background: 'rgba(17,14,0,0.8)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 20, padding: '28px 24px',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 13 }}>
              {mode === 'login' ? 'Sign in to your trading account'
                : mode === 'register' ? 'Join Elite Holding Traders today'
                : 'Enter your email for a reset link'}
            </p>

            {mode !== 'forgot' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg2)', borderRadius: 10, padding: 3, marginBottom: 20, border: '1px solid var(--border)' }}>
                {['login', 'register'].map(m => (
                  <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                    padding: '9px', border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: mode === m ? 'var(--bg3)' : 'transparent',
                    color: mode === m ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: mode === m ? 600 : 400, fontSize: 13, transition: 'all 0.15s',
                  }}>
                    {m === 'login' ? 'Sign in' : 'Register'}
                  </button>
                ))}
              </div>
            )}

            {resetSent ? (
              <div style={{ padding: '20px', borderRadius: 12, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
                <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 6, fontSize: 14 }}>Reset email sent!</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>Check your inbox for the reset link.</div>
                <button onClick={() => { setMode('login'); setResetSent(false) }} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {mode === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>Full name</label>
                    <input type="text" placeholder="John Smith" value={form.fullName} onChange={e => set('fullName', e.target.value)} required style={{ fontSize: 14 }} />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>Email address</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required style={{ fontSize: 14 }} />
                </div>
                {mode !== 'forgot' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => set('password', e.target.value)} required style={{ paddingRight: 40, fontSize: 14 }} />
                      <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: -6 }}>
                    <button type="button" onClick={() => { setMode('forgot'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12 }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, background: error.includes('Check your email') ? 'rgba(212,175,55,0.1)' : 'rgba(255,71,87,0.1)', color: error.includes('Check your email') ? 'var(--accent)' : 'var(--down)', border: '1px solid ' + (error.includes('Check your email') ? 'rgba(212,175,55,0.2)' : 'rgba(255,71,87,0.2)') }}>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: '13px', fontSize: 14, marginTop: 4 }}>
                  {loading ? 'Please wait...'
                    : mode === 'login' ? 'Sign in to your account'
                    : mode === 'register' ? 'Create my account'
                    : 'Send reset link'}
                </button>

                {mode === 'forgot' && (
                  <button type="button" onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12, textAlign: 'center' }}>
                    Back to sign in
                  </button>
                )}
              </form>
            )}

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 }}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
              Elite Holding Traders is a regulated trading platform.
            </p>
          </div>

          {/* Scroll hint */}
          <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
            ↓ Scroll down to learn more
          </div>
        </div>
      </div>

      {/* About section */}
      <section style={{ padding: '48px 20px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #d4af37, #f5d76e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>E</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>About us</h2>
          </div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14, fontSize: 14 }}>
            Elite Holding Traders is a professional cryptocurrency trading platform headquartered in Bridgewater, New Jersey. We provide serious investors with the tools and technology needed to navigate digital asset markets with confidence.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 14 }}>
            Our platform offers real-time market data, secure deposit infrastructure, and comprehensive portfolio management — all designed for professional traders operating in full compliance with applicable financial regulations.
          </p>
          <div style={{ marginTop: 20, padding: '16px', background: 'var(--bg3)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Headquarters</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Elite Holding Traders LLC</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>1025 Route 202</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Bridgewater, NJ 08807</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>United States</div>
            <a href="mailto:support@eliteholdingtraders.com" style={{ display: 'block', color: 'var(--accent)', fontSize: 13, textDecoration: 'none', marginTop: 8 }}>
              support@eliteholdingtraders.com
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '48px 20px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
            Why Elite Holding Traders
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '📈', title: 'Live market prices', desc: 'Real-time crypto prices updated every 30 seconds from global markets.' },
              { icon: '🔒', title: 'Secure deposits', desc: 'Deposit BTC, ETH and USDT directly with full verification.' },
              { icon: '💼', title: 'Portfolio tracking', desc: 'Monitor your holdings, P&L and trade history in one place.' },
              { icon: '⚡', title: 'Instant trading', desc: 'Buy and sell crypto instantly at live market prices.' },
              { icon: '🛡️', title: 'Regulated platform', desc: 'Operating in compliance with US financial regulations.' },
              { icon: '💸', title: 'Easy withdrawals', desc: 'Request withdrawals to your crypto wallet anytime.' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '16px', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section style={{ padding: '48px 20px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Terms and Conditions</h2>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 16 }}>Last updated: June 2026</p>

          <button onClick={() => setShowTerms(!showTerms)} style={{
            width: '100%', padding: '14px', borderRadius: 10,
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            color: 'var(--text)', cursor: 'pointer', fontSize: 13,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
          }}>
            <span>{showTerms ? 'Hide' : 'Read'} full Terms and Conditions</span>
            <span>{showTerms ? '▲' : '▼'}</span>
          </button>

          {showTerms && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: '1. Acceptance of Terms', body: 'By accessing Elite Holding Traders, you agree to be bound by these Terms. If you do not agree, please do not use our services.' },
                { title: '2. Eligibility', body: 'You must be at least 18 years old and legally permitted to trade cryptocurrency in your jurisdiction.' },
                { title: '3. Account Registration', body: 'You agree to provide accurate information and are responsible for maintaining the confidentiality of your login credentials.' },
                { title: '4. Trading and Deposits', body: 'All deposits must be verified before funds are credited. KYC verification may be required at any time.' },
                { title: '5. Risk Disclosure', body: 'Cryptocurrency trading involves significant risk. The value of digital assets is highly volatile. Only invest what you can afford to lose.' },
                { title: '6. No Financial Advice', body: 'Nothing on this platform constitutes financial, investment, legal or tax advice. Consult a qualified advisor before investing.' },
                { title: '7. Prohibited Activities', body: 'Users may not use the platform for money laundering, fraud, or any illegal activity. Violations result in immediate account termination.' },
                { title: '8. Privacy Policy', body: 'We collect and process personal data in accordance with applicable privacy laws. We do not sell your personal information.' },
                { title: '9. Governing Law', body: 'These Terms are governed by the laws of the State of New Jersey, United States.' },
                { title: '10. Contact', body: 'Questions? Contact us at support@eliteholdingtraders.com or 1025 Route 202, Bridgewater, NJ 08807.' },
              ].map((t, i) => (
                <div key={i} style={{ padding: '14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--accent)', fontSize: 12 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{t.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 20px', background: 'var(--bg)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #d4af37, #f5d76e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>E</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>Elite Holding Traders</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>1025 Route 202, Bridgewater, NJ 08807</div>
        <a href="mailto:support@eliteholdingtraders.com" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'block', marginBottom: 16 }}>
          support@eliteholdingtraders.com
        </a>
        <div style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.5 }}>
          2026 Elite Holding Traders LLC. All rights reserved. Trading involves risk.
        </div>
      </footer>
    </div>
  )
}
