"use client"

import { WeatherGlyph, type GlyphKind } from "./weather-glyph"

export interface DailyItem {
  name: string
  date: string
  mm: number
  cond: string
  icon: GlyphKind
  hi: number
  lo: number
  band: 'none' | 'light' | 'medium' | 'heavy'
  chance: number
}

interface DailyForecastProps {
  data: DailyItem[]
}

function condClass(cond: string) {
  const c = cond.toLowerCase()
  if (c.includes('thunder') || c.includes('heavy')) return 'cond-red'
  if (c.includes('light') || c.includes('shower') || c.includes('cloud')) return 'cond-blue'
  if (c === 'rain' || c.includes('moderate')) return 'cond-yellow'
  if (c.includes('sun') || c.includes('clear')) return 'cond-sun'
  return 'cond-blue'
}

function glyphFor(band: string): GlyphKind {
  if (band === 'none') return 'partly'
  if (band === 'light') return 'light'
  if (band === 'medium') return 'shower'
  return 'heavy'
}

export function DailyForecast({ data }: DailyForecastProps) {
  return (
    <section className="sec">
      <div className="sec-head">
        <div>
          <h2 className="sec-h">7-day <em>forecast</em></h2>
          <div className="sec-sub">Daily rainfall totals · chance of rain · high / low · ECMWF + IMD ensemble.</div>
        </div>
      </div>
      <div className="drows">
        {data.map((d, i) => (
          <div key={i} className={`drow${i === 0 ? ' today' : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
            <div>
              <div className="drow-name">{i === 0 ? 'Today' : d.name}</div>
              <div className="drow-date">{d.date}</div>
            </div>
            <div className="drow-cond">
              <div className="drow-icon-stack">
                <WeatherGlyph kind={glyphFor(d.band)} size={36} />
                <span className="drow-pop">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 3.5 C 8 9, 5 12, 5 15.5 a7 7 0 0 0 14 0 C 19 12, 16 9, 12 3.5 Z" />
                  </svg>
                  {d.chance}%
                </span>
              </div>
              <span className={`drow-cond-pill drow-cond-lbl ${condClass(d.cond)}`}>{d.cond}</span>
            </div>
            <div className="drow-chance">
              <div className="drow-chance-bar"><i style={{ width: `${d.chance}%` }} /></div>
              <span className="mono drow-chance-pct">{d.chance}%</span>
            </div>
            <div className="drow-mm">{d.mm}<span className="u">mm</span></div>
            <div className="drow-temp"><strong>{d.hi}°</strong><span style={{ color: 'var(--ink-4)' }}>/{d.lo}°</span></div>
          </div>
        ))}
      </div>
    </section>
  )
}
