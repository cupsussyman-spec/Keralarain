/* Server-only — import only from API routes or Server Components */

import type { DistrictId } from './geo'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CurrentWeather {
  tempC: number
  feelsLikeC: number
  humidity: number
  windKph: number
  precipMm: number
  chanceOfRain: number
  condition: string
  lastUpdated: string
  isDay: boolean
}

export interface HourlyWeather {
  time: string        // "HH:MM"
  tempC: number
  precipMm: number
  chanceOfRain: number
  windKph: number
  humidity: number
  condition: string
}

export interface DailyWeather {
  date: string        // "YYYY-MM-DD"
  maxTempC: number
  minTempC: number
  totalPrecipMm: number
  chanceOfRain: number
  condition: string
}

export interface WeatherData {
  districtId: string
  districtName: string
  current: CurrentWeather
  hourly: HourlyWeather[]
  daily: DailyWeather[]
  source: 'weatherapi' | 'openweathermap'
  fetchedAt: number
}

// ─── District → API query string ──────────────────────────────────────────────

export const DISTRICT_QUERY: Record<DistrictId, string> = {
  tvm: 'Thiruvananthapuram,IN',
  kln: 'Kollam,IN',
  ptm: 'Pathanamthitta,IN',
  alp: 'Alappuzha,IN',
  ktm: 'Kottayam,IN',
  idk: 'Thodupuzha,IN',
  ekm: 'Ernakulam,IN',
  tsr: 'Thrissur,IN',
  pkd: 'Palakkad,IN',
  mlp: 'Malappuram,IN',
  koz: 'Kozhikode,IN',
  wyd: 'Kalpetta,IN',
  knr: 'Kannur,IN',
  ksg: 'Kasaragod,IN',
}

// ─── Server-side cache (10 min TTL, per warm instance) ───────────────────────

const CACHE_TTL = 10 * 60 * 1_000
const _cache    = new Map<string, { data: WeatherData; expiresAt: number }>()
const _inflight = new Map<string, Promise<WeatherData>>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estimateChance(condition: string, precipMm: number): number {
  if (precipMm > 10) return 95
  if (precipMm > 5)  return 85
  if (precipMm > 2)  return 70
  const c = condition.toLowerCase()
  if (c.includes('thunder'))         return 90
  if (c.includes('heavy rain'))      return 85
  if (c.includes('moderate rain'))   return 70
  if (c.includes('shower') || c.includes('light rain') || c.includes('drizzle')) return 55
  if (c.includes('rain'))            return 60
  if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog')) return 30
  return 5
}

// ─── WeatherAPI.com ───────────────────────────────────────────────────────────

async function fromWeatherAPI(districtId: DistrictId): Promise<WeatherData> {
  const key = process.env.WEATHERAPI_KEY
  if (!key) throw new Error('WEATHERAPI_KEY not configured')

  const q   = DISTRICT_QUERY[districtId]
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(q)}&days=3&aqi=no&alerts=no`

  const res = await fetch(url, { signal: AbortSignal.timeout(8_000) })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`WeatherAPI HTTP ${res.status}: ${body.slice(0, 200)}`)
  }

  const r        = await res.json()
  const nowEpoch = Math.floor(Date.now() / 1_000)

  const current: CurrentWeather = {
    tempC:        r.current.temp_c,
    feelsLikeC:   r.current.feelslike_c,
    humidity:     r.current.humidity,
    windKph:      r.current.wind_kph,
    precipMm:     r.current.precip_mm,
    chanceOfRain: estimateChance(r.current.condition.text, r.current.precip_mm),
    condition:    r.current.condition.text,
    lastUpdated:  r.current.last_updated,
    isDay:        r.current.is_day === 1,
  }

  // Collect next 24 hours; skip more than 30 min in the past
  const hourly: HourlyWeather[] = []
  outer: for (const day of r.forecast.forecastday) {
    for (const h of day.hour) {
      if ((h.time_epoch as number) < nowEpoch - 1_800) continue
      hourly.push({
        time:         (h.time as string).slice(11, 16),
        tempC:        h.temp_c,
        precipMm:     h.precip_mm,
        chanceOfRain: h.chance_of_rain,
        windKph:      h.wind_kph,
        humidity:     h.humidity,
        condition:    h.condition.text,
      })
      if (hourly.length >= 24) break outer
    }
  }

  const daily: DailyWeather[] = r.forecast.forecastday.map((d: any) => ({
    date:           d.date,
    maxTempC:       d.day.maxtemp_c,
    minTempC:       d.day.mintemp_c,
    totalPrecipMm:  d.day.totalprecip_mm,
    chanceOfRain:   d.day.daily_chance_of_rain,
    condition:      d.day.condition.text,
  }))

  return {
    districtId,
    districtName: r.location.name,
    current,
    hourly,
    daily,
    source:    'weatherapi',
    fetchedAt: Date.now(),
  }
}

// ─── OpenWeatherMap fallback ──────────────────────────────────────────────────

async function fromOpenWeatherMap(districtId: DistrictId): Promise<WeatherData> {
  const key = process.env.OPENWEATHERMAP_KEY
  if (!key) throw new Error('OPENWEATHERMAP_KEY not configured')

  const q    = DISTRICT_QUERY[districtId]
  const base = 'https://api.openweathermap.org/data/2.5'

  const [curRes, fctRes] = await Promise.all([
    fetch(`${base}/weather?q=${encodeURIComponent(q)}&appid=${key}&units=metric`,
      { signal: AbortSignal.timeout(8_000) }),
    fetch(`${base}/forecast?q=${encodeURIComponent(q)}&appid=${key}&units=metric&cnt=40`,
      { signal: AbortSignal.timeout(8_000) }),
  ])

  if (!curRes.ok) throw new Error(`OWM current HTTP ${curRes.status}`)
  if (!fctRes.ok) throw new Error(`OWM forecast HTTP ${fctRes.status}`)

  const cur = await curRes.json()
  const fct = await fctRes.json()

  const precipMm = cur.rain?.['1h'] ?? cur.rain?.['3h'] ?? 0
  const windKph  = Math.round((cur.wind?.speed ?? 0) * 3.6)

  const current: CurrentWeather = {
    tempC:        cur.main.temp,
    feelsLikeC:   cur.main.feels_like,
    humidity:     cur.main.humidity,
    windKph,
    precipMm,
    chanceOfRain: estimateChance(cur.weather[0]?.description ?? '', precipMm),
    condition:    cur.weather[0]?.description ?? 'Unknown',
    lastUpdated:  new Date(cur.dt * 1_000).toISOString().replace('T', ' ').slice(0, 16),
    isDay:        cur.sys.sunrise < cur.dt && cur.dt < cur.sys.sunset,
  }

  const nowEpoch = Math.floor(Date.now() / 1_000)
  const hourly: HourlyWeather[] = fct.list
    .filter((item: any) => item.dt > nowEpoch)
    .slice(0, 8)
    .map((item: any) => ({
      time:         new Date(item.dt * 1_000).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
      }),
      tempC:        item.main.temp,
      precipMm:     item.rain?.['3h'] ?? 0,
      chanceOfRain: Math.round((item.pop ?? 0) * 100),
      windKph:      Math.round((item.wind?.speed ?? 0) * 3.6),
      humidity:     item.main.humidity,
      condition:    item.weather[0]?.description ?? 'Unknown',
    }))

  // Group by local date for daily summary
  const dayMap = new Map<string, any[]>()
  for (const item of fct.list) {
    const date = new Date(item.dt * 1_000)
      .toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    if (!dayMap.has(date)) dayMap.set(date, [])
    dayMap.get(date)!.push(item)
  }

  const daily: DailyWeather[] = Array.from(dayMap.entries())
    .slice(0, 3)
    .map(([date, items]) => {
      const temps = items.map((i: any) => i.main.temp)
      const rains = items.map((i: any) => i.rain?.['3h'] ?? 0)
      const pops  = items.map((i: any) => Math.round((i.pop ?? 0) * 100))
      const mid   = items[Math.floor(items.length / 2)]
      return {
        date,
        maxTempC:      Math.max(...temps),
        minTempC:      Math.min(...temps),
        totalPrecipMm: rains.reduce((a: number, b: number) => a + b, 0),
        chanceOfRain:  Math.max(...pops),
        condition:     mid.weather[0]?.description ?? 'Unknown',
      }
    })

  const districtName = DISTRICT_QUERY[districtId].replace(',IN', '')
  return {
    districtId,
    districtName,
    current,
    hourly,
    daily,
    source:    'openweathermap',
    fetchedAt: Date.now(),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getWeather(districtId: DistrictId): Promise<WeatherData> {
  const cached = _cache.get(districtId)
  if (cached && Date.now() < cached.expiresAt) return cached.data

  const existing = _inflight.get(districtId)
  if (existing) return existing

  const promise = (async () => {
    try {
      let data: WeatherData
      try {
        data = await fromWeatherAPI(districtId)
      } catch (primaryErr) {
        console.warn(`[weather] WeatherAPI failed for ${districtId}:`, primaryErr)
        data = await fromOpenWeatherMap(districtId)
      }
      _cache.set(districtId, { data, expiresAt: Date.now() + CACHE_TTL })
      return data
    } finally {
      _inflight.delete(districtId)
    }
  })()

  _inflight.set(districtId, promise)
  return promise
}
