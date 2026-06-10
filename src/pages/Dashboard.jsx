import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePrices, COINS } from '../hooks/usePrices'
import { supabase } from '../lib/supabase'
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}
function fmtPrice(p) {
  return p < 1 ? p.toFixed(4) : fmt(p)
}
function fmtCoin(n) {
  return n < 0.001 ? n.toFixed(6) : n.toFixed(4)
}

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(target)
  const prev = useRef(target)
  useEffect(() => {
    const start = prev.current
    const diff = target - start
    if (diff === 0) return
    const steps = 30
    const stepTime = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      setValue(start + diff * (step / steps))
      if (step >= steps) { clearInterval(timer); prev.current = target }
    }, stepTime)
    return () => clearInterval(timer)
  }, [target])
  return value
}

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth()
  const { prices, changes } = usePrices()
  const [holdings, setHoldings] = useState([])
  const [recentTrades, setRecentTrades] = useState([])
  const [time, setTime] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (profile) { fetchHoldings(); fetchRecentTrades(); refreshProfile() }
  }, [profile?.id])

  async function fetchHoldings() {
    const { data } = await supabase.from('holdings').select('*').eq('user_id', profile.id).gt('amount', 0)
    setHoldings(data ?? [])
  }

  async function fetchRecentTrades() {
    const { data } = await supabase.from('trades').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5)
    setRecentTrades(data ?? [])
  }

  const holdingValue = holdings.reduce((sum, h) => {
    const coin = COINS.find(c => c.symbol === h.symbol)
    const price = coin ? (prices[coin.id] ?? 0) : 0
    return sum + h.amount * price
  }, 0)

  const cash = Number(profile?.cash_balance ?? 0)
  const totalValue = cash + holdingValue
  const pnl = totalValue - 10000
  const pnlPct = (pnl / 10000) * 100
  const animatedTotal = useCountUp(totalValue)

  return (
    <div style={{ padding: '16px', maxWidth: 1200, margin: '0 auto' }} className="fade-in">
      <style>{`
        .price-scroll { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 4px; scrollbar-width: none; }
        .price-scroll::-webkit-scrollbar { display: none; }
        .price-card { min-width: 140px; flex-shrink: 0; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 600px) {
          .stat-grid { grid-template-columns: 1fr !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
          .price-card { min-width: 120px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            Welcome, {profile?.full_name?.split(' ')[0] ?? 'Trader'} 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Live portfolio</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: 'var(--accent)' }}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--up)' }} className="pulse" />
            <span style={{ fontSize: 10, color: 'var(--up)' }}>Live</span>
          </div>
        </div>
      </div>

      {/* Live price scroll */}
      <div style={{ marginBottom: 16, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '10px 12px' }}>
        <div className="price-scroll">
          {COINS.map(coin => {
            const price = prices[coin.id] ?? 0
            const change = changes[coin.id] ?? 0
            const up = change >= 0
            return (
              <div key={coin.id} className="price-card" style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: coin.color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: coin.color }}>
                    {coin.symbol.slice(0, 2)}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{coin.symbol}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>${fmtPrice(price)}</div>
                <div style={{ fontSize: 10, color: up ? 'var(--up)' : 'var(--down)', fontFamily: 'var(--font-mono)' }}>
                  {up ? '+' : ''}{change.toFixed(2)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Portfolio stats */}
      <div className="stat-grid" style={{ marginBottom: 12 }}>
        {[
          { label: 'Total value', value: '$' + fmt(animatedTotal), sub: (pnl >= 0 ? '+' : '') + '$' + fmt(Math.abs(pnl)) + ' (' + (pnl >= 0 ? '+' : '') + fmt(pnlPct, 1) + '%)', subColor: pnl >= 0 ? 'var(--up)' : 'var(--down)', icon: DollarSign },
          { label: 'Cash', value: '$' + fmt(cash), sub: fmt((cash / (totalValue || 1)) * 100, 1) + '% of portfolio', subColor: 'var(--muted)', icon: Activity },
          { label: 'Positions', value: '$' + fmt(holdingValue), sub: holdings.length + ' open', subColor: 'var(--muted)', icon: BarChart2 },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={12} color="var(--accent)" />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.subColor, fontFamily: 'var(--font-mono)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Holdings & Recent trades */}
      <div className="bottom-grid">
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>Positions</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trade')} style={{ fontSize: 11, padding: '4px 10px' }}>Trade</button>
          </div>
          {holdings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 12 }}>No open positions</div>
          ) : holdings.map(h => {
            const coin = COINS.find(c => c.symbol === h.symbol)
            const price = coin ? (prices[coin.id] ?? 0) : 0
            const value = h.amount * price
            const pl = (price - h.avg_buy_price) * h.amount
            const plPct = ((price - h.avg_buy_price) / h.avg_buy_price) * 100
            return (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: (coin?.color ?? '#888') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: coin?.color ?? '#888' }}>
                    {h.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{h.symbol}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{fmtCoin(h.amount)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${fmt(value)}</div>
                  <div style={{ fontSize: 10, color: pl >= 0 ? 'var(--up)' : 'var(--down)', fontFamily: 'var(--font-mono)' }}>
                    {pl >= 0 ? '+' : ''}{fmt(plPct, 2)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>Recent trades</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')} style={{ fontSize: 11, padding: '4px 10px' }}>All</button>
          </div>
          {recentTrades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 12 }}>No trades yet</div>
          ) : recentTrades.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={'badge badge-' + t.side} style={{ fontSize: 9 }}>{t.side.toUpperCase()}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 12 }}>{t.symbol}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{fmtCoin(t.amount)}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${fmt(t.total)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
