import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { History as HistoryIcon } from 'lucide-react'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export default function History() {
  const { profile } = useAuth()
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (profile) fetchTrades()
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

  const filtered = filter === 'all' ? trades : trades.filter(t => t.side === filter)

  const totals = trades.reduce((acc, t) => {
    if (t.side === 'buy') acc.bought += t.total
    else acc.sold += t.total
    return acc
  }, { bought: 0, sold: 0 })

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Trade History
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Complete record of all your trades</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total trades', value: trades.length, mono: false },
          { label: 'Total bought', value: `$${fmt(totals.bought)}`, mono: true },
          { label: 'Total sold', value: `$${fmt(totals.sold)}`, mono: true },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-body)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter + table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 500 }}>All transactions</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'buy', 'sell'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border2)',
                  background: filter === f ? 'var(--bg3)' : 'transparent',
                  color: filter === f ? 'var(--text)' : 'var(--muted)',
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
            <HistoryIcon size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No trades yet</p>
          </div>
        ) : filtered.map(t => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span><span className={`badge badge-${t.side}`}>{t.side.toUpperCase()}</span></span>
            <span style={{ fontWeight: 500 }}>{t.symbol}</span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{Number(t.amount).toFixed(4)}</span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${fmt(t.price)}</span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: t.side === 'buy' ? 'var(--down)' : 'var(--up)' }}>
              {t.side === 'buy' ? '-' : '+'}${fmt(t.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
