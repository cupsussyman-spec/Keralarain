import type { MetadataRoute } from 'next'
import { KERALA_DISTRICT_LIST } from '@/lib/geo'
import { BASE_URL } from '@/lib/metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const districtPages: MetadataRoute.Sitemap = KERALA_DISTRICT_LIST.map(d => ({
    url: `${BASE_URL}/?district=${d.id}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.9,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    ...districtPages,
  ]
}
