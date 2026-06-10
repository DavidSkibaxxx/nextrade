import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { History as HistoryIcon, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export default function History() {
  const { profile } = useAuth()
  const [trades, setTrades] = useState([])
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    if (profile) { fetchTrades(); fetchDeposits() }
  }, [profile?.id])

  async function fetchTrades() {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    setTrades(data ?? [])
    setLoading(false)
  }

  async function fetchDeposits() {
    const { data } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    setDeposits(data ?? [])
  }

  const filteredTrades = tab === 'buy' ? trades.filter(t => t.side === 'buy')
    : tab === 'sell' ? trades.filter(t => t.side === 'sell')
    : trades

  const totalDeposited = deposits.filter(d => d.status === 'confirmed').reduce((s, d) => s + Number(d.amount), 0)
  const pendingDeposits = deposits.filter(d => d.status === 'pending').length
  const lastDeposit = deposits.find(d => d.status === 'confirmed')

  const totals = trades.reduce((acc, t) => {
    if (t.side === 'buy') acc.bought += t.total
    else acc.sold += t.total
    return acc
  }, { bought: 0, sold: 0 })

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          History
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Complete record of all your transactions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total trades', value: trades.length, mono: false, color: 'var(--accent)' },
          { label: 'Total bought', value: '$' + fmt(totals.bought), mono: true, color: 'var(--down)' },
          { label: 'Total sold', value: '$' + fmt(totals.sold), mono: true, color: 'var(--up)' },
          { label: 'Total deposited', value: '$' + fmt(totalDeposited), mono: true, color: 'var(--accent)' },
          { label: 'Pending deposits', value: pendingDeposits, mono: false, color: pendingDeposits > 0 ? '#ffaa00' : 'var(--muted)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-body)', color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {lastDeposit && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', borderRadius: 'var(--radius)',
          background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)',
          marginBottom: 24,
        }}>
          <ArrowDownCircle size={20} color="var(--accent)" />
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Last confirmed deposit</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
              {lastDeposit.amount} {lastDeposit.coin} — {new Date(lastDeposit.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <span className="badge badge-confirmed" style={{ marginLeft: 'auto' }}>Confirmed</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[['trades', 'Trade History'], ['deposits', 'Deposit History']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key === 'trades' ? 'all' : 'deposits')}
            style={{
              padding: '10px 18px', border: 'none', background: 'none',
              color: (tab === 'all' || tab === 'buy' || tab === 'sell') && key === 'trades' ? 'var(--accent)'
                : tab === 'deposits' && key === 'deposits' ? 'var(--accent)' : 'var(--muted)',
              borderBottom: '2px solid ' + ((tab === 'all' || tab === 'buy' || tab === 'sell') && key === 'trades' ? 'var(--accent)'
                : tab === 'deposits' && key === 'deposits' ? 'var(--accent)' : 'transparent'),
              cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: -1,
            }}
          >{label}</button>
        ))}
      </div>

      {(tab === 'all' || tab === 'buy' || tab === 'sell') && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 500 }}>Trade transactions</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'buy', 'sell'].map(f => (
                <button
                  key={f}
                  onClick={() => setTab(f)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border2)',
                    background: tab === f ? 'var(--bg3)' : 'transparent',
                    color: tab === f ? 'var(--text)' : 'var(--muted)',
                    cursor: 'pointer', fontSize: 12, textTransform: 'capitalize', transition: 'all 0.15s'
                  }}
                >{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
            <span>Date</span><span>Side</span><span>Asset</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span style={{ textAlign: 'right' }}>Price</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
          ) : filteredTrades.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
              <HistoryIcon size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No trades yet</p>
            </div>
          ) : filteredTrades.map(t => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
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

      {tab === 'deposits' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>
            Deposit transactions
          </div>
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
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{d.coin}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{d.amount}</span>
              <span className={'badge badge-' + d.status}>{d.status}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                {d.tx_hash.slice(0, 10)}...
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
