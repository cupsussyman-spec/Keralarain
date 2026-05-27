"use client"

import { Header } from "@/components/header"
import { Ticker } from "@/components/ticker"
import { LocationSelector } from "@/components/location-selector"
import { HeroSection } from "@/components/hero-section"
import { HourlyForecast, type HourlyItem } from "@/components/hourly-forecast"
import { DailyForecast, type DailyItem } from "@/components/daily-forecast"
import { DistrictMap, type DistrictData } from "@/components/district-map"
import { WeatherAlerts, type AlertItem } from "@/components/weather-alerts"
import { RainStatsSection, type StatsData } from "@/components/rain-stats"
import { Footer } from "@/components/footer"
import { RainBackground } from "@/components/rain-background"
import { useDistrictCtx } from "@/context/DistrictProvider"

// ─── Static data (replace with live API calls in production) ─────────────────

const KERALA_DISTRICTS: DistrictData[] = [
  { id: 'ksg', name: 'Kasaragod',          region: 'North Malabar',  mm: 18.4, pop: 78,  trend: +12 },
  { id: 'knr', name: 'Kannur',             region: 'North Malabar',  mm: 22.1, pop: 84,  trend: +18 },
  { id: 'wyd', name: 'Wayanad',            region: 'Western Ghats',  mm: 41.6, pop: 95,  trend: +28, alert: 'orange' },
  { id: 'koz', name: 'Kozhikode',          region: 'Malabar',        mm: 26.3, pop: 88,  trend: +9 },
  { id: 'mlp', name: 'Malappuram',         region: 'Malabar',        mm: 19.7, pop: 80,  trend: +4 },
  { id: 'pkd', name: 'Palakkad',           region: 'Central',        mm: 8.2,  pop: 52,  trend: -6 },
  { id: 'tsr', name: 'Thrissur',           region: 'Central',        mm: 14.6, pop: 70,  trend: +2 },
  { id: 'ekm', name: 'Ernakulam',          region: 'Central Coast',  mm: 16.9, pop: 76,  trend: +5 },
  { id: 'idk', name: 'Idukki',             region: 'Western Ghats',  mm: 38.2, pop: 92,  trend: +22, alert: 'orange' },
  { id: 'ktm', name: 'Kottayam',           region: 'Backwaters',     mm: 21.8, pop: 82,  trend: +11 },
  { id: 'alp', name: 'Alappuzha',          region: 'Backwaters',     mm: 15.3, pop: 72,  trend: +3 },
  { id: 'ptm', name: 'Pathanamthitta',     region: 'Central Hills',  mm: 28.5, pop: 86,  trend: +14 },
  { id: 'kln', name: 'Kollam',             region: 'South Coast',    mm: 11.7, pop: 64,  trend: -2 },
  { id: 'tvm', name: 'Thiruvananthapuram', region: 'South Coast',    mm: 9.4,  pop: 58,  trend: -4 },
]

const HOURLY: HourlyItem[] = [
  { t: '14:00', mm: 6.2,  pop: 92, now: true, band: 'medium', temp: 26, wind: 18, humidity: 91 },
  { t: '15:00', mm: 8.1,  pop: 95,            band: 'medium', temp: 26, wind: 20, humidity: 92 },
  { t: '16:00', mm: 11.4, pop: 98,            band: 'light',  temp: 25, wind: 22, humidity: 94 },
  { t: '17:00', mm: 9.6,  pop: 96,            band: 'medium', temp: 25, wind: 24, humidity: 93 },
  { t: '18:00', mm: 5.3,  pop: 88,            band: 'medium', temp: 25, wind: 21, humidity: 91 },
  { t: '19:00', mm: 3.1,  pop: 74,            band: 'light',  temp: 24, wind: 16, humidity: 88 },
  { t: '20:00', mm: 4.8,  pop: 80,            band: 'light',  temp: 24, wind: 14, humidity: 89 },
  { t: '21:00', mm: 7.2,  pop: 90,            band: 'medium', temp: 24, wind: 16, humidity: 91 },
  { t: '22:00', mm: 5.9,  pop: 86,            band: 'medium', temp: 23, wind: 13, humidity: 90 },
  { t: '23:00', mm: 2.4,  pop: 62,            band: 'light',  temp: 23, wind: 11, humidity: 87 },
  { t: '00:00', mm: 1.2,  pop: 48,            band: 'light',  temp: 23, wind: 10, humidity: 85 },
  { t: '01:00', mm: 0.8,  pop: 38,            band: 'none',   temp: 23, wind: 9,  humidity: 83 },
  { t: '02:00', mm: 1.6,  pop: 52,            band: 'light',  temp: 22, wind: 9,  humidity: 84 },
  { t: '03:00', mm: 3.4,  pop: 68,            band: 'light',  temp: 22, wind: 10, humidity: 86 },
  { t: '04:00', mm: 4.1,  pop: 78,            band: 'light',  temp: 22, wind: 12, humidity: 87 },
  { t: '05:00', mm: 5.8,  pop: 84,            band: 'medium', temp: 23, wind: 14, humidity: 89 },
]

const DAYS: DailyItem[] = [
  { name: 'Today',     date: 'May 27', mm: 86,  cond: 'Heavy rain',    icon: 'heavy',  hi: 28, lo: 23, band: 'heavy',  chance: 92 },
  { name: 'Sunday',    date: 'May 28', mm: 64,  cond: 'Showers',       icon: 'shower', hi: 29, lo: 24, band: 'heavy',  chance: 85 },
  { name: 'Monday',    date: 'May 29', mm: 92,  cond: 'Heavy rain',    icon: 'heavy',  hi: 27, lo: 23, band: 'heavy',  chance: 94 },
  { name: 'Tuesday',   date: 'May 30', mm: 118, cond: 'Thunderstorms', icon: 'storm',  hi: 26, lo: 23, band: 'heavy',  chance: 97 },
  { name: 'Wednesday', date: 'May 31', mm: 74,  cond: 'Showers',       icon: 'shower', hi: 28, lo: 24, band: 'heavy',  chance: 88 },
  { name: 'Thursday',  date: 'Jun 1',  mm: 42,  cond: 'Light rain',    icon: 'light',  hi: 30, lo: 25, band: 'heavy',  chance: 72 },
  { name: 'Friday',    date: 'Jun 2',  mm: 14,  cond: 'Cloudy',        icon: 'cloud',  hi: 31, lo: 25, band: 'medium', chance: 48 },
]

const ALERTS: AlertItem[] = [
  {
    id: 'a1', level: 'warn',
    title: 'Orange alert · Wayanad & Idukki',
    district: 'Wayanad / Idukki',
    body: 'IMD forecasts isolated heavy to very heavy rainfall (115.6–204.4 mm) over hill districts through Mon 29 May. Landslide risk elevated. Avoid travel to high-range areas.',
    time: '2h ago',
  },
  {
    id: 'a2', level: 'danger',
    title: 'Flood warning · Periyar basin',
    district: 'Ernakulam',
    body: 'Water levels in Periyar River rising rapidly above danger mark at Aluva. Low-lying areas may experience inundation. Emergency services on standby.',
    time: '4h ago',
  },
  {
    id: 'a3', level: 'info',
    title: 'Southwest monsoon onset confirmed',
    district: 'All Kerala',
    body: 'Monsoon arrived over Kerala coast on May 27, three days ahead of normal onset date (June 1). Active phase expected through mid-June. Statewide rainfall above normal.',
    time: '6h ago',
  },
  {
    id: 'a4', level: 'info',
    title: 'Coastal swell · Alappuzha to Kollam',
    district: 'South Coast',
    body: 'Swell waves of 2.4–3.0 m likely along the south Kerala coast. Fishermen advised against venturing into the sea until further notice.',
    time: '11h ago',
  },
]

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
  const { districtId, setDistrict, status } = useDistrictCtx()

  const cur = KERALA_DISTRICTS.find(d => d.id === districtId) ?? KERALA_DISTRICTS[7]

  function handleDistrictChange(id: string) {
    setDistrict(id, 'changed')
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Location-detection progress bar */}
      {status === 'detecting' && <div className="detect-bar" aria-hidden="true" />}

      <RainBackground intensity={Math.min(1, cur.mm / 40)} />
      <Header />
      <Ticker />

      <main className={`wrap${status === 'detecting' ? ' is-detecting' : ''}`}>
        <LocationSelector
          districts={KERALA_DISTRICTS}
          selected={districtId}
          onSelect={handleDistrictChange}
        />
        <HeroSection mm={cur.mm} districtName={cur.name} />
        <HourlyForecast data={HOURLY} />
        <DailyForecast data={DAYS} />
        <DistrictMap
          districts={KERALA_DISTRICTS}
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
