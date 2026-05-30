"use client"

import { useEffect, useRef, useMemo } from "react"
import { relativeUpdated } from "@/lib/weather-transforms"

type WeatherKind = 'sunny' | 'cloudy' | 'light' | 'moderate' | 'heavy' | 'very-heavy' | 'storm'

function autoKind(mm: number): WeatherKind {
  if (mm <= 0)    return 'sunny'
  if (mm < 0.5)   return 'cloudy'
  if (mm < 2.5)   return 'light'
  if (mm < 7.5)   return 'moderate'
  if (mm < 15)    return 'heavy'
  if (mm < 30)    return 'very-heavy'
  return 'storm'
}

const CAT: Record<WeatherKind, { label: string; chip?: string; advice: string; ml: string; sev: 'safe' | 'warn' | 'danger' }> = {
  sunny:        { label: 'Sunny',          advice: 'Clear skies. Good time to step out.',                           ml: '—',          sev: 'safe' },
  cloudy:       { label: 'Cloudy',         advice: 'Overcast. Light umbrella, just in case.',                       ml: 'trace',      sev: 'safe' },
  light:        { label: 'Light rain',     advice: 'Umbrella is enough.',                                           ml: '½ glass',    sev: 'safe' },
  moderate:     { label: 'Moderate rain',  advice: 'Carry a raincoat. Roads stay slick.',                           ml: '1 glass',    sev: 'warn' },
  heavy:        { label: 'Heavy rain',     advice: 'Avoid low-lying roads. Drive slow.',                            ml: '1 bucket',   sev: 'warn' },
  'very-heavy': { label: 'Thunderstorm (stay inside)', chip: 'Heavy rain', advice: 'Stay indoors if you can. Flooding likely on streets.', ml: '2 buckets', sev: 'danger' },
  storm:        { label: 'Thunderstorm (stay inside)', chip: 'Heavy rain', advice: 'Do not travel. Move to higher ground if near rivers.', ml: '3+ buckets', sev: 'danger' },
}

const SEV_COLOR = {
  safe:   { color: '#2F8F4A', soft: 'rgba(47,143,74,.14)'  },
  warn:   { color: '#C99416', soft: 'rgba(201,148,22,.16)' },
  danger: { color: '#C13B2A', soft: 'rgba(193,59,42,.14)'  },
}

function DialCanvas({ pct, kind }: { pct: number; kind: WeatherKind }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d')!
    let raf: number; let t = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const RAIN_COUNT: Record<WeatherKind, number> = {
      sunny: 0, cloudy: 0, light: 28, moderate: 70, heavy: 130, 'very-heavy': 200, storm: 240,
    }
    const SPEED_MUL: Partial<Record<WeatherKind, number>> = { light: 0.6, moderate: 0.85, heavy: 1.0, 'very-heavy': 1.2, storm: 1.4 }
    interface Drop { x: number; y: number; depth: number; speed: number; len: number; alpha: number; wob: number }
    interface Ripple { x: number; y: number; r: number; max: number; a: number }
    interface Cloud { x: number; y: number; s: number; v: number; a: number }
    interface Lightning { active: boolean; until: number; next: number; bx: number; path: [number,number][] }
    let drops: Drop[] = [], ripples: Ripple[] = [], clouds: Cloud[] = []
    let lightning: Lightning = { active: false, until: 0, next: 0, bx: 0, path: [] }
    let r = { width: 0, height: 0 }

    function size() {
      const rect = cv.parentElement!.getBoundingClientRect()
      cv.width = rect.width * dpr; cv.height = rect.height * dpr
      cv.style.width = rect.width + 'px'; cv.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); r = rect; return rect
    }
    function mkDrop(init: boolean): Drop {
      const depth = Math.random(); const mul = SPEED_MUL[kind] ?? 1
      return { x: Math.random() * r.width, y: init ? Math.random() * r.height : -10 - Math.random() * 40, depth, speed: (2.5 + depth * 6) * mul, len: (6 + depth * 16) * (kind === 'storm' ? 1.3 : kind === 'light' ? 0.7 : 1), alpha: 0.08 + depth * 0.35, wob: Math.random() * Math.PI * 2 }
    }
    function seed() {
      drops = Array.from({ length: RAIN_COUNT[kind] ?? 0 }, () => mkDrop(true))
      const cloudN = kind === 'cloudy' ? 5 : (kind === 'storm' || kind === 'very-heavy') ? 4 : (kind === 'heavy' || kind === 'moderate') ? 3 : 0
      clouds = Array.from({ length: cloudN }, (_, i) => ({ x: (i / Math.max(1, cloudN - 1)) * r.width + (Math.random() * 60 - 30), y: 30 + Math.random() * (r.height * 0.4), s: 60 + Math.random() * 80, v: 0.06 + Math.random() * 0.08, a: kind === 'cloudy' ? 0.16 : kind === 'storm' ? 0.22 : 0.10 }))
      ripples = []
      lightning = { active: false, until: 0, bx: 0, path: [], next: kind === 'storm' ? Date.now() + 800 + Math.random() * 1800 : 0 }
    }
    function wa(color: string, a: number) {
      if (color.startsWith('#') && color.length === 7) { const n = parseInt(color.slice(1), 16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})` }
      return `color-mix(in oklab, ${color} ${Math.round(a*100)}%, transparent)`
    }
    function drawClouds(W: number, H: number, ink: string, strong: boolean) {
      for (const c of clouds) {
        c.x += c.v; if (c.x - c.s > W) c.x = -c.s
        const cg = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.s)
        cg.addColorStop(0, wa(ink, c.a * (strong ? 1.6 : 1))); cg.addColorStop(0.6, wa(ink, c.a * 0.5)); cg.addColorStop(1, wa(ink, 0))
        ctx.fillStyle = cg
        ctx.beginPath(); ctx.arc(c.x, c.y, c.s, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(c.x + c.s * 0.4, c.y + 6, c.s * 0.7, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(c.x - c.s * 0.4, c.y + 8, c.s * 0.65, 0, Math.PI * 2); ctx.fill()
      }
    }
    r = size(); seed()
    const ro = new ResizeObserver(() => { r = size(); seed() })
    ro.observe(cv.parentElement!)
    function tick() {
      const { width: W, height: H } = r
      ctx.clearRect(0, 0, W, H)
      const css = getComputedStyle(document.documentElement)
      const accent = css.getPropertyValue('--accent').trim() || '#2A8A99'
      const ink = css.getPropertyValue('--ink').trim() || '#0F1F18'
      const gold = '#F4B740'
      if (kind === 'sunny') {
        const cx = W * 0.78, cy = H * 0.32
        const gw = ctx.createRadialGradient(cx, cy, 4, cx, cy, Math.max(W, H) * 0.55)
        gw.addColorStop(0, wa(gold, 0.55)); gw.addColorStop(0.35, wa(gold, 0.14)); gw.addColorStop(1, wa(gold, 0))
        ctx.fillStyle = gw; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = wa(gold, 0.9); ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = wa('#FFE49A', 0.85); ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill()
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.0004); ctx.strokeStyle = wa(gold, 0.6); ctx.lineWidth = 2; ctx.lineCap = 'round'
        for (let i = 0; i < 12; i++) { const ang = (i / 12) * Math.PI * 2; const len = 10 + (i % 2 === 0 ? 8 : 4) + Math.sin(t * 0.002 + i) * 2; ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 30, Math.sin(ang) * 30); ctx.lineTo(Math.cos(ang) * (30 + len), Math.sin(ang) * (30 + len)); ctx.stroke() }
        ctx.restore()
        for (let i = 0; i < 18; i++) { const sx = (i * 73 + t * 0.04) % W; const sy = ((i * 131) % (H * 0.7)) + Math.sin(t * 0.001 + i) * 6; ctx.fillStyle = wa(gold, 0.15 + 0.25 * Math.abs(Math.sin(t * 0.002 + i))); ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill() }
      } else if (kind === 'storm') {
        const g1 = ctx.createRadialGradient(W * 0.32, H * 0.45, 20, W * 0.32, H * 0.45, Math.max(W, H) * 0.75)
        g1.addColorStop(0, wa('#2A2F55', 0.18)); g1.addColorStop(1, wa('#2A2F55', 0)); ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)
        const g2 = ctx.createRadialGradient(W * 0.78, H * 0.7, 4, W * 0.78, H * 0.7, Math.max(W, H) * 0.6)
        g2.addColorStop(0, wa('#5A6FE0', 0.12)); g2.addColorStop(1, wa('#5A6FE0', 0)); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H)
      } else {
        const grad = ctx.createRadialGradient(W * 0.32, H * 0.5, 20, W * 0.32, H * 0.5, Math.max(W, H) * 0.7)
        grad.addColorStop(0, wa(accent, kind === 'cloudy' ? 0.06 : 0.08)); grad.addColorStop(1, wa(accent, 0))
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
      }
      if (kind === 'storm') {
        const now = Date.now()
        if (!lightning.active && now > lightning.next) {
          lightning.active = true; lightning.until = now + 140 + Math.random() * 80; lightning.next = now + 2200 + Math.random() * 2800
          lightning.bx = W * (0.58 + Math.random() * 0.22); lightning.path = []
          let bx = lightning.bx, by = 0; lightning.path.push([bx, by])
          while (by < H * 0.62) { by += 8 + Math.random() * 12; bx += (Math.random() - 0.5) * 14; lightning.path.push([bx, by]) }
        }
        if (lightning.active) {
          if (Date.now() > lightning.until) lightning.active = false
          else {
            const ka = Math.max(0, 1 - (Date.now() - (lightning.until - 140)) / 140)
            const fg = ctx.createRadialGradient(lightning.bx, H * 0.35, 10, lightning.bx, H * 0.35, H * 0.7)
            fg.addColorStop(0, wa('#B7C6FF', 0.30 * ka)); fg.addColorStop(0.4, wa('#7A8FE6', 0.10 * ka)); fg.addColorStop(1, wa('#7A8FE6', 0))
            ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H)
            ctx.lineJoin = 'round'; ctx.lineCap = 'round'
            ctx.strokeStyle = wa('#A8B8FF', 0.45 * ka); ctx.lineWidth = 4.5; ctx.beginPath(); lightning.path.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); ctx.stroke()
            ctx.strokeStyle = wa('#FFFFFF', 0.85 * ka); ctx.lineWidth = 1.2; ctx.stroke()
          }
        }
      }
      if (clouds.length) drawClouds(W, H, kind === 'storm' ? '#2C2F50' : ink, kind === 'storm' || kind === 'very-heavy')
      for (const d of drops) {
        d.x += Math.sin(t * 0.001 + d.wob) * 0.15 + (kind === 'storm' ? 0.4 : 0); d.y += d.speed
        if (d.y > H + 4) { if (d.depth > 0.55 && Math.random() < 0.6) ripples.push({ x: d.x, y: H - 2 + Math.random() * 4, r: 0, max: 4 + d.depth * 8, a: 0.4 + d.depth * 0.3 }); Object.assign(d, mkDrop(false)); d.x = Math.random() * W }
        ctx.strokeStyle = wa(accent, d.alpha); ctx.lineWidth = 0.6 + d.depth * 1.1; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 1.5, d.y + d.len); ctx.stroke()
      }
      for (let i = ripples.length - 1; i >= 0; i--) { const rp = ripples[i]; rp.r += 0.6; rp.a *= 0.92; if (rp.a < 0.02) { ripples.splice(i, 1); continue } ctx.strokeStyle = wa(accent, rp.a); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.35, 0, 0, Math.PI * 2); ctx.stroke() }
      if (drops.length) { ctx.globalAlpha = 0.04 + pct * 0.04; ctx.fillStyle = ink; const my = H * 0.7 + Math.sin(t * 0.0008) * 6; ctx.beginPath(); ctx.moveTo(0, my); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, my + Math.sin((x + t * 0.05) * 0.02) * 3); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1 }
      t += 16; raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [pct, kind])
  return <canvas ref={ref} className="dial-canvas" />
}

export interface HeroLiveData {
  tempC?: number
  feelsLikeC?: number
  humidity?: number
  windKph?: number
  chanceOfRain?: number
  lastUpdated?: string
}

export interface HeroSectionProps {
  mm: number
  districtName: string
  live?: HeroLiveData
}

export function HeroSection({ mm, districtName, live }: HeroSectionProps) {
  const kind = autoKind(mm)
  const cat = CAT[kind]
  const sev = SEV_COLOR[cat.sev]
  const pct = Math.min(1, mm / 30)
  const bars = useMemo(() => Array.from({ length: 7 }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin((i + 1) * 0.9 + mm * 0.1))), [mm])
  const labelWord = cat.label.split(' ')[0]
  const labelRest = cat.label.includes(' ') ? cat.label.split(' ').slice(1).join(' ') : ''
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <section className="hero" id="today">
      <div className="hero-grid">
        <div>
          <div className="hero-meta">
            <span className="pulse" />
            <span className="mono">LIVE · {dateStr} · {timeStr} IST</span>
          </div>
          <div className="place">
            <h1>{districtName},<br /><em>Kerala.</em></h1>
          </div>
          <p className="lede">
            Heavy spells through evening, easing past<span className="underline"> midnight</span>.
          </p>
        </div>

        <div className="dial-card">
          <DialCanvas pct={pct} kind={kind} />
          <div className="dial-head" style={{ position: 'relative' }}>
            <span className="chip" style={{ background: sev.soft, color: sev.color }}>
              <span className="chip-dot" />{cat.chip ?? cat.label}
            </span>
            <span className="dial-time mono">
              {live?.lastUpdated
                ? `UPDATED ${relativeUpdated(live.lastUpdated).toUpperCase()}`
                : 'UPDATED 2 MIN AGO'}
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(44px, 6vw, 72px)', lineHeight: 1 }}>
              {labelWord}
              {labelRest && (
                <span style={{ display: 'block', fontSize: '0.55em', color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 4 }}>
                  {labelRest}
                </span>
              )}
            </div>
            <div style={{ marginTop: 14, fontSize: 14, color: 'var(--ink-2)' }}>{cat.advice}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-4)', fontFamily: "'Geist Mono', monospace", letterSpacing: '.04em' }}>
              {kind === 'sunny' ? `Clear · ${mm.toFixed(1)} mm/hr` : kind === 'cloudy' ? `Overcast · ${mm.toFixed(1)} mm/hr` : `≈ ${cat.ml} per m² this hour · ${mm.toFixed(1)} mm/hr`}
            </div>
            <div className="dial-bars">
              {bars.map((b, i) => <div key={i} className="dial-bar" style={{ height: `${b * 100}%`, opacity: 0.3 + b * 0.6 }} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10.5, color: 'var(--ink-4)', fontFamily: "'Geist Mono', monospace" }}>
              <span>−6h</span><span>−4h</span><span>−2h</span><span>NOW</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-key">Humidity</div>
          <div className="stat-val">{live?.humidity ?? 92}<span className="u">%</span></div>
          <div className="stat-trend">{live ? 'current' : '↑ 4% vs yesterday'}</div>
        </div>
        <div className="stat">
          <div className="stat-key">Temperature</div>
          <div className="stat-val">{live?.tempC !== undefined ? Math.round(live.tempC) : '—'}<span className="u">°C</span></div>
          <div className="stat-trend">{live?.feelsLikeC !== undefined ? `feels ${Math.round(live.feelsLikeC)}°` : 'feels like —'}</div>
        </div>
        <div className="stat">
          <div className="stat-key">Wind</div>
          <div className="stat-val">{live?.windKph !== undefined ? Math.round(live.windKph) : 22}<span className="u">km/h</span></div>
          <div className="stat-trend">{live ? 'current speed' : 'WSW · gusts 38'}</div>
        </div>
        <div className="stat">
          <div className="stat-key">Rain chance</div>
          <div className="stat-val">{live?.chanceOfRain ?? 86}<span className="u">%</span></div>
          <div className="stat-trend">next hour</div>
        </div>
      </div>
    </section>
  )
}
