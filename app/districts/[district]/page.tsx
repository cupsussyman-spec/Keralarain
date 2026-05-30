import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KERALA_DISTRICT_LIST, getDistrictById } from '@/lib/geo'
import type { DistrictId } from '@/lib/geo'
import { getWeather } from '@/lib/weather-service'
import { getDistrictMetadata, generateWeatherSchema } from '@/lib/metadata'
import { DistrictWeatherPage } from '@/components/district-weather-page'

// ISR: revalidate every 10 minutes
export const revalidate = 600

interface Props {
  params: Promise<{ district: string }>
}

export async function generateStaticParams() {
  return KERALA_DISTRICT_LIST.map(d => ({ district: d.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { district } = await params
  return getDistrictMetadata(district)
}

export default async function DistrictPage({ params }: Props) {
  const { district } = await params
  const info = getDistrictById(district)
  if (!info) notFound()

  // Pre-fetch on server so SSR delivers weather in the initial HTML
  let initialWeather = null
  try {
    initialWeather = await getWeather(district as DistrictId)
  } catch {
    // Client will retry via useWeather hook; graceful degradation
  }

  const weatherSchema = initialWeather
    ? generateWeatherSchema(initialWeather, info.name)
    : null

  return (
    <>
      {weatherSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(weatherSchema) }}
        />
      )}
      <DistrictWeatherPage
        districtId={district}
        districtName={info.name}
        initialWeather={initialWeather}
      />
    </>
  )
}
