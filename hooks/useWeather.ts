'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { WeatherData } from '@/lib/weather-service'

const LS_PREFIX = 'kr_wx_'
const LS_TTL    = 10 * 60 * 1_000   // 10 min client-side cache
const REFRESH   = 10 * 60 * 1_000   // auto-refresh interval

// Module-level in-flight deduplication — shared across all hook instances on the page
const _inflight = new Map<string, Promise<WeatherData>>()

// ─── localStorage helpers ─────────────────────────────────────────────────────

function lsRead(id: string): WeatherData | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + id)
    if (!raw) return null
    const { data, exp } = JSON.parse(raw) as { data: WeatherData; exp: number }
    return Date.now() < exp ? data : null
  } catch { return null }
}

function lsWrite(id: string, data: WeatherData) {
  try {
    localStorage.setItem(LS_PREFIX + id, JSON.stringify({ data, exp: Date.now() + LS_TTL }))
  } catch {}
}

function lsEvict(id: string) {
  try { localStorage.removeItem(LS_PREFIX + id) } catch {}
}

// ─── Fetch with deduplication ─────────────────────────────────────────────────

async function fetchDistrict(id: string): Promise<WeatherData> {
  const cached = lsRead(id)
  if (cached) return cached

  const existing = _inflight.get(id)
  if (existing) return existing

  const p = fetch(`/api/weather/${id}`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json() as Promise<WeatherData>
    })
    .then(d => { lsWrite(id, d); return d })
    .finally(() => _inflight.delete(id))

  _inflight.set(id, p)
  return p
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseWeatherResult {
  data: WeatherData | null
  loading: boolean
  error: string | null
  retry: () => void
}

export function useWeather(districtId: string | null): UseWeatherResult {
  const [data, setData]       = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Prevents stale responses from overwriting state after the district has changed
  const activeRef = useRef<string | null>(null)

  const load = useCallback(async (id: string, silent: boolean) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const result = await fetchDistrict(id)
      if (activeRef.current === id) setData(result)
    } catch (e) {
      if (activeRef.current === id)
        setError(e instanceof Error ? e.message : 'Failed to load weather data')
    } finally {
      if (activeRef.current === id && !silent) setLoading(false)
    }
  }, [])

  const retry = useCallback(() => {
    if (!districtId) return
    lsEvict(districtId)
    load(districtId, false)
  }, [districtId, load])

  useEffect(() => {
    if (!districtId) {
      activeRef.current = null
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    activeRef.current = districtId

    const cached = lsRead(districtId)
    if (cached) {
      setData(cached)
      setError(null)
      load(districtId, true)   // background refresh; no spinner
    } else {
      setData(null)
      load(districtId, false)
    }

    const timer = setInterval(() => load(districtId, true), REFRESH)
    return () => clearInterval(timer)
  }, [districtId, load])

  return { data, loading, error, retry }
}
