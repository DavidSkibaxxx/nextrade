import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, TrendingUp, Wallet, History, LogOut, Shield, ArrowUpCircle } from 'lucide-react'
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

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: 230, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0', flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)' }}>
          <Logo size={38} textSize={13} />
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
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
            <NavLink to="/admin" style={({ isActive }) => ({
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

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
