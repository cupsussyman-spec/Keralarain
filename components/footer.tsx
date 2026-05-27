"use client"

export function Footer() {
  return (
    <footer className="wrap">
      <div>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, fontStyle: 'italic' }}>KeralaRain</span>
        <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-3)', maxWidth: 300 }}>
          A monsoon companion for the Malabar coast.
        </p>
      </div>
      <nav style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['#today', 'Today'], ['#hourly', 'Hourly'], ['#districts', 'Districts'], ['#alerts', 'Alerts'], ['#stats', 'Statistics']].map(([href, label]) => (
          <a key={href} href={href} style={{ color: 'var(--ink-3)', fontSize: 13, textDecoration: 'none' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--ink-3)')}>
            {label}
          </a>
        ))}
      </nav>
      <div className="legal">
        Data · IMD · INCOIS · KSEB · OpenMeteo<br />
        © {new Date().getFullYear()} KeralaRain · Not an official IMD service
      </div>
    </footer>
  )
}
