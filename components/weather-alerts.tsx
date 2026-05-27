"use client"

import { useState } from "react"

export interface AlertItem {
  id: string
  level: 'warn' | 'danger' | 'info'
  title: string
  district: string
  body: string
  time: string
}

interface WeatherAlertsProps {
  alerts: AlertItem[]
}

export function WeatherAlerts({ alerts: initial }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState(initial)
  const [open, setOpen] = useState<string | null>(null)

  if (alerts.length === 0) {
    return (
      <section className="sec" id="alerts">
        <div className="sec-head"><div><h2 className="sec-h">Weather <em>alerts</em></h2></div></div>
        <div className="alert-empty">No active alerts. Skies are quiet.</div>
      </section>
    )
  }

  return (
    <section className="sec" id="alerts">
      <div className="sec-head">
        <div>
          <h2 className="sec-h">Weather <em>alerts</em></h2>
          <div className="sec-sub">Active advisories from IMD and INCOIS. Dismiss to clear from this session.</div>
        </div>
      </div>
      <div className="alertlist">
        {alerts.map((a, i) => (
          <div key={a.id} className={`alertc lvl-${a.level}`} style={{ animationDelay: `${i * 80}ms` }}>
            <span className="alertc-ic">
              {a.level === 'info' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3.5 C 8 9, 5 12, 5 15.5 a7 7 0 0 0 14 0 C 19 12, 16 9, 12 3.5 Z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4 L21 19 H3 Z M12 10v4M12 17v.01" />
                </svg>
              )}
            </span>
            <div className="alertc-body">
              <div className="alertc-title">
                <h4>{a.title}</h4>
                <span className="alertc-meta mono">{a.district.toUpperCase()} · {a.time}</span>
              </div>
              <p className={`alertc-text${open === a.id ? ' open' : ''}`}>{a.body}</p>
              <button className="alertc-more" onClick={() => setOpen(open === a.id ? null : a.id)}>
                {open === a.id ? 'Show less' : 'Read more'}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: open === a.id ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
            <button className="alertc-x" onClick={() => setAlerts(alerts.filter(x => x.id !== a.id))} aria-label="Dismiss">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
