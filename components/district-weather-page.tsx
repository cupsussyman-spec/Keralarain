'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Ticker } from '@/components/ticker'
import { HeroSection } from '@/components/hero-section'
import { HourlyForecast } from '@/components/hourly-forecast'
import { DailyForecast } from '@/components/daily-forecast'
import { Footer } from '@/components/footer'
import { RainBackground } from '@/components/rain-background'
import { WeatherSkeleton } from '@/components/weather-skeleton'
import { WeatherError } from '@/components/weather-error'
import { useWeather } from '@/hooks/useWeather'
import { toHourlyItems, toDailyItems } from '@/lib/weather-transforms'
import type { WeatherData } from '@/lib/weather-service'

interface Props {
  districtId: string
  districtName: string
  initialWeather: WeatherData | null
}

export function DistrictWeatherPage({ districtId, districtName, initialWeather }: Props) {
  const { data: liveData, loading, error, retry } = useWeather(districtId)

  // Use live data if available, fall back to SSR-fetched initial data
  const data = liveData ?? initialWeather

  const mm   = data?.current.precipMm ?? 0
  const name = data?.districtName ?? districtName

  const showSkeleton = loading && !data
  const showError    = !loading && !!error && !data

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <RainBackground intensity={Math.min(1, mm / 40)} />
      <Header />
      <Ticker />

      <main className="wrap">
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
      </main>

      <Footer />
    </div>
  )
}
