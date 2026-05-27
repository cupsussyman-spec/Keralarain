'use client'

import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { detectDistrictFromCity, getDistrictById, type DistrictId } from '@/lib/geo'
import { analytics } from '@/lib/analytics'

export type DetectionStatus = 'idle' | 'detecting' | 'found' | 'outside' | 'error'

interface DistrictCtxValue {
  districtId: string
  districtName: string
  status: DetectionStatus
  isReady: boolean
  showModal: boolean
  setDistrict: (id: string, method?: 'manual' | 'changed') => void
  openModal: () => void
  closeModal: () => void
}

const DistrictCtx = createContext<DistrictCtxValue | null>(null)

const LS_KEY   = 'keralarain_district'
const HINT_KEY = 'krh' // middleware cookie name
const DEFAULT  = 'ekm'

export function DistrictProvider({ children }: { children: ReactNode }) {
  const [districtId, setDistrictId] = useState<string>(DEFAULT)
  const [status, setStatus]         = useState<DetectionStatus>('idle')
  const [showModal, setShowModal]   = useState(false)
  const [isReady, setIsReady]       = useState(false)

  const districtName = getDistrictById(districtId)?.name ?? 'Ernakulam'

  const setDistrict = useCallback((id: string, method: 'manual' | 'changed' = 'changed') => {
    const info = getDistrictById(id)
    if (!info) return
    setDistrictId(id)
    setShowModal(false)
    setStatus('found')
    try { localStorage.setItem(LS_KEY, id) } catch {}
    if (method === 'manual') analytics.districtManualSelected(id, info.name)
    else analytics.districtChanged(id, info.name)
  }, [])

  useEffect(() => {
    async function detect() {
      // ── 1. Respect explicit user preference saved in localStorage ─────────
      try {
        const saved = localStorage.getItem(LS_KEY)
        if (saved && getDistrictById(saved)) {
          setDistrictId(saved)
          setStatus('found')
          setIsReady(true)
          return
        }
      } catch {}

      // ── 2. Read middleware hint cookie (fastest path, no API call) ────────
      try {
        const raw = document.cookie
          .split(';')
          .map(c => c.trim())
          .find(c => c.startsWith(`${HINT_KEY}=`))
          ?.split('=')[1]

        if (raw) {
          if (raw === 'out') {
            // Middleware confirmed user is outside Kerala
            setStatus('outside')
            setShowModal(true)
            setIsReady(true)
            return
          }
          // raw = "KL:Kochi" — region:city
          const colonIdx = raw.indexOf(':')
          if (colonIdx !== -1) {
            const city = decodeURIComponent(raw.slice(colonIdx + 1))
            const found = detectDistrictFromCity(city)
            if (found) {
              const info = getDistrictById(found)!
              setDistrictId(found)
              setStatus('found')
              try { localStorage.setItem(LS_KEY, found) } catch {}
              analytics.districtAutoDetected(found, info.name)
              toast.success(`Showing weather for ${info.name}`, {
                description: 'Detected from your IP · tap to change district',
                duration: 4500,
              })
              setIsReady(true)
              return
            }
          }
        }
      } catch {}

      // ── 3. API fallback (local dev or missing cookie) ─────────────────────
      setStatus('detecting')
      try {
        const res  = await fetch('/api/locate', { cache: 'no-store' })
        const data = await res.json()

        if (data.isKerala && data.districtId) {
          const info = getDistrictById(data.districtId as DistrictId)
          setDistrictId(data.districtId)
          setStatus('found')
          try { localStorage.setItem(LS_KEY, data.districtId) } catch {}
          analytics.districtAutoDetected(data.districtId, data.districtName)
          toast.success(`Showing weather for ${data.districtName}`, {
            description: 'Detected from your IP · tap to change district',
            duration: 4500,
          })
        } else {
          setStatus('outside')
          setShowModal(true)
        }
      } catch {
        setStatus('error')
        setShowModal(true)
      } finally {
        setIsReady(true)
      }
    }

    detect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DistrictCtx.Provider value={{
      districtId,
      districtName,
      status,
      isReady,
      showModal,
      setDistrict,
      openModal:  () => setShowModal(true),
      closeModal: () => setShowModal(false),
    }}>
      {children}
    </DistrictCtx.Provider>
  )
}

export function useDistrictCtx(): DistrictCtxValue {
  const ctx = useContext(DistrictCtx)
  if (!ctx) throw new Error('useDistrictCtx must be inside <DistrictProvider>')
  return ctx
}
