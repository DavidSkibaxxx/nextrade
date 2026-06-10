import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { AlertCircle } from 'lucide-react'

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

const COINS = [
  { coin: 'BTC', name: 'Bitcoin', color: '#F7931A', min: 0.0001 },
  { coin: 'ETH', name: 'Ethereum (ERC-20)', color: '#627EEA', min: 0.01 },
  { coin: 'USDT', name: 'Tether (TRC-20)', color: '#26A17B', min: 10 },
]

export default function Withdraw() {
  const { profile, refreshProfile } = useAuth()
  const [selectedCoin, setSelectedCoin] = useState(COINS[0])
  const [form, setForm] = useState({ amount: '', walletAddress: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [myWithdrawals, setMyWithdrawals] = useState([])

  useEffect(() => {
    if (profile) { loadMyWithdrawals(); refreshProfile() }
  }, [profile?.id])

  async function loadMyWithdrawals() {
    const { data } = await supabase.from('withdrawals').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
    setMyWithdrawals(data ?? [])
  }

  async function submitWithdrawal(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) return setMessage({ type: 'error', text: 'Please enter a valid amount' })
    if (amount > Number(profile?.cash_balance ?? 0)) return setMessage({ type: 'error', text: 'Insufficient balance. Available: $' + fmt(profile?.cash_balance) })
    if (!form.walletAddress.trim()) return setMessage({ type: 'error', text: 'Please enter your wallet address' })
    if (amount < selectedCoin.min) return setMessage({ type: 'error', text: 'Minimum withdrawal is ' + selectedCoin.min + ' ' + selectedCoin.coin })

    setSubmitting(true)
    setMessage(null)

    const { error } = await supabase.from('withdrawals').insert({
      user_id: profile.id,
      amount: amount,
      coin: selectedCoin.coin,
      wallet_address: form.walletAddress.trim(),
      status: 'pending',
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Withdrawal request submitted! Our team will process it within 24 hours.' })
      setForm({ amount: '', walletAddress: '' })
      loadMyWithdrawals()
    }
    setSubmitting(false)
  }

  const cash = Number(profile?.cash_balance ?? 0)
  const totalPending = myWithdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + Number(w.amount), 0)

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Withdraw
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Request a withdrawal to your crypto wallet</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Available balance</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, color: 'var(--accent)' }}>${fmt(cash)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Pending withdrawals</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, color: totalPending > 0 ? '#ffaa00' : 'var(--muted)' }}>${fmt(totalPending)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius)', background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)', marginBottom: 24, alignItems: 'flex-start' }}>
        <AlertCircle size={16} color="#ffaa00" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 13 }}>
          <strong style={{ color: '#ffaa00' }}>Important:</strong> Make sure to enter the correct wallet address. Sending to the wrong address will result in permanent loss of funds. Withdrawals are processed within 24 hours.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {COINS.map(c => (
          <button key={c.coin} onClick={() => setSelectedCoin(c)} style={{
            padding: '14px', borderRadius: 'var(--radius-lg)',
            background: selectedCoin.coin === c.coin ? c.color + '15' : 'var(--bg2)',
            border: '1px solid ' + (selectedCoin.coin === c.coin ? c.color + '60' : 'var(--border)'),
            cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{c.coin}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Min: {c.min} {c.coin}</div>
          </button>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 6 }}>
          Withdraw {selectedCoin.coin}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
          Enter the amount and your {selectedCoin.coin} wallet address to receive funds.
        </p>

        <form onSubmit={submitWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <label style={{ color: 'var(--muted)' }}>Amount (USD)</label>
              <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Available: ${fmt(cash)}</span>
            </div>
            <input type="number" placeholder="0.00" step="any" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 8 }}>
              {[0.25, 0.5, 0.75, 1].map(p => (
                <button key={p} type="button" onClick={() => setForm(f => ({ ...f, amount: (cash * p).toFixed(2) }))}
                  style={{ padding: '6px', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                >
                  {p === 1 ? 'MAX' : p * 100 + '%'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              Your {selectedCoin.coin} wallet address
            </label>
            <input type="text" placeholder={'Enter your ' + selectedCoin.coin + ' wallet address'} value={form.walletAddress} onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))} />
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: 14, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Withdrawal amount</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>${fmt(parseFloat(form.amount) || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Coin</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: selectedCoin.color }}>{selectedCoin.coin}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Processing time</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>Up to 24 hours</span>
            </div>
          </div>

          {message && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13, background: message.type === 'success' ? 'rgba(0,200,150,0.1)' : 'rgba(255,71,87,0.1)', color: message.type === 'success' ? 'var(--up)' : 'var(--down)', border: '1px solid ' + (message.type === 'success' ? 'rgba(0,200,150,0.2)' : 'rgba(255,71,87,0.2)') }}>
              {message.text}
            </div>
          )}

          <button type="submit" className="btn btn-sell" disabled={submitting || cash <= 0} style={{ justifyContent: 'center', padding: '12px', fontSize: 15 }}>
            {submitting ? 'Submitting...' : 'Submit withdrawal request'}
          </button>
        </form>
      </div>

      {myWithdrawals.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 14 }}>Withdrawal history</h3>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
              <span>Date</span><span>Coin</span><span>Amount</span><span>Status</span>
            </div>
            {myWithdrawals.map(w => (
              <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{w.coin}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${fmt(w.amount)}</span>
                <span className={'badge badge-' + w.status}>{w.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
