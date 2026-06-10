import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { History as HistoryIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export default function History() {
  const { profile } = useAuth()
  const [trades, setTrades] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('trades')

  useEffect(() => {
    if (profile) { fetchTrades(); fetchDeposits(); fetchWithdrawals() }
  }, [profile?.id])

  async function fetchTrades() {
    const { data } = await supabase.from('trades').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
    setTrades(data ?? [])
    setLoading(false)
  }

  async function fetchDeposits() {
    const { data } = await supabase.from('deposits').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
    setDeposits(data ?? [])
  }

  async function fetchWithdrawals() {
    const { data } = await supabase.from('withdrawals').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
    setWithdrawals(data ?? [])
  }

  const totalDeposited = deposits.filter(d => d.status === 'confirmed').reduce((s, d) => s + Number(d.amount), 0)
  const totalWithdrawn = withdrawals.filter(w => w.status === 'confirmed').reduce((s, w) => s + Number(w.amount), 0)
  const pendingDeposits = deposits.filter(d => d.status === 'pending').length
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length
  const lastDeposit = deposits.find(d => d.status === 'confirmed')
  const lastWithdrawal = withdrawals.find(w => w.status === 'confirmed')
  const totals = trades.reduce((acc, t) => {
    if (t.side === 'buy') acc.bought += t.total
    else acc.sold += t.total
    return acc
  }, { bought: 0, sold: 0 })

  const tabs = [
    { key: 'trades', label: 'Trade History' },
    { key: 'deposits', label: 'Deposits' },
    { key: 'withdrawals', label: 'Withdrawals' },
  ]

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700 }}>History</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Complete record of all your transactions</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'Total trades', value: trades.length, color: 'var(--accent)' },
          { label: 'Total bought', value: '$' + fmt(totals.bought), color: 'var(--down)' },
          { label: 'Total sold', value: '$' + fmt(totals.sold), color: 'var(--up)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total deposited', value: '$' + fmt(totalDeposited), color: 'var(--accent)', icon: '↓' },
          { label: 'Pending deposits', value: pendingDeposits, color: pendingDeposits > 0 ? '#ffaa00' : 'var(--muted)', icon: '⏳' },
          { label: 'Total withdrawn', value: '$' + fmt(totalWithdrawn), color: 'var(--up)', icon: '↑' },
          { label: 'Pending withdrawals', value: pendingWithdrawals, color: pendingWithdrawals > 0 ? '#ffaa00' : 'var(--muted)', icon: '⏳' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Last deposit & withdrawal highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {lastDeposit && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius)', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <ArrowDownCircle size={18} color="var(--accent)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Last deposit</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)', fontSize: 13 }}>{lastDeposit.amount} {lastDeposit.coin}</div>
            </div>
            <span className="badge badge-confirmed">Confirmed</span>
          </div>
        )}
        {lastWithdrawal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius)', background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.2)' }}>
            <ArrowUpCircle size={18} color="var(--up)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Last withdrawal</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--up)', fontSize: 13 }}>{lastWithdrawal.amount} {lastWithdrawal.coin}</div>
            </div>
            <span className="badge badge-confirmed">Confirmed</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none',
              color: tab === t.key ? 'var(--accent)' : 'var(--muted)',
              borderBottom: '2px solid ' + (tab === t.key ? 'var(--accent)' : 'transparent'),
              cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: -1,
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Trade History Tab */}
      {tab === 'trades' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
            <span>Date</span><span>Side</span><span>Asset</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span style={{ textAlign: 'right' }}>Price</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
          ) : trades.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
              <HistoryIcon size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No trades yet</p>
            </div>
          ) : trades.map(t => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span><span className={'badge badge-' + t.side}>{t.side.toUpperCase()}</span></span>
              <span style={{ fontWeight: 500 }}>{t.symbol}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{Number(t.amount).toFixed(4)}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${fmt(t.price)}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: t.side === 'buy' ? 'var(--down)' : 'var(--up)' }}>
                {t.side === 'buy' ? '-' : '+'}${fmt(t.total)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Deposits Tab */}
      {tab === 'deposits' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
            <span>Date</span><span>Coin</span><span>Amount</span><span>Status</span><span>TX Hash</span>
          </div>
          {deposits.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
              <ArrowDownCircle size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No deposits yet</p>
            </div>
          ) : deposits.map(d => (
            <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{d.coin}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{d.amount}</span>
              <span className={'badge badge-' + d.status}>{d.status}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{d.tx_hash.slice(0, 10)}...</span>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals Tab */}
      {tab === 'withdrawals' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
            <span>Date</span><span>Coin</span><span>Amount</span><span>Status</span><span>Wallet</span>
          </div>
          {withdrawals.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
              <ArrowUpCircle size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No withdrawals yet</p>
            </div>
          ) : withdrawals.map(w => (
            <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{w.coin}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{w.amount}</span>
              <span className={'badge badge-' + w.status}>{w.status}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{w.wallet_address.slice(0, 10)}...</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
