import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Shield, Check, X, ExternalLink, RefreshCw, Plus, Minus, DollarSign, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
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
  const [withdrawals, setWithdrawals] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('deposits')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [note, setNote] = useState({})
  const [adjustments, setAdjustments] = useState({})
  const [adjustMode, setAdjustMode] = useState({})
  const [adjustMsg, setAdjustMsg] = useState({})
  const [manualForm, setManualForm] = useState({})

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/dashboard')
    if (profile?.is_admin) { fetchDeposits(); fetchWithdrawals(); fetchUsers() }
  }, [profile?.id])

  async function fetchDeposits() {
    setLoading(true)
    const { data } = await supabase.from('deposits').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
    setDeposits(data ?? [])
    setLoading(false)
  }

  async function fetchWithdrawals() {
    const { data } = await supabase.from('withdrawals').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
    setWithdrawals(data ?? [])
  }

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data ?? [])
  }

  async function handleDeposit(depositId, action) {
    setProcessing(depositId)
    const deposit = deposits.find(d => d.id === depositId)
    if (action === 'confirm') {
      const usdAmount = parseFloat(note[depositId]) || parseFloat(deposit.amount) || 0
      const { data: userProfile } = await supabase.from('profiles').select('cash_balance').eq('id', deposit.user_id).single()
      await supabase.from('profiles').update({ cash_balance: Number(userProfile.cash_balance) + usdAmount }).eq('id', deposit.user_id)
    }
    await supabase.from('deposits').update({ status: action === 'confirm' ? 'confirmed' : 'rejected', admin_note: note[depositId] || null }).eq('id', depositId)
    await fetchDeposits()
    await fetchUsers()
    setProcessing(null)
  }

  async function handleWithdrawal(withdrawalId, action) {
    setProcessing(withdrawalId)
    const withdrawal = withdrawals.find(w => w.id === withdrawalId)
    if (action === 'confirm') {
      const { data: userProfile } = await supabase.from('profiles').select('cash_balance').eq('id', withdrawal.user_id).single()
      await supabase.from('profiles').update({ cash_balance: Math.max(0, Number(userProfile.cash_balance) - Number(withdrawal.amount)) }).eq('id', withdrawal.user_id)
    }
    await supabase.from('withdrawals').update({ status: action === 'confirm' ? 'confirmed' : 'rejected', admin_note: note[withdrawalId] || null }).eq('id', withdrawalId)
    await fetchWithdrawals()
    await fetchUsers()
    setProcessing(null)
  }

  async function addManualTransaction(userId, type) {
    const form = manualForm[userId + type] || {}
    if (!form.amount || !form.coin) {
      setAdjustMsg(m => ({ ...m, [userId + type]: { type: 'error', text: 'Enter amount and coin' } }))
      return
    }
    setProcessing(userId + type)

    if (type === 'deposit') {
      await supabase.from('deposits').insert({
        user_id: userId, tx_hash: 'MANUAL-' + Date.now(),
        coin: form.coin, amount: parseFloat(form.amount), status: 'confirmed'
      })
      const { data: userProfile } = await supabase.from('profiles').select('cash_balance').eq('id', userId).single()
      await supabase.from('profiles').update({ cash_balance: Number(userProfile.cash_balance) + parseFloat(form.amount) }).eq('id', userId)
    } else {
      await supabase.from('withdrawals').insert({
        user_id: userId, wallet_address: form.wallet || 'MANUAL',
        coin: form.coin, amount: parseFloat(form.amount), status: form.status || 'pending'
      })
      if (form.status === 'confirmed') {
        const { data: userProfile } = await supabase.from('profiles').select('cash_balance').eq('id', userId).single()
        await supabase.from('profiles').update({ cash_balance: Math.max(0, Number(userProfile.cash_balance) - parseFloat(form.amount)) }).eq('id', userId)
      }
    }

    setAdjustMsg(m => ({ ...m, [userId + type]: { type: 'success', text: type + ' added successfully!' } }))
    setManualForm(f => ({ ...f, [userId + type]: {} }))
    await fetchDeposits(); await fetchWithdrawals(); await fetchUsers()
    setProcessing(null)
    setTimeout(() => setAdjustMsg(m => ({ ...m, [userId + type]: null })), 3000)
  }

  async function adjustBalance(userId, mode, amount) {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setAdjustMsg(m => ({ ...m, [userId]: { type: 'error', text: 'Enter a valid amount' } }))
      return
    }
    setProcessing(userId)
    const user = users.find(u => u.id === userId)
    const current = Number(user.cash_balance)
    let newBalance
    if (mode === 'add') newBalance = current + Number(amount)
    else if (mode === 'subtract') newBalance = Math.max(0, current - Number(amount))
    else if (mode === 'set') newBalance = Number(amount)
    const { error } = await supabase.from('profiles').update({ cash_balance: newBalance }).eq('id', userId)
    if (error) {
      setAdjustMsg(m => ({ ...m, [userId]: { type: 'error', text: error.message } }))
    } else {
      setAdjustMsg(m => ({ ...m, [userId]: { type: 'success', text: 'Balance updated to $' + fmt(newBalance) } }))
      setAdjustments(a => ({ ...a, [userId]: '' }))
      await fetchUsers()
    }
    setProcessing(null)
    setTimeout(() => setAdjustMsg(m => ({ ...m, [userId]: null })), 3000)
  }

  const pendingDeposits = deposits.filter(d => d.status === 'pending')
  const resolvedDeposits = deposits.filter(d => d.status !== 'pending')
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending')
  const resolvedWithdrawals = withdrawals.filter(w => w.status !== 'pending')

  if (!profile?.is_admin) return null

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,170,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="#ffaa00" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700 }}>Admin Panel</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Manage deposits, withdrawals and balances</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { fetchDeposits(); fetchWithdrawals(); fetchUsers() }} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Pending deposits', value: pendingDeposits.length, color: '#ffaa00' },
          { label: 'Pending withdrawals', value: pendingWithdrawals.length, color: '#ffaa00' },
          { label: 'Total users', value: users.length, color: 'var(--accent)' },
          { label: 'Total deposited', value: '$' + fmt(deposits.filter(d => d.status === 'confirmed').reduce((s, d) => s + Number(d.amount), 0)), color: 'var(--up)' },
          { label: 'Total withdrawn', value: '$' + fmt(withdrawals.filter(w => w.status === 'confirmed').reduce((s, w) => s + Number(w.amount), 0)), color: 'var(--down)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {[['deposits', 'Deposits'], ['withdrawals', 'Withdrawals'], ['users', 'Manage Balances']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 18px', border: 'none', background: 'none',
            color: tab === key ? 'var(--accent)' : 'var(--muted)',
            borderBottom: '2px solid ' + (tab === key ? 'var(--accent)' : 'transparent'),
            cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {/* Deposits Tab */}
      {tab === 'deposits' && (
        <div>
          {pendingDeposits.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffaa00', display: 'inline-block' }} className="pulse" />
                Pending deposits ({pendingDeposits.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingDeposits.map(d => (
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
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{d.tx_hash.slice(0, 20)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>USD amount to credit</div>
                        <input type="number" placeholder="Enter USD value (e.g. 500)" value={note[d.id] || ''} onChange={e => setNote(n => ({ ...n, [d.id]: e.target.value }))} style={{ fontSize: 13 }} />
                      </div>
                      <button className="btn btn-success btn-sm" disabled={processing === d.id} onClick={() => handleDeposit(d.id, 'confirm')} style={{ flexShrink: 0 }}>
                        <Check size={13} /> Approve
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={processing === d.id} onClick={() => handleDeposit(d.id, 'reject')} style={{ flexShrink: 0 }}>
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pendingDeposits.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', marginBottom: 24 }}>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>No pending deposits</div>
            </div>
          )}
          {resolvedDeposits.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 14 }}>Resolved deposits</h3>
              <div className="card" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                  <span>User</span><span>Amount</span><span>Coin</span><span>Status</span><span>Date</span>
                </div>
                {resolvedDeposits.map(d => (
                  <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
                    <span>{d.profiles?.full_name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{d.amount}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{d.coin}</span>
                    <span className={'badge badge-' + d.status}>{d.status}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Withdrawals Tab */}
      {tab === 'withdrawals' && (
        <div>
          {pendingWithdrawals.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffaa00', display: 'inline-block' }} className="pulse" />
                Pending withdrawals ({pendingWithdrawals.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingWithdrawals.map(w => (
                  <div key={w.id} className="card" style={{ borderColor: 'rgba(255,170,0,0.2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>User</div>
                        <div style={{ fontWeight: 500 }}>{w.profiles?.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{w.profiles?.email}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Amount</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{w.amount} {w.coin}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(w.created_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Wallet address</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{w.wallet_address.slice(0, 20)}...</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-success btn-sm" disabled={processing === w.id} onClick={() => handleWithdrawal(w.id, 'confirm')} style={{ flexShrink: 0 }}>
                        <Check size={13} /> Confirm sent
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={processing === w.id} onClick={() => handleWithdrawal(w.id, 'reject')} style={{ flexShrink: 0 }}>
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pendingWithdrawals.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', marginBottom: 24 }}>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>No pending withdrawals</div>
            </div>
          )}
          {resolvedWithdrawals.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 14 }}>Resolved withdrawals</h3>
              <div className="card" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '10px 20px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                  <span>User</span><span>Amount</span><span>Coin</span><span>Status</span><span>Date</span>
                </div>
                {resolvedWithdrawals.map(w => (
                  <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
                    <span>{w.profiles?.full_name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{w.amount}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{w.coin}</span>
                    <span className={'badge badge-' + w.status}>{w.status}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(w.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manage Balances Tab */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {users.map(u => (
            <div key={u.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{u.full_name}</span>
                    {u.is_admin && <span style={{ fontSize: 10, background: 'rgba(255,170,0,0.15)', color: '#ffaa00', padding: '2px 6px', borderRadius: 4 }}>ADMIN</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Current balance</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, color: 'var(--accent)' }}>${fmt(u.cash_balance)}</div>
                </div>
              </div>

              {/* Balance adjustment */}
              <div style={{ marginBottom: 16, padding: '14px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, fontWeight: 500 }}>Adjust balance</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {[['add', 'Add', 'var(--up)'], ['subtract', 'Deduct', 'var(--down)'], ['set', 'Set', 'var(--accent)']].map(([mode, label, color]) => (
                    <button key={mode} onClick={() => setAdjustMode(a => ({ ...a, [u.id]: mode }))} style={{
                      padding: '6px 14px', borderRadius: 'var(--radius)', fontSize: 12,
                      border: '1px solid ' + (adjustMode[u.id] === mode ? color : 'var(--border2)'),
                      background: adjustMode[u.id] === mode ? color + '22' : 'transparent',
                      color: adjustMode[u.id] === mode ? color : 'var(--muted)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>{label}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input type="number" placeholder="Amount..." value={adjustments[u.id] || ''} onChange={e => setAdjustments(a => ({ ...a, [u.id]: e.target.value }))} style={{ fontSize: 13 }} disabled={!adjustMode[u.id]} />
                  <button onClick={() => adjustBalance(u.id, adjustMode[u.id], adjustments[u.id])} disabled={processing === u.id || !adjustMode[u.id]} style={{ padding: '10px 20px', borderRadius: 'var(--radius)', border: 'none', background: 'linear-gradient(135deg, #d4af37, #f5d76e)', color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0, opacity: !adjustMode[u.id] ? 0.4 : 1 }}>
                    Apply
                  </button>
                </div>
                {adjustMsg[u.id] && (
                  <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 'var(--radius)', fontSize: 13, background: adjustMsg[u.id].type === 'success' ? 'rgba(0,200,150,0.1)' : 'rgba(255,71,87,0.1)', color: adjustMsg[u.id].type === 'success' ? 'var(--up)' : 'var(--down)', border: '1px solid ' + (adjustMsg[u.id].type === 'success' ? 'rgba(0,200,150,0.2)' : 'rgba(255,71,87,0.2)') }}>
                    {adjustMsg[u.id].text}
                  </div>
                )}
              </div>

              {/* Manual deposit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 10, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowDownCircle size={13} /> Add deposit record
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input type="number" placeholder="Amount (USD)" value={manualForm[u.id + 'deposit']?.amount || ''} onChange={e => setManualForm(f => ({ ...f, [u.id + 'deposit']: { ...f[u.id + 'deposit'], amount: e.target.value } }))} style={{ fontSize: 12 }} />
                    <select value={manualForm[u.id + 'deposit']?.coin || ''} onChange={e => setManualForm(f => ({ ...f, [u.id + 'deposit']: { ...f[u.id + 'deposit'], coin: e.target.value } }))} style={{ fontSize: 12 }}>
                      <option value="">Select coin</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                    </select>
                    <button onClick={() => addManualTransaction(u.id, 'deposit')} disabled={processing === u.id + 'deposit'} className="btn btn-success btn-sm" style={{ justifyContent: 'center' }}>
                      <Plus size={12} /> Add deposit
                    </button>
                  </div>
                  {adjustMsg[u.id + 'deposit'] && (
                    <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, fontSize: 12, background: adjustMsg[u.id + 'deposit'].type === 'success' ? 'rgba(0,200,150,0.1)' : 'rgba(255,71,87,0.1)', color: adjustMsg[u.id + 'deposit'].type === 'success' ? 'var(--up)' : 'var(--down)' }}>
                      {adjustMsg[u.id + 'deposit'].text}
                    </div>
                  )}
                </div>

                {/* Manual withdrawal */}
                <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,71,87,0.2)' }}>
                  <div style={{ fontSize: 12, color: 'var(--down)', marginBottom: 10, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowUpCircle size={13} /> Add withdrawal record
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input type="number" placeholder="Amount (USD)" value={manualForm[u.id + 'withdrawal']?.amount || ''} onChange={e => setManualForm(f => ({ ...f, [u.id + 'withdrawal']: { ...f[u.id + 'withdrawal'], amount: e.target.value } }))} style={{ fontSize: 12 }} />
                    <select value={manualForm[u.id + 'withdrawal']?.coin || ''} onChange={e => setManualForm(f => ({ ...f, [u.id + 'withdrawal']: { ...f[u.id + 'withdrawal'], coin: e.target.value } }))} style={{ fontSize: 12 }}>
                      <option value="">Select coin</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                    </select>
                    <select value={manualForm[u.id + 'withdrawal']?.status || ''} onChange={e => setManualForm(f => ({ ...f, [u.id + 'withdrawal']: { ...f[u.id + 'withdrawal'], status: e.target.value } }))} style={{ fontSize: 12 }}>
                      <option value="">Select status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                    <button onClick={() => addManualTransaction(u.id, 'withdrawal')} disabled={processing === u.id + 'withdrawal'} className="btn btn-danger btn-sm" style={{ justifyContent: 'center' }}>
                      <Plus size={12} /> Add withdrawal
                    </button>
                  </div>
                  {adjustMsg[u.id + 'withdrawal'] && (
                    <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, fontSize: 12, background: adjustMsg[u.id + 'withdrawal'].type === 'success' ? 'rgba(0,200,150,0.1)' : 'rgba(255,71,87,0.1)', color: adjustMsg[u.id + 'withdrawal'].type === 'success' ? 'var(--up)' : 'var(--down)' }}>
                      {adjustMsg[u.id + 'withdrawal'].text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
