"use client"

export function Header() {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
              <path d="M12 3 C 8.5 8, 6 11, 6 14.2 a6 6 0 0 0 12 0 C 18 11, 15.5 8, 12 3 Z" />
              <path d="M3 19 q 3 -2 6 0 t 6 0 t 6 0" stroke="var(--moss)" />
            </svg>
          </div>
          <div className="brand-name">Keralarain<em>.com</em></div>
        </div>
        <nav className="nav">
          <a className="on" href="#today">Today</a>
          <a href="#hourly">Hourly</a>
          <a href="#districts">Districts</a>
          <a href="#stats">Statistics</a>
          <a href="#alerts">Alerts</a>
        </nav>
        <div className="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" />
          </svg>
          <input placeholder="Find a town in Kerala…" />
          <kbd>⌘K</kbd>
        </div>
      </div>
    </header>
  )
}
