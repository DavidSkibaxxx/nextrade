import { useState, useEffect, useRef } from 'react'

export const COINS = [
  { id: 'bitcoin',  symbol: 'BTC', name: 'Bitcoin',  color: '#F7931A' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'solana',   symbol: 'SOL', name: 'Solana',   color: '#9945FF' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB',   color: '#F3BA2F' },
  { id: 'cardano',  symbol: 'ADA', name: 'Cardano',  color: '#0D1E7A' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633' },
  { id: 'ripple',   symbol: 'XRP', name: 'XRP',      color: '#00AAE4' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
]

const IDS = COINS.map(c => c.id).join(',')

// Simulated fallback prices if API fails
const FALLBACK = {
  bitcoin: 67420, ethereum: 3510, solana: 178,
  binancecoin: 602, cardano: 0.62, dogecoin: 0.183,
  ripple: 0.58, polkadot: 8.4
}

export function usePrices() {
  const [prices, setPrices] = useState({})
  const [changes, setChanges] = useState({})
  const [loading, setLoading] = useState(true)
  const prevRef = useRef({})

  async function fetchPrices() {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${IDS}&vs_currencies=usd&include_24hr_change=true`
      )
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      const newPrices = {}
      const newChanges = {}
      for (const coin of COINS) {
        newPrices[coin.id] = data[coin.id]?.usd ?? FALLBACK[coin.id]
        newChanges[coin.id] = data[coin.id]?.usd_24h_change ?? 0
      }
      prevRef.current = prices
      setPrices(newPrices)
      setChanges(newChanges)
    } catch {
      // Use simulated prices with small random drift if API unavailable
      setPrices(prev => {
        const next = { ...prev }
        for (const coin of COINS) {
          const base = prev[coin.id] || FALLBACK[coin.id]
          next[coin.id] = Math.max(base * (1 + (Math.random() - 0.499) * 0.003), 0.001)
        }
        return next
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // every 30s (CoinGecko free limit)
    return () => clearInterval(interval)
  }, [])

  function getPrice(coinId) {
    return prices[coinId] ?? FALLBACK[coinId]
  }

  return { prices, changes, loading, getPrice }
}
