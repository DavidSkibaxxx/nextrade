import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePrices, COINS } from '../hooks/usePrices'
import { supabase } from '../lib/supabase'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}
function fmtCoin(n) { return n.toFixed(6) }
function fmtPrice(p) { return p < 1 ? p.toFixed(4) : fmt(p) }

export default function Trade() {
  const { profile, refreshProfile } = useAuth()
  const { prices, changes, loading: pricesLoading } = usePrices()
  const [selectedCoin, setSelectedCoin] = useState(COINS[0])
  const [tab, setTab] = useState('buy') // 'buy' | 'sell'
  const [amount, setAmount] = useState('')
  const [holdings, setHoldings] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (profile) fetchHoldings()
  }, [profile?.id])

  async function fetchHoldings() {
    const { data } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', profile.id)
    const map = {}
    for (const h of data ?? []) map[h.symbol] = h
    setHoldings(map)
  }

  const price = prices[selectedCoin.id] ?? 0
  const change = changes[selectedCoin.id] ?? 0
  const total = (parseFloat(amount) || 0) * price
  const cash = Number(profile?.cash_balance ?? 0)
  const heldCoin = holdings[selectedCoin.symbol]?.amount ?? 0

  function setPct(pct) {
    if (tab === 'buy') {
      setAmount(((cash * pct) / price).toFixed(6))
    } else {
      setAmount((heldCoin * pct).toFixed(6))
    }
  }

  async function placeOrder() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return setMessage({ type: 'error', text: 'Enter a valid amount' })
    if (tab === 'buy' && total > cash) return setMessage({ type: 'error', text: 'Insufficient cash balance' })
    if (tab === 'sell' && amt > heldCoin) return setMessage({ type: 'error', text: `Insufficient ${selectedCoin.symbol}` })

    setSubmitting(true)
    setMessage(null)

    const { error: tradeErr } = await supabase.from('trades').insert({
      user_id: profile.id,
      symbol: selectedCoin.symbol,
      side: tab,
      amount: amt,
      price,
      total: amt * price,
    })

    if (tradeErr) { setMessage({ type: 'error', text: tradeErr.message }); setSubmitting(false); return }

    // Update cash balance
    const newCash = tab === 'buy' ? cash - total : cash + (amt * price)
    await supabase.from('profiles').update({ cash_balance: newCash }).eq('id', profile.id)

    // Update holdings
    const currentHolding = holdings[selectedCoin.symbol]
    if (tab === 'buy') {
      const prevAmt = currentHolding?.amount ?? 0
      const prevAvg = currentHolding?.avg_buy_price ?? price
      const newAmt = prevAmt + amt
      const newAvg = (prevAmt * prevAvg + amt * price) / newAmt
      if (currentHolding) {
        await supabase.from('holdings').update({ amount: newAmt, avg_buy_price: newAvg })
          .eq('id', currentHolding.id)
      } else {
        await supabase.from('holdings').insert({
          user_id: profile.id, symbol: selectedCoin.symbol,
          amount: newAmt, avg_buy_price: newAvg
        })
      }
    } else {
      const newAmt = heldCoin - amt
      await supabase.from('holdings').update({ amount: newAmt })
        .eq('id', currentHolding.id)
    }

    await fetchHoldings()
    await refreshProfile()
    setAmount('')
    setMessage({ type: 'success', text: `${tab === 'buy' ? 'Bought' : 'Sold'} ${fmtCoin(amt)} ${selectedCoin.symbol} at $${fmtPrice(price)}` })
    setSubmitting(false)
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }} className="fade-in">
      {/* Left: coin list */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>
          Trade
        </h1>

        <div className="card" style={{ padding: 0 }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '12px 20px', borderBottom: '1px solid var(--border)',
            fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            <span>Asset</span><span style={{ textAlign: 'right' }}>Price</span>
            <span style={{ textAlign: 'right' }}>24h</span>
            <span style={{ textAlign: 'right' }}>Held</span>
          </div>

          {COINS.map(coin => {
            const p = prices[coin.id] ?? 0
            const ch = changes[coin.id] ?? 0
            const held = holdings[coin.symbol]?.amount ?? 0
            const isSelected = selectedCoin.id === coin.id
            return (
              <div
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '14px 20px', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  background: isSelected ? 'rgba(0,212,164,0.04)' : 'transparent',
                  borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg2)' }}
                onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${coin.color}22`, border: `1px solid ${coin.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: coin.color, fontFamily: 'var(--font-mono)'
                  }}>{coin.symbol.slice(0, 2)}</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{coin.symbol}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{coin.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  ${fmtPrice(p)}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <span style={{ color: ch >= 0 ? 'var(--up)' : 'var(--down)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 13 }}>
                    {ch >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(ch).toFixed(2)}%
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'var(--muted)', fontSize: 12 }}>
                  {held > 0 ? fmtCoin(held) : '—'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: order panel */}
      <div>
        <div style={{ height: 54, marginBottom: 24, display: 'flex', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>
              ${fmtPrice(price)}
            </div>
            <div style={{ fontSize: 12, color: change >= 0 ? 'var(--up)' : 'var(--down)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}% (24h)
            </div>
          </div>
        </div>

        <div className="card">
          {/* Buy / Sell tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg)', borderRadius: 'var(--radius)',
            padding: 3, marginBottom: 20, border: '1px solid var(--border)'
          }}>
            {['buy', 'sell'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setAmount(''); setMessage(null) }}
                style={{
                  padding: '9px', border: 'none', borderRadius: 8, cursor: 'pointer',
                  background: tab === t ? (t === 'buy' ? 'rgba(0,200,150,0.15)' : 'rgba(255,71,87,0.15)') : 'transparent',
                  color: tab === t ? (t === 'buy' ? 'var(--up)' : 'var(--down)') : 'var(--muted)',
                  fontWeight: tab === t ? 600 : 400,
                  fontSize: 14, textTransform: 'capitalize', transition: 'all 0.15s',
                }}
              >
                {t === 'buy' ? 'Buy' : 'Sell'} {selectedCoin.symbol}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--muted)' }}>Amount ({selectedCoin.symbol})</span>
                <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {tab === 'buy' ? `Cash: $${fmt(cash)}` : `Held: ${fmtCoin(heldCoin)}`}
                </span>
              </div>
              <input
                type="number"
                placeholder="0.00000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                step="any"
                min="0"
              />
            </div>

            {/* Pct buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[0.25, 0.5, 0.75, 1].map(p => (
                <button
                  key={p}
                  onClick={() => setPct(p)}
                  style={{
                    padding: '6px', borderRadius: 'var(--radius)', border: '1px solid var(--border2)',
                    background: 'var(--bg3)', color: 'var(--muted)', cursor: 'pointer',
                    fontSize: 12, transition: 'all 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                >
                  {p === 1 ? 'MAX' : `${p * 100}%`}
                </button>
              ))}
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Market price</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${fmtPrice(price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, fontWeight: 500 }}>
                <span>Total</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${fmt(total)}</span>
              </div>
            </div>

            {message && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13,
                background: message.type === 'success' ? 'rgba(0,200,150,0.1)' : 'rgba(255,71,87,0.1)',
                color: message.type === 'success' ? 'var(--up)' : 'var(--down)',
                border: `1px solid ${message.type === 'success' ? 'rgba(0,200,150,0.2)' : 'rgba(255,71,87,0.2)'}`
              }}>{message.text}</div>
            )}

            <button
              className={`btn btn-${tab}`}
              disabled={submitting || pricesLoading}
              onClick={placeOrder}
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              {submitting ? 'Processing…' : `Place ${tab} order`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
