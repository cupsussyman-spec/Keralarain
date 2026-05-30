import { type NextRequest, NextResponse } from 'next/server'
import { getWeather } from '@/lib/weather-service'
import { KERALA_DISTRICT_LIST } from '@/lib/geo'
import type { DistrictId } from '@/lib/geo'

// Node.js runtime so in-memory cache persists within a warm function instance
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID = new Set<string>(KERALA_DISTRICT_LIST.map(d => d.id))

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ district: string }> },
) {
  const { district } = await params

  if (!VALID.has(district)) {
    return NextResponse.json({ error: 'Invalid district ID' }, { status: 400 })
  }

  try {
    const data = await getWeather(district as DistrictId)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error(`[api/weather] ${district}:`, err)
    return NextResponse.json(
      { error: 'Weather data temporarily unavailable' },
      { status: 503 },
    )
  }
}
