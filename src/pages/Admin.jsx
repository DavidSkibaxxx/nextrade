import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Shield, Check, X, ExternalLink, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

const EXPLORER = {
  ETH: 'https://etherscan.io/tx/',
  BTC: 'https://www.blockchain.com/explorer/transactions/btc/',
  USDT: 'https://tronscan.org/#/transaction/',
}

export default function Admin() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [deposits, setDeposits] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('deposits')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [note, setNote] = useState({})

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/dashboard')
    if (profile?.is_admin) { fetchDeposits(); fetchUsers() }
  }, [profile?.id])

  async function fetchDeposits() {
    setLoading(true)
    const { data } = await supabase
      .from('deposits')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setDeposits(data ?? [])
    setLoading(false)
  }

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
  }

  async function handleDeposit(depositId, action) {
    setProcessing(depositId)
    const deposit = deposits.find(d => d.id === depositId)

    if (action === 'confirm') {
      // Credit user's USD balance (using USD value approximation)
      const usdAmount = deposit.amount // Admin should fill in USD equivalent
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('cash_balance')
        .eq('id', deposit.user_id)
        .single()

      await supabase.from('profiles').update({
        cash_balance: Number(userProfile.cash_balance) + Number(usdAmount)
      }).eq('id', deposit.user_id)
    }

    await supabase.from('deposits').update({
      status: action === 'confirm' ? 'confirmed' : 'rejected',
      admin_note: note[depositId] || null,
    }).eq('id', depositId)

    await fetchDeposits()
    setProcessing(null)
  }

  const pending = deposits.filter(d => d.status === 'pending')
  const resolved = deposits.filter(d => d.status !== 'pending')

  if (!profile?.is_admin) return null

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,170,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="#ffaa00" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Admin Panel
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Manage deposits and users</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { fetchDeposits(); fetchUsers() }} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Pending deposits', value: pending.length, color: '#ffaa00' },
          { label: 'Confirmed', value: deposits.filter(d => d.status === 'confirmed').length, color: 'var(--up)' },
          { label: 'Total users', value: users.length, color: 'var(--accent2)' },
          { label: 'Total deposited', value: `$${fmt(deposits.filter(d => d.status === 'confirmed').reduce((s, d) => s + Number(d.amount), 0))}`, color: 'var(--text)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[['deposits', 'Deposits'], ['users', 'Users']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '8px 18px', border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
              background: tab === key ? 'var(--bg3)' : 'transparent',
              color: tab === key ? 'var(--text)' : 'var(--muted)',
              cursor: 'pointer', fontSize: 13, transition: 'all 0.15s'
            }}
          >{label}</button>
        ))}
      </div>

      {/* Deposits tab */}
      {tab === 'deposits' && (
        <div>
          {pending.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffaa00', display: 'inline-block' }} className="pulse" />
                Pending review ({pending.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(d => (
                  <div key={d.id} className="card" style={{ borderColor: 'rgba(255,170,0,0.2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>User</div>
                        <div style={{ fontWeight: 500 }}>{d.profiles?.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{d.profiles?.email}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Amount</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{d.amount} {d.coin}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(d.created_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>TX Hash</div>
                        <a
                          href={`${EXPLORER[d.coin] ?? '#'}${d.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {d.tx_hash.slice(0, 16)}… <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                          Credit amount (USD) — verify on blockchain explorer first
                        </div>
                        <input
                          type="text"
                          placeholder="Enter USD value to credit (e.g. 500)"
                          value={note[d.id] || ''}
                          onChange={e => setNote(n => ({ ...n, [d.id]: e.target.value }))}
                          style={{ fontSize: 13 }}
                        />
                      </div>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={processing === d.id}
                        onClick={() => handleDeposit(d.id, 'confirm')}
                        style={{ flexShrink: 0 }}
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={processing === d.id}
                        onClick={() => handleDeposit(d.id, 'reject')}
                        style={{ flexShrink: 0 }}
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 14 }}>Resolved</h3>
              <div className="card" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                  <span>User</span><span>Amount</span><span>Coin</span><span>Status</span><span>Date</span>
                </div>
                {resolved.map(d => (
                  <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
                    <span>{d.profiles?.full_name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{d.amount}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{d.coin}</span>
                    <span className={`badge badge-${d.status}`}>{d.status}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
            <span>Name</span><span>Email</span><span>Balance</span><span>Joined</span>
          </div>
          {users.map(u => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                {u.full_name}
                {u.is_admin && <span style={{ fontSize: 10, background: 'rgba(255,170,0,0.15)', color: '#ffaa00', padding: '2px 6px', borderRadius: 4 }}>ADMIN</span>}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{u.email}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--up)' }}>${fmt(u.cash_balance)}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
