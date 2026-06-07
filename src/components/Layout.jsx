import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, TrendingUp, Wallet, History,
  LogOut, Shield, ChevronRight, Activity
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trade',     icon: TrendingUp,      label: 'Trade' },
  { to: '/deposit',   icon: Wallet,          label: 'Deposit' },
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
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={16} color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
              NexTrade
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                marginBottom: 2,
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                background: isActive ? 'rgba(0,212,164,0.08)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.15s',
              })}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}

          {profile?.is_admin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                marginBottom: 2,
                marginTop: 12,
                color: isActive ? '#ffaa00' : 'var(--muted)',
                background: isActive ? 'rgba(255,170,0,0.08)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
                borderTop: '1px solid var(--border)',
                paddingTop: 12,
              })}
            >
              <Shield size={16} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* User info + signout */}
        <div style={{ padding: '12px 12px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '10px 12px', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
              {profile?.full_name || 'Trader'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              ${Number(profile?.cash_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', width: '100%', borderRadius: 'var(--radius)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted)', fontSize: 13, transition: 'color 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--down)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
