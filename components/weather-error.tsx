'use client'

interface WeatherErrorProps {
  error: string
  onRetry: () => void
}

export function WeatherError({ error, onRetry }: WeatherErrorProps) {
  return (
    <section
      className="hero"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, minHeight: 280, textAlign: 'center' }}
    >
      {/* Rain-cloud icon */}
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 16.2A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
        <line x1="8" y1="19" x2="8" y2="21" />
        <line x1="8" y1="13" x2="8" y2="15" />
        <line x1="16" y1="19" x2="16" y2="21" />
        <line x1="16" y1="13" x2="16" y2="15" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="12" y1="15" x2="12" y2="17" />
      </svg>

      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>
        Weather data unavailable
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 320, lineHeight: 1.55 }}>
        {error.startsWith('HTTP') ? 'Our weather service is temporarily down.' : error}
      </div>

      <button
        onClick={onRetry}
        style={{
          marginTop: 4,
          padding: '9px 26px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 22,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: '.02em',
          transition: 'opacity .15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '.82' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
      >
        Retry
      </button>
    </section>
  )
}
