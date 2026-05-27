import type { Metadata } from 'next'
import { getDistrictById } from './geo'

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://keralarain.com'

export const BASE_METADATA: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'KeralaRain — Live Monsoon & Rainfall Tracker',
    template: '%s | KeralaRain',
  },

  description:
    'Live rainfall, monsoon tracker and weather forecasts for all 14 districts of Kerala. Real-time rain data, district alerts, and hourly conditions updated every 15 minutes.',

  keywords: [
    'Kerala rain', 'Kerala weather', 'Kerala monsoon', 'Kerala rainfall today',
    'Ernakulam rain', 'Kozhikode weather', 'Thiruvananthapuram rain',
    'south India monsoon', 'southwest monsoon Kerala', 'Kerala flood alert',
    'district wise rainfall Kerala', 'IMD Kerala forecast',
  ],

  authors: [{ name: 'KeralaRain', url: BASE_URL }],
  creator: 'KeralaRain',
  publisher: 'KeralaRain',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'KeralaRain',
    title: 'KeralaRain — Live Monsoon & Rain Tracker for Kerala',
    description:
      'Track live rainfall, monsoon progress and weather forecasts across all 14 Kerala districts.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KeralaRain — Kerala monsoon and rainfall tracker',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'KeralaRain — Live Monsoon Tracker',
    description: 'Real-time rain and weather data for all 14 Kerala districts.',
    images: ['/og-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
  },
}

// Generate district-specific metadata for future dynamic routes
export function getDistrictMetadata(districtId: string): Partial<Metadata> {
  const district = getDistrictById(districtId)
  const name = district?.name ?? 'Kerala'

  return {
    title: `Rain in ${name} Today`,
    description: `Live rain updates, weather forecasts, humidity and monsoon alerts for ${name} district, Kerala. Real-time data updated every 15 minutes.`,
    openGraph: {
      title: `${name} Rain Today — KeralaRain`,
      description: `Live monsoon tracker for ${name}. Current rainfall, hourly forecasts and district alerts.`,
      url: `${BASE_URL}/?district=${districtId}`,
    },
    alternates: {
      canonical: `${BASE_URL}/?district=${districtId}`,
    },
  }
}

// JSON-LD structured data
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'KeralaRain',
  url: BASE_URL,
  description: 'Live monsoon and rainfall tracker for all 14 districts of Kerala, India.',
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/?district={district_id}` },
    'query-input': 'required name=district_id',
  },
  publisher: {
    '@type': 'Organization',
    name: 'KeralaRain',
    url: BASE_URL,
  },
}

export const DATASET_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Kerala District Rainfall Data',
  description: 'Real-time and forecast rainfall data for all 14 districts of Kerala, India.',
  license: 'https://creativecommons.org/licenses/by/4.0/',
  spatialCoverage: {
    '@type': 'Place',
    name: 'Kerala, India',
    geo: { '@type': 'GeoShape', box: '8.2765 74.8944 12.7958 77.2195' },
  },
  temporalCoverage: '2024/..',
  creator: { '@type': 'Organization', name: 'KeralaRain', url: BASE_URL },
}
