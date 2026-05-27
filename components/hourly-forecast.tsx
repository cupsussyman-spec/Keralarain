"use client"

import { useState, useRef, useEffect } from "react"
import { WeatherGlyph, type GlyphKind } from "./weather-glyph"

export interface HourlyItem {
  t: string
  mm: number
  pop: number
  now?: boolean
  band: 'none' | 'light' | 'medium' | 'heavy'
  temp: number
  wind: number
  humidity: number
}

function hourlyWord(h: HourlyItem) {
  if (h.band === 'none')   return h.pop < 35 ? 'Sunny' : 'Cloudy'
  if (h.band === 'light')  return 'Light rain'
  if (h.band === 'medium') return 'Rain'
  return 'Heavy rain'
}

function hourlyGlyph(h: HourlyItem): GlyphKind {
  if (h.band === 'none')   return h.pop < 35 ? 'sun' : 'cloud'
  if (h.band === 'light')  return 'light'
  if (h.band === 'medium') return 'shower'
  return 'heavy'
}

interface HourlyForecastProps {
  data: HourlyItem[]
}

export function HourlyForecast({ data }: HourlyForecastProps) {
  const maxHr = Math.max(...data.map(h => h.mm))
  const trackRef = useRef<HTMLDivElement>(null)
  const [canL, setCanL] = useState(false)
  const [canR, setCanR] = useState(true)
  const [tab, setTab] = useState('today')

  function update() {
    const el = trackRef.current; if (!el) return
    setCanL(el.scrollLeft > 4)
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }
  useEffect(() => {
    const el = trackRef.current; if (!el) return
    update(); el.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  })

  function scrollBy(dir: number) {
    const el = trackRef.current; if (!el) return
    const card = el.querySelector('.hcard') as HTMLElement
    const step = card ? (card.getBoundingClientRect().width + 12) * 3 : 360
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section className="sec" id="hourly">
      <div className="sec-head">
        <div>
          <h2 className="sec-h">Next <em>16 hours</em></h2>
          <div className="sec-sub">Hour-by-hour conditions, temperature and wind.</div>
        </div>
        <div className="sec-toggle">
          {(['today', 'tomorrow', 'week'] as const).map(k => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="hourly-wrap">
        <button className={`hnav hnav-l${canL ? '' : ' off'}`} onClick={() => scrollBy(-1)} aria-label="Earlier hours">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button className={`hnav hnav-r${canR ? '' : ' off'}`} onClick={() => scrollBy(1)} aria-label="Later hours">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <div className="hourly-scroll" ref={trackRef}>
          <div className="hourly-track">
            {data.map((h, i) => (
              <div key={i} className={`hcard${h.now ? ' now' : ''}`} style={{ animationDelay: `${i * 35}ms` }}>
                <div className="hcard-t mono">{h.now ? 'NOW' : h.t}</div>
                <div className="hcard-icon">
                  <WeatherGlyph kind={hourlyGlyph(h)} size={40} />
                </div>
                <div className="hcard-mm">{hourlyWord(h)}</div>
                <div className="hcard-bar"><i style={{ width: `${maxHr > 0 ? (h.mm / maxHr) * 100 : 0}%` }} /></div>
                <div className="hcard-temp">{h.temp}°</div>
                <div className="hcard-meta">
                  <span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h12 a2 2 0 1 0 -2 -2M3 13h16 a2 2 0 1 1 -2 2M3 17h10 a2 2 0 1 1 -2 2" /></svg>
                    {h.wind}
                  </span>
                  <span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5 C 8 9, 5 12, 5 15.5 a7 7 0 0 0 14 0 C 19 12, 16 9, 12 3.5 Z" /></svg>
                    {h.humidity}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
