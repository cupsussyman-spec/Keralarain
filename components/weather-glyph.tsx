export type GlyphKind = 'sun' | 'partly' | 'cloud' | 'light' | 'shower' | 'heavy' | 'storm'

interface WeatherGlyphProps {
  kind?: GlyphKind
  size?: number
}

export function WeatherGlyph({ kind = 'cloud', size = 40 }: WeatherGlyphProps) {
  const W = size
  const sunCore    = '#FFD24A'
  const sunGlow    = '#FFB02E'
  const cloudLight = '#F4F0E6'
  const cloudMid   = '#D9D3C3'
  const cloudDark  = '#7E8A93'
  const cloudHvy   = '#4D5963'
  const drop       = '#3FA9D6'
  const dropDeep   = '#2A7FB0'
  const bolt       = '#F6C84C'
  const stroke     = 'rgba(0,0,0,.10)'

  const Cloud = ({ fill, sh, dx = 0, dy = 0, sc = 1, opacity = 1 }: {
    fill: string; sh: string; dx?: number; dy?: number; sc?: number; opacity?: number
  }) => (
    <g transform={`translate(${dx},${dy}) scale(${sc})`} opacity={opacity}>
      <path d="M18 36 C 8 36, 6 22, 16 21 C 17 13, 30 11, 33 19 C 42 16, 50 24, 44 32 C 46 38, 38 40, 34 38 Z" fill={fill} stroke={sh} strokeWidth="0.6" />
      <path d="M16 27 C 18 24, 23 23, 26 25" stroke="rgba(255,255,255,.6)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  )

  const Drop = ({ x, y, r = 1.6, color = drop }: { x: number; y: number; r?: number; color?: string }) => (
    <path d={`M ${x} ${y} c -${r} ${r*1.6}, -${r} ${r*2.4}, 0 ${r*2.8} c ${r} -${r*0.4}, ${r} -${r*1.2}, 0 -${r*2.8} Z`} fill={color} />
  )

  const Sun = ({ cx = 32, cy = 24, r = 8 }: { cx?: number; cy?: number; r?: number }) => (
    <g>
      <circle cx={cx} cy={cy} r={r + 5} fill={sunGlow} opacity="0.25" />
      <circle cx={cx} cy={cy} r={r} fill={sunCore} />
      {[0,1,2,3,4,5,6,7].map(i => {
        const a = (i / 8) * Math.PI * 2
        const x1 = cx + Math.cos(a) * (r + 2.5)
        const y1 = cy + Math.sin(a) * (r + 2.5)
        const x2 = cx + Math.cos(a) * (r + 6.5)
        const y2 = cy + Math.sin(a) * (r + 6.5)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={sunGlow} strokeWidth="2" strokeLinecap="round" />
      })}
    </g>
  )

  let body: React.ReactNode
  switch (kind) {
    case 'sun':
      body = <Sun cx={32} cy={32} r={11} />
      break
    case 'partly':
      body = <g><Sun cx={24} cy={22} r={9} /><Cloud fill={cloudLight} sh={stroke} dx={20} dy={22} sc={0.85} /></g>
      break
    case 'cloud':
      body = (
        <g>
          <Cloud fill={cloudMid}   sh={stroke} dx={6} dy={20} sc={0.7} opacity={0.6} />
          <Cloud fill={cloudLight} sh={stroke} dx={8} dy={16} sc={1.0} />
        </g>
      )
      break
    case 'light':
      body = (
        <g>
          <Cloud fill={cloudLight} sh={stroke} dx={6} dy={10} sc={1.0} />
          <Drop x={22} y={50} r={1.6} />
          <Drop x={36} y={52} r={1.6} />
        </g>
      )
      break
    case 'shower':
      body = (
        <g>
          <Cloud fill={cloudMid} sh={stroke} dx={6} dy={8} sc={1.0} />
          <Drop x={18} y={48} r={1.8} />
          <Drop x={28} y={52} r={1.8} />
          <Drop x={38} y={48} r={1.8} />
          <Drop x={46} y={52} r={1.8} />
        </g>
      )
      break
    case 'heavy':
      body = (
        <g>
          <Cloud fill={cloudHvy} sh={stroke} dx={6} dy={6} sc={1.0} />
          <Drop x={16} y={48} r={2.2} color={dropDeep} />
          <Drop x={24} y={52} r={2.2} color={dropDeep} />
          <Drop x={32} y={48} r={2.2} color={dropDeep} />
          <Drop x={40} y={52} r={2.2} color={dropDeep} />
          <Drop x={48} y={48} r={2.2} color={dropDeep} />
        </g>
      )
      break
    case 'storm':
      body = (
        <g>
          <Cloud fill={cloudDark} sh={stroke} dx={6} dy={6} sc={1.0} />
          <path d="M 30 44 L 26 54 L 32 54 L 28 62" fill="none" stroke={bolt} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
          <Drop x={18} y={50} r={1.8} color={dropDeep} />
          <Drop x={44} y={52} r={1.8} color={dropDeep} />
        </g>
      )
      break
    default:
      body = <Sun cx={32} cy={32} r={10} />
  }

  return (
    <svg viewBox="0 0 64 64" width={W} height={W} aria-hidden="true">
      {body}
    </svg>
  )
}
