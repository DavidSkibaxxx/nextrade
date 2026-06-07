import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePrices, COINS } from '../hooks/usePrices'
import { supabase } from '../lib/supabase'
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}
function fmtCoin(n) {
  return n < 0.001 ? n.toFixed(6) : n < 1 ? n.toFixed(4) : n.toFixed(4)
}

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth()
  const { prices, changes, loading: pricesLoading } = usePrices()
  const [holdings, setHoldings] = useState([])
  const [recentTrades, setRecentTrades] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (profile) {
      fetchHoldings()
      fetchRecentTrades()
      refreshProfile()
    }
  }, [profile?.id])

  async function fetchHoldings() {
    const { data } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', profile.id)
      .gt('amount', 0)
    setHoldings(data ?? [])
  }

  async function fetchRecentTrades() {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentTrades(data ?? [])
  }

  const holdingValue = holdings.reduce((sum, h) => {
    const coin = COINS.find(c => c.symbol === h.symbol)
    const price = coin ? (prices[coin.id] ?? 0) : 0
    return sum + h.amount * price
  }, 0)

  const cash = profile?.cash_balance ?? 0
  const totalValue = Number(cash) + holdingValue
  const startValue = 10000
  const pnl = totalValue - startValue
  const pnlPct = (pnl / startValue) * 100

  const statCards = [
    {
      label: 'Total portfolio value',
      value: `$${fmt(totalValue)}`,
      icon: DollarSign,
      sub: `${pnl >= 0 ? '+' : ''}$${fmt(Math.abs(pnl))} (${pnl >= 0 ? '+' : ''}${fmt(pnlPct, 2)}%)`,
      subColor: pnl >= 0 ? 'var(--up)' : 'var(--down)',
    },
    {
      label: 'Available cash',
      value: `$${fmt(cash)}`,
      icon: Activity,
      sub: `${fmt((Number(cash) / totalValue) * 100, 1)}% of portfolio`,
      subColor: 'var(--muted)',
    },
    {
      label: 'Positions value',
      value: `$${fmt(holdingValue)}`,
      icon: BarChart2,
      sub: `${holdings.length} open position${holdings.length !== 1 ? 's' : ''}`,
      subColor: 'var(--muted)',
    },
  ]

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Trader'}
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>
          Here's your portfolio overview
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,212,164,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={14} color="var(--accent)" />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.subColor, fontFamily: 'var(--font-mono)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Holdings */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Positions</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trade')}>Trade</button>
          </div>
          {holdings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
              <BarChart2 size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 13 }}>No open positions. Start trading!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {holdings.map(h => {
                const coin = COINS.find(c => c.symbol === h.symbol)
                const price = coin ? (prices[coin.id] ?? 0) : 0
                const value = h.amount * price
                const pl = (price - h.avg_buy_price) * h.amount
                const plPct = ((price - h.avg_buy_price) / h.avg_buy_price) * 100
                return (
                  <div key={h.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 'var(--radius)',
                    background: 'var(--bg3)', marginBottom: 2
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `${coin?.color ?? '#888'}22`,
                        border: `1px solid ${coin?.color ?? '#888'}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, color: coin?.color ?? '#888', fontFamily: 'var(--font-mono)'
                      }}>{h.symbol.slice(0, 2)}</div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{h.symbol}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                          {fmtCoin(h.amount)} @ ${fmt(h.avg_buy_price)}
                        </div>
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

        {/* Recent trades */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentTrades.map(t => (
                <div key={t.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 'var(--radius)', background: 'var(--bg3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge badge-${t.side}`}>{t.side.toUpperCase()}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{t.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        {fmtCoin(t.amount)} @ ${fmt(t.price)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    ${fmt(t.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
