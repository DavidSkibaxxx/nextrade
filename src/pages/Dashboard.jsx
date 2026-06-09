import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePrices, COINS } from '../hooks/usePrices'
import { supabase } from '../lib/supabase'
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}
function fmtCoin(n) {
  return n < 0.001 ? n.toFixed(6) : n < 1 ? n.toFixed(4) : n.toFixed(4)
}
function fmtPrice(p) {
  return p < 1 ? p.toFixed(4) : fmt(p)
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

function Sparkline({ positive }) {
  const points = useRef(Array.from({ length: 20 }, () => 40 + Math.random() * 20))
  const [pts, setPts] = useState(points.current)
  useEffect(() => {
    const interval = setInterval(() => {
      setPts(prev => {
        const next = [...prev.slice(1), prev[prev.length - 1] + (Math.random() - (positive ? 0.4 : 0.6)) * 6]
        return next.map(v => Math.max(10, Math.min(70, v)))
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [positive])
  const w = 80, h = 32
  const min = Math.min(...pts), max = Math.max(...pts)
  const px = (i) => (i / (pts.length - 1)) * w
  const py = (v) => h - ((v - min) / (max - min || 1)) * (h - 4) - 2
  const d = pts.map((v, i) => (i === 0 ? 'M' : 'L') + px(i).toFixed(1) + ',' + py(v).toFixed(1)).join(' ')
  const color = positive ? '#00c896' : '#ff4757'
  return (
    <svg width={w} height={h} viewBox={'0 0 ' + w + ' ' + h}>
      <path d={d + ' L' + w + ',' + h + ' L0,' + h + ' Z'} fill={color + '18'} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LiveTicker({ prices, changes }) {
  const tickerRef = useRef(null)
  useEffect(() => {
    const el = tickerRef.current
    if (!el) return
    let x = 0
    const speed = 0.5
    const animate = () => {
      x -= speed
      if (x < -el.scrollWidth / 2) x = 0
      el.style.transform = 'translateX(' + x + 'px)'
      requestAnimationFrame(animate)
    }
    const raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])
  const items = [...COINS, ...COINS]
  return (
    <div style={{
      overflow: 'hidden', background: 'var(--bg2)',
      borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      padding: '10px 0', marginBottom: 32, position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, whiteSpace: 'nowrap' }} ref={tickerRef}>
        {items.map((coin, i) => {
          const price = prices[coin.id] ?? 0
          const change = changes[coin.id] ?? 0
          const up = change >= 0
          return (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 28px', borderRight: '1px solid var(--border)' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: coin.color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: coin.color }}>
                {coin.symbol.slice(0, 2)}
              </div>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{coin.symbol}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${fmtPrice(price)}</span>
              <span style={{ fontSize: 11, color: up ? 'var(--up)' : 'var(--down)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 2 }}>
                {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {up ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to right, var(--bg2), transparent)', zIndex: 1 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to left, var(--bg2), transparent)', zIndex: 1 }} />
    </div>
  )
}

function PriceCards({ prices, changes }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
      {COINS.slice(0, 4).map(coin => {
        const price = prices[coin.id] ?? 0
        const change = changes[coin.id] ?? 0
        const up = change >= 0
        return (
          <div key={coin.id} className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: up ? 'var(--up)' : 'var(--down)', opacity: 0.6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: coin.color + '22', border: '1px solid ' + coin.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: coin.color }}>
                  {coin.symbol.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{coin.symbol}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{coin.name}</div>
                </div>
              </div>
              <Sparkline positive={up} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              ${fmtPrice(price)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: up ? 'var(--up)' : 'var(--down)', fontFamily: 'var(--font-mono)' }}>
              {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {up ? '+' : ''}{change.toFixed(2)}% (24h)
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth()
  const { prices, changes, loading: pricesLoading } = usePrices()
  const [holdings, setHoldings] = useState([])
  const [recentTrades, setRecentTrades] = useState([])
  const [time, setTime] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (profile) {
      fetchHoldings()
      fetchRecentTrades()
      refreshProfile()
    }
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
  const startValue = 10000
  const pnl = totalValue - startValue
  const pnlPct = (pnl / startValue) * 100

  const animatedTotal = useCountUp(totalValue)
  const animatedCash = useCountUp(cash)
  const animatedHoldings = useCountUp(holdingValue)

  return (
    <div style={{ padding: '28px 36px', maxWidth: 1200 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700 }}>
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Trader'}
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 13 }}>
            Your portfolio is live and updating in real time
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color: 'var(--accent)' }}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--up)' }} className="pulse" />
            <span style={{ fontSize: 11, color: 'var(--up)' }}>Markets live</span>
          </div>
        </div>
      </div>

      <LiveTicker prices={prices} changes={changes} />
      <PriceCards prices={prices} changes={changes} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          {
            label: 'Total portfolio value',
            value: '$' + fmt(animatedTotal),
            icon: DollarSign,
            sub: (pnl >= 0 ? '+' : '') + '$' + fmt(Math.abs(pnl)) + ' (' + (pnl >= 0 ? '+' : '') + fmt(pnlPct, 2) + '%)',
            subColor: pnl >= 0 ? 'var(--up)' : 'var(--down)',
            accent: 'var(--accent)',
          },
          {
            label: 'Available cash',
            value: '$' + fmt(animatedCash),
            icon: Activity,
            sub: fmt((cash / (totalValue || 1)) * 100, 1) + '% of portfolio',
            subColor: 'var(--muted)',
            accent: 'var(--accent2)',
          },
          {
            label: 'Positions value',
            value: '$' + fmt(animatedHoldings),
            icon: BarChart2,
            sub: holdings.length + ' open position' + (holdings.length !== 1 ? 's' : ''),
            subColor: 'var(--muted)',
            accent: '#9945FF',
          },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%', background: s.accent + '08', transform: 'translate(20px, -20px)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={14} color={s.accent} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.subColor, fontFamily: 'var(--font-mono)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Open positions</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trade')}>Trade</button>
          </div>
          {holdings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
              <BarChart2 size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 13 }}>No open positions. Start trading!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {holdings.map(h => {
                const coin = COINS.find(c => c.symbol === h.symbol)
                const price = coin ? (prices[coin.id] ?? 0) : 0
                const value = h.amount * price
                const pl = (price - h.avg_buy_price) * h.amount
                const plPct = ((price - h.avg_buy_price) / h.avg_buy_price) * 100
                return (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius)', background: 'var(--bg3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: (coin?.color ?? '#888') + '22', border: '1px solid ' + (coin?.color ?? '#888') + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: coin?.color ?? '#888' }}>
                        {h.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{h.symbol}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{fmtCoin(h.amount)} @ ${fmt(h.avg_buy_price)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>${fmt(value)}</div>
                      <div style={{ fontSize: 11, color: pl >= 0 ? 'var(--up)' : 'var(--down)', fontFamily: 'var(--font-mono)' }}>
                        {pl >= 0 ? '+' : ''}{fmt(plPct, 2)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Recent trades</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>View all</button>
          </div>
          {recentTrades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
              <Activity size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 13 }}>No trades yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentTrades.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius)', background: 'var(--bg3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={'badge badge-' + t.side}>{t.side.toUpperCase()}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{t.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{fmtCoin(t.amount)} @ ${fmt(t.price)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>${fmt(t.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
