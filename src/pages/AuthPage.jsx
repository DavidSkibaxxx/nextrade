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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* Left panel - hidden on mobile */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0800 0%, #1a1200 50%, #0a0800 100%)',
        borderRight: '1px solid var(--border)',
        padding: 60, position: 'relative', overflow: 'hidden',
      }} className="auth-left-panel">
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.04)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{
          width: 80, height: 80, borderRadius: 20, marginBottom: 32,
          background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(212,175,55,0.3)', position: 'relative', zIndex: 1,
        }}>
          <span style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>E</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, textAlign: 'center', lineHeight: 1.2, marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <span className="gold-shimmer">Elite Holding</span>
          <br />
          <span style={{ color: 'var(--text)' }}>Traders</span>
        </h1>
        <p style={{ color: 'var(--muted)', textAlign: 'center', maxWidth: 300, fontSize: 15, lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
          Professional crypto trading platform for serious investors
        </p>
        <div style={{ display: 'flex', gap: 32, marginTop: 48, position: 'relative', zIndex: 1 }}>
          {[['8+', 'Crypto Assets'], ['24/7', 'Trading'], ['Live', 'Prices']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile logo */}
          <div className="mobile-logo" style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px', background: 'linear-gradient(135deg, #d4af37, #f5d76e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
              <span style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>E</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, background: 'linear-gradient(90deg, #d4af37, #f5d76e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Elite Holding Traders
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to your trading account'
              : mode === 'register' ? 'Join Elite Holding Traders today'
              : 'Enter your email to receive a reset link'}
          </p>

          {/* Tabs - only for login/register */}
          {mode !== 'forgot' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: 4, marginBottom: 28, border: '1px solid var(--border)' }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                  padding: '9px', border: 'none', borderRadius: 7, cursor: 'pointer',
                  background: mode === m ? 'var(--bg3)' : 'transparent',
                  color: mode === m ? 'var(--accent)' : 'var(--muted)',
                  fontWeight: mode === m ? 500 : 400, fontSize: 14, transition: 'all 0.15s',
                }}>
                  {m === 'login' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>
          )}

          {/* Reset sent message */}
          {resetSent ? (
            <div style={{ padding: '20px', borderRadius: 'var(--radius)', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
              <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>Reset email sent!</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Check your inbox for a password reset link from Elite Holding Traders.</div>
              <button onClick={() => { setMode('login'); setResetSent(false) }} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Full name</label>
                  <input type="text" placeholder="John Smith" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Email address</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              {mode !== 'forgot' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => set('password', e.target.value)} required style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot password link */}
              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: -8 }}>
                  <button type="button" onClick={() => { setMode('forgot'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12 }}>
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13, background: error.includes('Check your email') ? 'rgba(212,175,55,0.1)' : 'rgba(255,71,87,0.1)', color: error.includes('Check your email') ? 'var(--accent)' : 'var(--down)', border: '1px solid ' + (error.includes('Check your email') ? 'rgba(212,175,55,0.2)' : 'rgba(255,71,87,0.2)') }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4, justifyContent: 'center', padding: '13px', fontSize: 15 }}>
                {loading ? 'Please wait...'
                  : mode === 'login' ? 'Sign in to your account'
                  : mode === 'register' ? 'Create my account'
                  : 'Send reset link'}
              </button>

              {mode === 'forgot' && (
                <button type="button" onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
                  Back to sign in
                </button>
              )}
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--muted)', lineHeight: 1.7 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Elite Holding Traders is a regulated trading platform.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .mobile-logo { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-logo { display: none !important; }
        }
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
    </div>
  )
}
