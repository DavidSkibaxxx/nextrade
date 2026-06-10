import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, TrendingUp, Wallet, History, LogOut, Shield, ArrowUpCircle, Menu, X } from 'lucide-react'
import Logo from './Logo'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trade',     icon: TrendingUp,      label: 'Trade' },
  { to: '/deposit',   icon: Wallet,          label: 'Deposit' },
  { to: '/withdraw',  icon: ArrowUpCircle,   label: 'Withdraw' },
  { to: '/history',   icon: History,         label: 'History' },
]

export default function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const Sidebar = () => (
    <aside style={{
      width: 230, background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0', flexShrink: 0,
      height: '100vh',
    }}>
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo size={38} textSize={13} />
        <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'none' }} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius)',
            textDecoration: 'none', marginBottom: 2,
            color: isActive ? 'var(--accent)' : 'var(--muted)',
            background: isActive ? 'rgba(212,175,55,0.08)' : 'transparent',
            fontWeight: isActive ? 500 : 400,
            borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.15s',
          })}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}

        {profile?.is_admin && (
          <NavLink to="/admin" onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius)',
            textDecoration: 'none', marginTop: 12,
            color: isActive ? '#ffaa00' : 'var(--muted)',
            background: isActive ? 'rgba(255,170,0,0.08)' : 'transparent',
            fontWeight: isActive ? 500 : 400,
            borderTop: '1px solid var(--border)', paddingTop: 12,
            transition: 'all 0.15s',
          })}>
            <Shield size={16} />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div style={{ padding: '12px 12px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '10px 12px', marginBottom: 4, background: 'rgba(212,175,55,0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{profile?.full_name || 'Trader'}</div>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            ${Number(profile?.cash_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', width: '100%', borderRadius: 'var(--radius)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, transition: 'color 0.15s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--down)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-overlay { display: ${menuOpen ? 'block' : 'none'} !important; }
          .mobile-sidebar { display: ${menuOpen ? 'flex' : 'none'} !important; }
          .main-content { padding-top: 60px !important; }
        }
        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
          .mobile-overlay { display: none !important; }
          .mobile-sidebar { display: none !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div className="mobile-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <Logo size={32} textSize={12} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            ${Number(profile?.cash_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div className="mobile-overlay" onClick={() => setMenuOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        zIndex: 300,
      }} />

      {/* Mobile sidebar */}
      <div className="mobile-sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 400,
        width: 260, flexDirection: 'column',
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        padding: '0',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size={32} textSize={12} />
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 12px', borderRadius: 'var(--radius)',
              textDecoration: 'none', marginBottom: 4,
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              background: isActive ? 'rgba(212,175,55,0.08)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize: 15,
            })}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          {profile?.is_admin && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 12px', borderRadius: 'var(--radius)',
              textDecoration: 'none', marginTop: 12,
              color: isActive ? '#ffaa00' : 'var(--muted)',
              background: isActive ? 'rgba(255,170,0,0.08)' : 'transparent',
              borderTop: '1px solid var(--border)', paddingTop: 12,
              fontSize: 15,
            })}>
              <Shield size={18} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '10px 12px', marginBottom: 8, background: 'rgba(212,175,55,0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{profile?.full_name || 'Trader'}</div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              ${Number(profile?.cash_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', width: '100%', borderRadius: 'var(--radius)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="main-content" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
