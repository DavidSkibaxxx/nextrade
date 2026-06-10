import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [showTerms, setShowTerms] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
      color: 'var(--text)',
      overflowX: 'hidden',
    }}>

      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 24px', position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,8,0,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(212,175,55,0.3)',
          }}>
            <span style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>E</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.2 }}>Elite Holding</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.2 }}>Traders</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border2)',
              background: 'transparent', color: 'var(--text)', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
            }}
          >Sign in</button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
              color: '#000', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}
          >Get started</button>
        </div>
      </nav>

      <section style={{
        padding: '80px 24px 60px',
        background: 'linear-gradient(135deg, #0a0800 0%, #1a1200 50%, #0a0800 100%)',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.06)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.03)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.09)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20,
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
          fontSize: 12, color: 'var(--accent)', marginBottom: 28, position: 'relative', zIndex: 1,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          Regulated Crypto Trading Platform
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 8vw, 64px)',
          fontWeight: 800, lineHeight: 1.1, marginBottom: 20,
          position: 'relative', zIndex: 1,
        }}>
          <span style={{
            background: 'linear-gradient(90deg, #d4af37, #f5d76e, #d4af37)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite',
          }}>Where Elite</span>
          <br />
          <span style={{ color: 'var(--text)' }}>Investors Trade.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 3vw, 18px)', color: 'var(--muted)',
          maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7,
          position: 'relative', zIndex: 1,
        }}>
          Professional crypto trading built for serious investors.
          Trade Bitcoin, Ethereum, Solana and more with real-time prices,
          secure deposits and full portfolio management.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1, marginBottom: 60 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 32px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
              color: '#000', cursor: 'pointer', fontSize: 15, fontWeight: 700,
              boxShadow: '0 4px 30px rgba(212,175,55,0.3)',
            }}
          >Start trading now</button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 32px', borderRadius: 10,
              border: '1px solid var(--border2)',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 15, fontWeight: 500,
            }}
          >Sign in</button>
        </div>

        <div style={{
          maxWidth: 280, margin: '0 auto',
          background: 'var(--bg2)', borderRadius: 32,
          border: '1px solid var(--border2)',
          padding: 16, position: 'relative', zIndex: 1,
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(212,175,55,0.1)',
        }}>
          <div style={{ background: 'var(--bg3)', borderRadius: 20, padding: 16, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Portfolio value</div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--up)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>$24,850.00</div>
            <div style={{ fontSize: 12, color: 'var(--up)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>+$1,240.50 (5.25%)</div>
            {[
              { sym: 'BTC', price: '$67,420', chg: '+2.3%', color: '#F7931A' },
              { sym: 'ETH', price: '$3,510', chg: '+1.8%', color: '#627EEA' },
              { sym: 'SOL', price: '$178', chg: '+4.9%', color: '#9945FF' },
            ].map(c => (
              <div key={c.sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.color + '22', border: '1px solid ' + c.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: c.color }}>{c.sym.slice(0,2)}</div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.sym}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{c.price}</div>
                  <div style={{ fontSize: 11, color: 'var(--up)', fontFamily: 'var(--font-mono)' }}>{c.chg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          {[
            { value: '8+', label: 'Crypto assets' },
            { value: '24/7', label: 'Live trading' },
            { value: '100%', label: 'Secure platform' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 24px', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
          Built for serious investors
        </h2>
        <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 40, fontSize: 14 }}>
          Everything you need to trade crypto professionally
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '📈', title: 'Live market prices', desc: 'Real-time crypto prices updated every 30 seconds from global markets.' },
            { icon: '🔒', title: 'Secure deposits', desc: 'Deposit BTC, ETH and USDT directly to your account with full verification.' },
            { icon: '💼', title: 'Portfolio tracking', desc: 'Monitor your holdings, P&L and trade history all in one place.' },
            { icon: '⚡', title: 'Instant execution', desc: 'Buy and sell crypto instantly at market prices with no delays.' },
            { icon: '🛡️', title: 'Regulated platform', desc: 'Operating in compliance with financial regulations for your protection.' },
            { icon: '📊', title: 'Full trade history', desc: 'Complete record of every trade with exportable transaction history.' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16, padding: '20px',
              background: 'var(--bg2)', borderRadius: 16,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 24px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #d4af37, #f5d76e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>E</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>About us</h2>
          </div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 16, fontSize: 14 }}>
            Elite Holding Traders is a professional cryptocurrency trading platform headquartered in Bridgewater, New Jersey. We are dedicated to providing serious investors with the tools, technology and transparency needed to navigate the digital asset markets with confidence.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 24, fontSize: 14 }}>
            Our platform offers real-time market data, secure deposit infrastructure, and a comprehensive portfolio management system designed to meet the standards of professional traders. We operate in full compliance with applicable financial regulations, ensuring your investments are protected at every step.
          </p>
          <div style={{ padding: '16px', background: 'var(--bg3)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Headquarters</div>
            <div style={{ fontWeight: 500 }}>Elite Holding Traders</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>1025 Route 202, Bridgewater, NJ 08807</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>United States</div>
            <div style={{ marginTop: 8 }}>
              <a href="mailto:support@eliteholdingtraders.com" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>
                support@eliteholdingtraders.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 24px', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Terms and Conditions</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Last updated: June 2026</p>
        <button
          onClick={() => setShowTerms(!showTerms)}
          style={{
            width: '100%', padding: '14px', borderRadius: 10,
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            color: 'var(--text)', cursor: 'pointer', fontSize: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span>{showTerms ? 'Hide' : 'Read'} full Terms and Conditions</span>
          <span>{showTerms ? 'A' : 'V'}</span>
        </button>
        {showTerms && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { title: '1. Acceptance of Terms', body: 'By accessing and using the Elite Holding Traders platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.' },
              { title: '2. Eligibility', body: 'You must be at least 18 years of age and legally permitted to trade cryptocurrency in your jurisdiction to use our platform. Users are responsible for ensuring their compliance with local laws.' },
              { title: '3. Account Registration', body: 'You agree to provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and all activities under your account.' },
              { title: '4. Trading and Deposits', body: 'All deposits must be verified before funds are credited. Elite Holding Traders reserves the right to request identity verification (KYC) at any time. Deposits are subject to review and may be delayed pending compliance checks.' },
              { title: '5. Risk Disclosure', body: 'Cryptocurrency trading involves significant risk of loss. The value of digital assets is highly volatile and past performance does not guarantee future results. You should only invest funds you can afford to lose.' },
              { title: '6. No Financial Advice', body: 'Nothing on this platform constitutes financial, investment, legal or tax advice. Elite Holding Traders is a trading platform only. Please consult a qualified financial advisor before making investment decisions.' },
              { title: '7. Prohibited Activities', body: 'Users may not use the platform for money laundering, fraud, market manipulation, or any illegal activity. Violations will result in immediate account termination and reporting to relevant authorities.' },
              { title: '8. Privacy Policy', body: 'We collect and process personal data in accordance with applicable privacy laws. Your data is used solely for account management, compliance, and platform improvement. We do not sell your personal information.' },
              { title: '9. Platform Availability', body: 'Elite Holding Traders strives to maintain 24/7 platform availability but does not guarantee uninterrupted access. We are not liable for losses resulting from platform downtime or technical issues.' },
              { title: '10. Governing Law', body: 'These Terms are governed by the laws of the State of New Jersey, United States. Any disputes shall be resolved in the courts of Bridgewater, New Jersey.' },
              { title: '11. Contact', body: 'For questions about these Terms, contact us at support@eliteholdingtraders.com or visit our offices at 1025 Route 202, Bridgewater, NJ 08807.' },
            ].map((t, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--accent)', fontSize: 13 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{t.body}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={{
        padding: '40px 24px 60px',
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #d4af37, #f5d76e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#000' }}>E</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>Elite Holding Traders</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>1025 Route 202, Bridgewater, NJ 08807</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
          <a href="mailto:support@eliteholdingtraders.com" style={{ color: 'var(--muted)', textDecoration: 'none' }}>support@eliteholdingtraders.com</a>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.6 }}>
          2026 Elite Holding Traders. All rights reserved. Trading cryptocurrency involves risk.
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}
