export default function Logo({ size = 36, showText = true, textSize = 13 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f5d76e" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
          <linearGradient id="goldGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8960c" />
            <stop offset="100%" stopColor="#f5d76e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M50 4 L92 27 L92 73 L50 96 L8 73 L8 27 Z" fill="url(#goldGrad2)" opacity="0.15" />
        <path d="M50 4 L92 27 L92 73 L50 96 L8 73 L8 27 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" />
        <line x1="28" y1="35" x2="72" y2="35" stroke="url(#goldGrad)" strokeWidth="7" strokeLinecap="round" filter="url(#glow)" />
        <line x1="28" y1="50" x2="62" y2="50" stroke="url(#goldGrad)" strokeWidth="7" strokeLinecap="round" filter="url(#glow)" />
        <line x1="28" y1="65" x2="72" y2="65" stroke="url(#goldGrad)" strokeWidth="7" strokeLinecap="round" filter="url(#glow)" />
        <line x1="28" y1="35" x2="28" y2="65" stroke="url(#goldGrad)" strokeWidth="7" strokeLinecap="round" />
        <circle cx="76" cy="50" r="4" fill="url(#goldGrad)" filter="url(#glow)" />
        <circle cx="50" cy="8" r="2" fill="#f5d76e" opacity="0.6" />
        <circle cx="50" cy="92" r="2" fill="#f5d76e" opacity="0.6" />
      </svg>
      {showText && (
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: textSize,
            fontWeight: 700, lineHeight: 1.2,
            background: 'linear-gradient(90deg, #d4af37, #f5d76e)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Elite Holding</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: textSize - 2,
            color: 'var(--muted)', lineHeight: 1.2, letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>Traders</div>
        </div>
      )}
    </div>
  )
}
