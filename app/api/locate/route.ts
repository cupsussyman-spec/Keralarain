import { type NextRequest } from 'next/server'
import { detectDistrictFromCity, getDistrictById, type GeoResult } from '@/lib/geo'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // ── Vercel production: headers injected automatically ──────────────────────
  const country = req.headers.get('x-vercel-ip-country') ?? ''
  const region  = req.headers.get('x-vercel-ip-country-region') ?? ''
  const rawCity = req.headers.get('x-vercel-ip-city') ?? ''
  const city    = decodeURIComponent(rawCity)

  if (country && region) {
    const isKerala = country === 'IN' && region === 'KL'

    if (isKerala) {
      const districtId   = detectDistrictFromCity(city) ?? 'ekm'
      const districtInfo = getDistrictById(districtId)
      return Response.json({
        isKerala: true,
        districtId,
        districtName: districtInfo?.name ?? 'Ernakulam',
        city,
      } satisfies GeoResult)
    }

    return Response.json({
      isKerala: false,
      districtId: null,
      districtName: null,
      city,
    } satisfies GeoResult)
  }

  // ── Local dev fallback: ipapi.co (1 000 req/day free, no key needed) ───────
  try {
    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    const isLoopback = !forwarded || forwarded === '127.0.0.1' || forwarded === '::1'
    const geoUrl = isLoopback
      ? 'https://ipapi.co/json/'
      : `https://ipapi.co/${forwarded}/json/`

    const res = await fetch(geoUrl, {
      signal: AbortSignal.timeout(3500),
      headers: { 'User-Agent': 'KeralaRain/1.0' },
    })

    if (!res.ok) throw new Error(`ipapi ${res.status}`)

    const geo = await res.json()
    const isKerala = geo.country_code === 'IN' && geo.region_code === 'KL'

    if (isKerala) {
      const districtId   = detectDistrictFromCity(geo.city ?? '') ?? 'ekm'
      const districtInfo = getDistrictById(districtId)
      return Response.json({
        isKerala: true,
        districtId,
        districtName: districtInfo?.name ?? 'Ernakulam',
        city: geo.city ?? null,
      } satisfies GeoResult)
    }

    return Response.json({
      isKerala: false,
      districtId: null,
      districtName: null,
      city: geo.city ?? null,
    } satisfies GeoResult)
  } catch {
    // Geolocation unavailable → client will show district modal
    return Response.json({
      isKerala: false,
      districtId: null,
      districtName: null,
      city: null,
    } satisfies GeoResult)
  }
}
