import type { WeatherData } from './weather-service'
import type { HourlyItem } from '@/components/hourly-forecast'
import type { DailyItem } from '@/components/daily-forecast'
import type { DistrictData } from '@/components/district-map'
import type { GlyphKind } from '@/components/weather-glyph'
import { KERALA_DISTRICT_LIST } from './geo'

// ─── Condition → band / glyph ─────────────────────────────────────────────────

function condToBand(cond: string, mmPerHr: number): HourlyItem['band'] {
  if (mmPerHr > 7.5) return 'heavy'
  if (mmPerHr > 2.5) return 'medium'
  if (mmPerHr > 0.1) return 'light'
  const c = cond.toLowerCase()
  if (c.includes('thunder') || c.includes('torrential') || c.includes('heavy rain')) return 'heavy'
  if (c.includes('moderate rain') || (c.includes('rain') && !c.includes('light') && !c.includes('slight'))) return 'medium'
  if (c.includes('light rain') || c.includes('drizzle') || c.includes('shower')) return 'light'
  return 'none'
}

function dailyBand(totalMm: number): HourlyItem['band'] {
  if (totalMm < 0.1) return 'none'
  if (totalMm < 10)  return 'light'
  if (totalMm < 35)  return 'medium'
  return 'heavy'
}

function condToGlyph(cond: string, mmPerHr: number): GlyphKind {
  const c = cond.toLowerCase()
  if (c.includes('thunder') || c.includes('storm'))            return 'storm'
  if (mmPerHr > 7.5 || c.includes('heavy rain') || c.includes('torrential')) return 'heavy'
  if (mmPerHr > 2.5 || c.includes('shower') || c.includes('moderate rain')) return 'shower'
  if (mmPerHr > 0.1 || c.includes('light rain') || c.includes('drizzle'))   return 'light'
  if (c.includes('overcast') || c.includes('cloud'))           return 'cloud'
  if (c.includes('partly') || c.includes('mist') || c.includes('fog'))      return 'partly'
  return 'sun'
}

// ─── WeatherData → component props ───────────────────────────────────────────

export function toHourlyItems(weather: WeatherData): HourlyItem[] {
  return weather.hourly.map((h, i) => ({
    t:        h.time,
    mm:       h.precipMm,
    pop:      h.chanceOfRain,
    now:      i === 0,
    band:     condToBand(h.condition, h.precipMm),
    temp:     Math.round(h.tempC),
    wind:     Math.round(h.windKph),
    humidity: h.humidity,
  }))
}

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function toDailyItems(weather: WeatherData): DailyItem[] {
  return weather.daily.map((d, i) => {
    const [y, m, day] = d.date.split('-').map(Number)
    const date        = new Date(y, m - 1, day)
    const mmHr        = d.totalPrecipMm / 24
    return {
      name:   WEEKDAYS[date.getDay()],
      date:   `${MONTHS[date.getMonth()]} ${date.getDate()}`,
      mm:     Math.round(d.totalPrecipMm),
      cond:   d.condition,
      icon:   condToGlyph(d.condition, mmHr),
      hi:     Math.round(d.maxTempC),
      lo:     Math.round(d.minTempC),
      band:   dailyBand(d.totalPrecipMm),
      chance: d.chanceOfRain,
    }
  })
}

export function toDistrictData(weather: WeatherData): DistrictData {
  const info = KERALA_DISTRICT_LIST.find(d => d.id === weather.districtId)
  return {
    id:     weather.districtId,
    name:   info?.name ?? weather.districtName,
    region: info?.region ?? '',
    mm:     weather.current.precipMm,
    pop:    weather.current.chanceOfRain,
    trend:  0,
  }
}

// ─── Human-readable "last updated" ────────────────────────────────────────────

export function relativeUpdated(lastUpdated: string): string {
  // WeatherAPI returns "YYYY-MM-DD HH:MM" in local IST
  const then    = new Date(lastUpdated.replace(' ', 'T') + '+05:30')
  const diffMin = Math.round((Date.now() - then.getTime()) / 60_000)
  if (diffMin < 1)  return 'just now'
  if (diffMin === 1) return '1 min ago'
  if (diffMin < 60) return `${diffMin} min ago`
  const hrs = Math.round(diffMin / 60)
  return `${hrs}h ago`
}
