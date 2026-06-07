import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Copy, Check, AlertCircle, Clock } from 'lucide-react'

// ─── CONFIGURE YOUR WALLET ADDRESSES HERE ────────────────────────────────────
const WALLETS = [
  {
    coin: 'ETH',
    name: 'Ethereum (ETH/USDT ERC-20)',
    address: '0xYOUR_ETH_ADDRESS_HERE',
    note: 'Send ETH or USDT (ERC-20) only. EVM-compatible.',
    color: '#627EEA',
    minDeposit: 0.01,
    explorerBase: 'https://etherscan.io/tx/',
  },
  {
    coin: 'BTC',
    name: 'Bitcoin (BTC)',
    address: 'YOUR_BTC_ADDRESS_HERE',
    note: 'Send BTC only. Minimum 0.0001 BTC.',
    color: '#F7931A',
    minDeposit: 0.0001,
    explorerBase: 'https://www.blockchain.com/explorer/transactions/btc/',
  },
  {
    coin: 'USDT',
    name: 'Tether (USDT TRC-20)',
    address: 'YOUR_TRC20_ADDRESS_HERE',
    note: 'Send USDT on Tron network (TRC-20) only.',
    color: '#26A17B',
    minDeposit: 10,
    explorerBase: 'https://tronscan.org/#/transaction/',
  },
]
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export default function Deposit() {
  const { profile } = useAuth()
  const [selectedWallet, setSelectedWallet] = useState(WALLETS[0])
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ txHash: '', amount: '', coin: 'ETH' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [myDeposits, setMyDeposits] = useState(null)
  const [loadingDeposits, setLoadingDeposits] = useState(false)

  function copyAddress() {
    navigator.clipboard.writeText(selectedWallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function loadMyDeposits() {
    setLoadingDeposits(true)
    const { data } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    setMyDeposits(data ?? [])
    setLoadingDeposits(false)
  }

  async function submitDeposit(e) {
    e.preventDefault()
    if (!form.txHash.trim()) return setMessage({ type: 'error', text: 'Please enter a transaction hash' })
    if (!form.amount || parseFloat(form.amount) <= 0) return setMessage({ type: 'error', text: 'Please enter the amount you sent' })

    setSubmitting(true)
    setMessage(null)

    const { error } = await supabase.from('deposits').insert({
      user_id: profile.id,
      tx_hash: form.txHash.trim(),
      coin: selectedWallet.coin,
      amount: parseFloat(form.amount),
      status: 'pending',
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Deposit submitted! Our team will verify and credit your account within 24 hours.' })
      setForm({ txHash: '', amount: '', coin: selectedWallet.coin })
      loadMyDeposits()
    }
    setSubmitting(false)
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Deposit
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>
          Send crypto to your account. Your balance will be credited after verification.
        </p>
      </div>

      {/* Warning banner */}
      <div style={{
        display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius)',
        background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)',
        marginBottom: 24, alignItems: 'flex-start'
      }}>
        <AlertCircle size={16} color="#ffaa00" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 13 }}>
          <strong style={{ color: '#ffaa00' }}>Important:</strong> Only send the correct coin to each address.
          Sending the wrong coin will result in permanent loss of funds. Double-check the network before sending.
        </div>
      </div>

      {/* Network selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {WALLETS.map(w => (
          <button
            key={w.coin}
            onClick={() => { setSelectedWallet(w); setForm(f => ({ ...f, coin: w.coin })) }}
            style={{
              padding: '14px', borderRadius: 'var(--radius-lg)',
              background: selectedWallet.coin === w.coin ? `${w.color}15` : 'var(--bg2)',
              border: `1px solid ${selectedWallet.coin === w.coin ? w.color + '60' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: w.color, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              {w.coin}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.name.split('(')[0].trim()}</div>
          </button>
        ))}
      </div>

      {/* Address card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {selectedWallet.name}
          </h3>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Min: {selectedWallet.minDeposit} {selectedWallet.coin}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>{selectedWallet.note}</p>

        {/* Address box */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', padding: '12px 16px', gap: 12
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)',
            wordBreak: 'break-all', flex: 1
          }}>
            {selectedWallet.address}
          </span>
          <button
            onClick={copyAddress}
            className="btn btn-secondary btn-sm"
            style={{ flexShrink: 0, gap: 6 }}
          >
            {copied ? <Check size={13} color="var(--up)" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Submit TX hash form */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 6 }}>
          Confirm your deposit
        </h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
          After sending, paste your transaction hash below. Find it in your wallet's transaction history or on the block explorer.
        </p>

        <form onSubmit={submitDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              Transaction hash (TX ID)
            </label>
            <input
              type="text"
              placeholder="e.g. 0xabc123... or a Bitcoin txid"
              value={form.txHash}
              onChange={e => setForm(f => ({ ...f, txHash: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                Amount sent
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="any"
                min="0"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                Coin
              </label>
              <input type="text" value={selectedWallet.coin} readOnly style={{ color: 'var(--muted)' }} />
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
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ justifyContent: 'center', padding: '12px' }}
          >
            {submitting ? 'Submitting…' : 'Submit deposit for verification'}
          </button>
        </form>
      </div>

      {/* Deposit history */}
      <div style={{ marginTop: 24 }}>
        <button
          className="btn btn-secondary"
          onClick={loadMyDeposits}
          style={{ marginBottom: 16 }}
        >
          <Clock size={14} />
          {myDeposits === null ? 'View my deposit history' : 'Refresh history'}
        </button>

        {myDeposits !== null && (
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>TX Hash</span><span>Coin</span><span>Amount</span><span>Status</span>
            </div>
            {myDeposits.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No deposits yet</div>
            ) : myDeposits.map(d => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
                <a
                  href={`${selectedWallet.explorerBase}${d.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent2)', fontSize: 11, textDecoration: 'none' }}
                >
                  {d.tx_hash.slice(0, 14)}…{d.tx_hash.slice(-6)}
                </a>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{d.coin}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{d.amount}</span>
                <span className={`badge badge-${d.status}`}>{d.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
