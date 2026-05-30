"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Ticker } from "@/components/ticker"
import { LocationSelector } from "@/components/location-selector"
import { HeroSection } from "@/components/hero-section"
import { HourlyForecast } from "@/components/hourly-forecast"
import { DailyForecast } from "@/components/daily-forecast"
import { DistrictMap, type DistrictData } from "@/components/district-map"
import { WeatherAlerts, type AlertItem } from "@/components/weather-alerts"
import { RainStatsSection, type StatsData } from "@/components/rain-stats"
import { Footer } from "@/components/footer"
import { RainBackground } from "@/components/rain-background"
import { WeatherSkeleton } from "@/components/weather-skeleton"
import { WeatherError } from "@/components/weather-error"
import { useDistrictCtx } from "@/context/DistrictProvider"
import { useWeather } from "@/hooks/useWeather"
import { toHourlyItems, toDailyItems, toDistrictData } from "@/lib/weather-transforms"

// ─── Static base data ─────────────────────────────────────────────────────────
// Map uses these as placeholders; values are overridden with live data as districts are fetched.

const DISTRICT_BASE: DistrictData[] = [
  { id: 'ksg', name: 'Kasaragod',          region: 'North Malabar',  mm: 18.4, pop: 78,  trend: +12 },
  { id: 'knr', name: 'Kannur',             region: 'North Malabar',  mm: 22.1, pop: 84,  trend: +18 },
  { id: 'wyd', name: 'Wayanad',            region: 'Western Ghats',  mm: 41.6, pop: 95,  trend: +28, alert: 'orange' },
  { id: 'koz', name: 'Kozhikode',          region: 'Malabar',        mm: 26.3, pop: 88,  trend:  +9 },
  { id: 'mlp', name: 'Malappuram',         region: 'Malabar',        mm: 19.7, pop: 80,  trend:  +4 },
  { id: 'pkd', name: 'Palakkad',           region: 'Central',        mm:  8.2, pop: 52,  trend:  -6 },
  { id: 'tsr', name: 'Thrissur',           region: 'Central',        mm: 14.6, pop: 70,  trend:  +2 },
  { id: 'ekm', name: 'Ernakulam',          region: 'Central Coast',  mm: 16.9, pop: 76,  trend:  +5 },
  { id: 'idk', name: 'Idukki',             region: 'Western Ghats',  mm: 38.2, pop: 92,  trend: +22, alert: 'orange' },
  { id: 'ktm', name: 'Kottayam',           region: 'Backwaters',     mm: 21.8, pop: 82,  trend: +11 },
  { id: 'alp', name: 'Alappuzha',          region: 'Backwaters',     mm: 15.3, pop: 72,  trend:  +3 },
  { id: 'ptm', name: 'Pathanamthitta',     region: 'Central Hills',  mm: 28.5, pop: 86,  trend: +14 },
  { id: 'kln', name: 'Kollam',             region: 'South Coast',    mm: 11.7, pop: 64,  trend:  -2 },
  { id: 'tvm', name: 'Thiruvananthapuram', region: 'South Coast',    mm:  9.4, pop: 58,  trend:  -4 },
]

// ─── Static alerts (IMD alerts — replace with live feed when available) ───────

const ALERTS: AlertItem[] = [
  {
    id: 'a1', level: 'warn',
    title: 'Orange alert · Wayanad & Idukki',
    district: 'Wayanad / Idukki',
    body: 'IMD forecasts isolated heavy to very heavy rainfall (115.6–204.4 mm) over hill districts. Landslide risk elevated. Avoid travel to high-range areas.',
    time: '2h ago',
  },
  {
    id: 'a2', level: 'danger',
    title: 'Flood warning · Periyar basin',
    district: 'Ernakulam',
    body: 'Water levels in Periyar River rising rapidly above danger mark at Aluva. Low-lying areas may experience inundation.',
    time: '4h ago',
  },
  {
    id: 'a3', level: 'info',
    title: 'Southwest monsoon onset confirmed',
    district: 'All Kerala',
    body: 'Monsoon arrived over Kerala coast three days ahead of normal onset date. Active phase expected through mid-June. Statewide rainfall above normal.',
    time: '6h ago',
  },
]

// ─── Static cumulative stats (replace with IMD rainfall API when available) ───

const STATS: StatsData = {
  todayTotal: 86.2,
  weekTotal: 312.4,
  monthTotal: 428.8,
  yearTotal: 1847.2,
  averageMonthly: 380,
  rainyDays: 22,
  maxRainDay: { date: 'May 27, 2026', amount: 118.4 },
  monsoonProgress: 72,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KeralaRainPage() {
  const { districtId, districtName, setDistrict, status } = useDistrictCtx()

  // Only start fetching after geo detection is resolved — avoids a wasted API call
  // while the user's district is still being identified.
  const fetchId = status === 'detecting' ? null : districtId

  const { data, loading, error, retry } = useWeather(fetchId)

  // Update document title dynamically (home page is a client component)
  useEffect(() => {
    const name = data?.districtName ?? districtName
    document.title = `Live Rain & Weather in ${name} | KeralaRain`
  }, [data?.districtName, districtName])

  // Maintain a local map of fetched district summaries for the DistrictMap overlay
  const [liveMap, setLiveMap] = useState<Map<string, DistrictData>>(new Map())
  useEffect(() => {
    if (!data) return
    setLiveMap(prev => new Map(prev).set(data.districtId, toDistrictData(data)))
  }, [data])

  const mapDistricts = DISTRICT_BASE.map(d => liveMap.get(d.id) ?? d)

  function handleDistrictChange(id: string) {
    setDistrict(id, 'changed')
  }

  const cur  = DISTRICT_BASE.find(d => d.id === districtId) ?? DISTRICT_BASE[7]
  const mm   = data?.current.precipMm ?? cur.mm
  const name = data?.districtName ?? cur.name

  const hasData    = Boolean(data)
  const showSkeleton = loading && !hasData
  const showError    = !loading && !!error && !hasData

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {status === 'detecting' && <div className="detect-bar" aria-hidden="true" />}

      <RainBackground intensity={Math.min(1, mm / 40)} />
      <Header />
      <Ticker />

      <main className={`wrap${status === 'detecting' ? ' is-detecting' : ''}`}>
        <LocationSelector
          districts={DISTRICT_BASE}
          selected={districtId}
          onSelect={handleDistrictChange}
        />

        {showSkeleton ? (
          <WeatherSkeleton />
        ) : showError ? (
          <WeatherError error={error!} onRetry={retry} />
        ) : (
          <>
            <HeroSection
              mm={mm}
              districtName={name}
              live={data ? {
                tempC:        data.current.tempC,
                feelsLikeC:   data.current.feelsLikeC,
                humidity:     data.current.humidity,
                windKph:      data.current.windKph,
                chanceOfRain: data.current.chanceOfRain,
                lastUpdated:  data.current.lastUpdated,
              } : undefined}
            />
            <HourlyForecast data={data ? toHourlyItems(data) : []} />
            <DailyForecast  data={data ? toDailyItems(data)  : []} />
          </>
        )}

        <DistrictMap
          districts={mapDistricts}
          selected={districtId}
          onSelect={handleDistrictChange}
        />
        <WeatherAlerts alerts={ALERTS} />
        <RainStatsSection stats={STATS} />
      </main>

      <Footer />
    </div>
  )
}
