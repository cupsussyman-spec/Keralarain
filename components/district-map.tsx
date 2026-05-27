"use client"

export interface DistrictData {
  id: string
  name: string
  region: string
  mm: number
  pop: number
  trend: number
  alert?: string
}

interface DistrictMapProps {
  districts: DistrictData[]
  selected: string
  onSelect: (id: string) => void
}

const KERALA_MAP_PATHS: Record<string, string> = {
  ksg: 'M48,18 L122,12 L138,46 L96,58 L52,52 Z',
  knr: 'M52,52 L96,58 L138,46 L160,82 L114,98 L60,90 Z',
  wyd: 'M138,46 L208,40 L232,82 L160,82 Z',
  koz: 'M60,90 L114,98 L160,82 L184,128 L96,140 L66,124 Z',
  mlp: 'M96,140 L184,128 L232,82 L256,134 L210,176 L120,176 Z',
  pkd: 'M210,176 L256,134 L300,162 L292,212 L228,224 Z',
  tsr: 'M120,176 L210,176 L228,224 L156,236 L96,210 Z',
  ekm: 'M96,210 L156,236 L228,224 L246,266 L172,278 L92,254 Z',
  idk: 'M228,224 L292,212 L300,272 L246,266 Z',
  ktm: 'M92,254 L172,278 L246,266 L240,316 L150,318 L82,294 Z',
  alp: 'M82,294 L150,318 L156,360 L72,340 Z',
  ptm: 'M150,318 L240,316 L260,366 L182,376 L156,360 Z',
  kln: 'M72,340 L156,360 L182,376 L168,418 L82,406 Z',
  tvm: 'M82,406 L168,418 L186,460 L142,486 L96,470 Z',
}

const MAP_LABELS: Record<string, [number, number]> = {
  ksg: [85, 38], knr: [100, 76], wyd: [186, 64],
  koz: [108, 116], mlp: [156, 158], pkd: [256, 188],
  tsr: [156, 210], ekm: [160, 254], idk: [266, 246],
  ktm: [160, 296], alp: [108, 326], ptm: [196, 350],
  kln: [114, 386], tvm: [126, 446],
}

const BAND_LABEL = { none: 'Clear', light: 'Light', medium: 'Moderate', heavy: 'Heavy' }

function bandFromMm(mm: number): 'none' | 'light' | 'medium' | 'heavy' {
  if (mm < 5) return 'none'
  if (mm < 12) return 'light'
  if (mm < 25) return 'medium'
  return 'heavy'
}

function mix(a: string, b: string, p: number) {
  return `color-mix(in oklab, ${a} ${Math.round((1 - p) * 100)}%, ${b})`
}

function fillForIntensity(t: number) {
  const c0 = '#EEF3F7', c1 = '#A8CDE8', c2 = '#3F73B0', c3 = '#1B2E55'
  if (t < 0.34) return mix(c0, c1, t / 0.34)
  if (t < 0.7)  return mix(c1, c2, (t - 0.34) / 0.36)
  return mix(c2, c3, Math.min(1, (t - 0.7) / 0.3))
}

export function DistrictMap({ districts, selected, onSelect }: DistrictMapProps) {
  const sorted = [...districts].sort((a, b) => b.mm - a.mm)
  const maxMm = Math.max(...districts.map(d => d.mm), 1)
  const bands = districts.map(d => bandFromMm(d.mm))
  const heavyN = bands.filter(b => b === 'heavy').length
  const safeN = bands.filter(b => b === 'none').length
  const avg = districts.reduce((s, d) => s + d.mm, 0) / districts.length
  const top = sorted[0]

  return (
    <section className="sec" id="districts">
      <div className="sec-head">
        <div>
          <h2 className="sec-h">All <em>14 districts</em></h2>
          <div className="sec-sub">Live 24-hour rainfall across Kerala. Tap a district on the map or in the list.</div>
        </div>
        <div className="band-legend">
          {(['none', 'light', 'medium', 'heavy'] as const).map(b => (
            <span key={b} className="band-leg-item">
              <i className={`band-dot band-${b}`} style={{ background: 'currentColor' }} />
              {BAND_LABEL[b]}
            </span>
          ))}
        </div>
      </div>

      <div className="dist-summary">
        <div>
          <span className="k">Statewide average</span>
          <span className="v">{avg.toFixed(1)}<span className="u">mm</span></span>
          <span className="sub">last 24h, 14-district mean</span>
        </div>
        <div>
          <span className="k">Heaviest now</span>
          <span className="v">{top?.name}</span>
          <span className="sub">{top?.mm.toFixed(1)} mm · {BAND_LABEL[bandFromMm(top?.mm ?? 0)]}</span>
        </div>
        <div>
          <span className="k">Red districts</span>
          <span className="v red">{heavyN}</span>
          <span className="sub">heavy rain warning</span>
        </div>
        <div>
          <span className="k">Clear districts</span>
          <span className="v green">{safeN}</span>
          <span className="sub">no significant rain</span>
        </div>
      </div>

      <div className="districts-v2">
        <div className="map-card">
          <div className="map-head">
            <h3>Rain map</h3>
            <span className="map-sub mono">LIVE · 24H</span>
          </div>
          <svg className="map-svg" viewBox="0 0 320 520" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="km-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" />
                <feOffset dx="0" dy="1" result="off" />
                <feFlood floodColor="rgba(0,0,0,.18)" />
                <feComposite in2="off" operator="in" />
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="km-danger" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feFlood floodColor="#C73A2C" floodOpacity="0.55" />
                <feComposite in2="SourceAlpha" operator="in" />
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {districts.map(d => {
              const path = KERALA_MAP_PATHS[d.id]
              if (!path) return null
              const intensity = Math.min(1, d.mm / maxMm)
              const band = bandFromMm(d.mm)
              const isHeavy = band === 'heavy'
              const fill = isHeavy
                ? mix('#F4D6D2', '#A82F22', Math.min(1, (intensity - 0.5) / 0.5))
                : fillForIntensity(intensity)
              const filter = selected === d.id ? 'url(#km-glow)' : isHeavy ? 'url(#km-danger)' : undefined
              return (
                <path key={d.id} d={path}
                  className={`dist${selected === d.id ? ' active' : ''}${isHeavy ? ' heavy' : ''}`}
                  style={{ fill, filter }}
                  onClick={() => onSelect(d.id)}>
                  <title>{d.name} · {d.mm.toFixed(1)} mm · {BAND_LABEL[band]}</title>
                </path>
              )
            })}
            {Object.entries(MAP_LABELS).map(([id, [lx, ly]]) => {
              const d = districts.find(dd => dd.id === id)
              if (!d) return null
              const intensity = Math.min(1, d.mm / maxMm)
              return (
                <text key={id} x={lx} y={ly} textAnchor="middle"
                  className={`lbl${intensity > 0.55 ? ' on-dark' : ''}`}>
                  {d.name.length > 8 ? d.name.slice(0, 3).toUpperCase() : d.name.slice(0, 4).toUpperCase()}
                </text>
              )
            })}
          </svg>
          <div className="map-legend">
            <span className="mono">0</span>
            <span className="scale" />
            <span className="mono">{maxMm.toFixed(0)} mm</span>
          </div>
        </div>

        <div className="dlist">
          {sorted.map((d, i) => {
            const band = bandFromMm(d.mm)
            const pct = (d.mm / maxMm) * 100
            return (
              <button key={d.id}
                className={`dlist-row band-${band}${selected === d.id ? ' sel' : ''}`}
                onClick={() => onSelect(d.id)}>
                <span className="rk mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="dlist-info">
                  <span className="dlist-name">{d.name}</span>
                  <span className="dlist-region">{d.region}</span>
                </span>
                <span className={`dlist-pill band-${band}`}>
                  <span className="pdot" />{BAND_LABEL[band]}
                </span>
                <span className="dlist-amt">{d.mm.toFixed(1)}<span className="u">mm</span></span>
                <span className="bar-track"><span className="bar-fill" style={{ width: `${pct}%` }} /></span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
