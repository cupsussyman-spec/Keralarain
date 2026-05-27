"use client"

const AIR_QUALITY = {
  aqi: 42,
  city: 'Ernakulam',
  status: 'Good',
  pollutants: [
    { k: 'PM2.5',       pct: 38, val: '14 µg/m³',  desc: 'Fine particles · within WHO limit' },
    { k: 'PM10',        pct: 52, val: '32 µg/m³',  desc: 'Coarse dust · moderate'            },
    { k: 'Ozone (O₃)', pct: 24, val: '38 µg/m³',  desc: 'Photochemical · low'               },
    { k: 'NO₂',         pct: 31, val: '21 µg/m³',  desc: 'Traffic emissions · low'           },
    { k: 'SO₂',         pct: 12, val: '6 µg/m³',   desc: 'Industry · negligible'             },
    { k: 'CO',          pct: 18, val: '0.6 mg/m³', desc: 'Carbon monoxide · low'             },
  ],
}

function barColor(p: number) {
  if (p <= 25) return '#2F8F4A'
  if (p <= 50) return '#E0A615'
  if (p <= 75) return '#E67A2F'
  return '#C73A2C'
}

const STAT_ICONS: Record<string, JSX.Element> = {
  drop:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5 C 8 9, 5 12, 5 15.5 a7 7 0 0 0 14 0 C 19 12, 16 9, 12 3.5 Z"/></svg>,
  shower: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14 a5 5 0 0 1 1-9.9 6 6 0 0 1 11 2.9 4 4 0 0 1 -1 7M10 18l-1 2M14 18l-1 2"/></svg>,
  cloud:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 a5 5 0 0 1 1-9.9 6 6 0 0 1 11 2.9 4 4 0 0 1 -1 7Z"/></svg>,
  heavy:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14 a5 5 0 0 1 1-9.9 6 6 0 0 1 11 2.9 4 4 0 0 1 -1 7M9 17v3M13 17v3M17 17v3"/></svg>,
}

export interface StatsData {
  todayTotal: number
  weekTotal: number
  monthTotal: number
  yearTotal: number
  averageMonthly: number
  rainyDays: number
  maxRainDay: { date: string; amount: number }
  monsoonProgress: number
}

interface RainStatsSectionProps {
  stats: StatsData
}

export function RainStatsSection({ stats }: RainStatsSectionProps) {
  const a = AIR_QUALITY
  const sev =
    a.aqi <= 50  ? { label: 'Good',                           color: '#2F8F4A' } :
    a.aqi <= 100 ? { label: 'Moderate',                       color: '#E0A615' } :
    a.aqi <= 150 ? { label: 'Unhealthy for sensitive groups', color: '#E67A2F' } :
    a.aqi <= 200 ? { label: 'Unhealthy',                      color: '#C73A2C' } :
                   { label: 'Hazardous',                      color: '#7A2A8A' }

  const cards = [
    { k: 'Today',      v: stats.todayTotal,  ic: 'drop',   trend: '+ 4.1mm vs avg' },
    { k: 'This week',  v: stats.weekTotal,   ic: 'shower', trend: '+ 12% vs 7d avg' },
    { k: 'This month', v: stats.monthTotal,  ic: 'cloud',  trend: '+ 22mm vs avg' },
    { k: 'This year',  v: stats.yearTotal,   ic: 'heavy',  trend: 'on track · normal' },
  ]

  return (
    <section className="sec" id="stats">
      <div className="sec-head">
        <div>
          <h2 className="sec-h">Rainfall <em>statistics</em></h2>
          <div className="sec-sub">Accumulation across windows, monsoon progress, peak day.</div>
        </div>
      </div>

      <div className="statsgrid">
        {cards.map((c, i) => (
          <div key={c.k} className="statcard" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="statcard-ic">{STAT_ICONS[c.ic]}</div>
            <div className="statcard-k">{c.k}</div>
            <div className="statcard-v">{c.v.toFixed(1)}<span className="u">mm</span></div>
            <div className="statcard-trend">{c.trend}</div>
          </div>
        ))}
      </div>

      <div className="statsrow">
        <div className="statspanel">
          <div className="statspanel-head">
            <div>
              <div className="statspanel-k">Monsoon progress</div>
              <div className="statspanel-v">{stats.monsoonProgress}%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="statspanel-k">Average monthly</div>
              <div className="statspanel-v small">{stats.averageMonthly}<span className="u">mm</span></div>
            </div>
          </div>
          <div className="statspanel-bar"><i style={{ width: `${stats.monsoonProgress}%` }} /></div>
          <div className="statspanel-sub">{stats.rainyDays} rainy days this month · Onset confirmed May 6</div>
        </div>
        <div className="statspanel">
          <div className="statspanel-k">Highest rainfall this month</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
            <div>
              <div className="statspanel-big">{stats.maxRainDay.amount.toFixed(1)}<span className="u">mm</span></div>
              <div className="statspanel-sub" style={{ marginTop: 4 }}>{stats.maxRainDay.date} · Wayanad district</div>
            </div>
            <div className="statspanel-glyph">{STAT_ICONS.heavy && <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14 a5 5 0 0 1 1-9.9 6 6 0 0 1 11 2.9 4 4 0 0 1 -1 7M9 17v3M13 17v3M17 17v3"/></svg>}</div>
          </div>
        </div>
      </div>

      {/* Air Quality Panel */}
      <div className="aqi-panel">
        <div className="aqi-head">
          <div>
            <div className="aqi-k">Air quality · {a.city}</div>
            <div className="aqi-big">
              <span className="aqi-num">{a.aqi}</span>
              <span className="aqi-meta">
                <span className="aqi-pill" style={{ color: sev.color, background: `color-mix(in oklab, ${sev.color} 16%, transparent)` }}>
                  <span className="aqi-dot" style={{ background: sev.color }} />
                  {sev.label}
                </span>
                <span className="aqi-sub mono">AQI · updated 4 min ago</span>
              </span>
            </div>
          </div>
          <div className="aqi-scale">
            <div className="aqi-scale-track">
              <i style={{ left: `${Math.min(98, (a.aqi / 300) * 100)}%`, background: sev.color }} />
            </div>
            <div className="aqi-scale-marks mono">
              <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300</span>
            </div>
          </div>
        </div>
        <div className="aqi-table">
          {a.pollutants.map((p, i) => (
            <div key={p.k} className="aqi-row" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="aqi-row-k">{p.k}</span>
              <span className="aqi-row-bar"><i style={{ width: `${p.pct}%`, background: barColor(p.pct) }} /></span>
              <span className="aqi-row-pct mono" style={{ color: barColor(p.pct) }}>{p.pct}%</span>
              <span className="aqi-row-v mono">{p.val}</span>
              <span className="aqi-row-d">{p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
