import type { Metadata } from 'next'
import { getDistrictById } from './geo'
import type { WeatherData } from './weather-service'

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

// District-specific metadata — title format matches SEO requirement
export function getDistrictMetadata(districtId: string): Partial<Metadata> {
  const district = getDistrictById(districtId)
  const name = district?.name ?? 'Kerala'
  const title = `Live Rain & Weather in ${name} | KeralaRain`

  return {
    title,
    description: `Real-time rainfall, hourly forecast and weather conditions for ${name} district, Kerala. Updated every 10 minutes from WeatherAPI and IMD.`,
    keywords: [
      `${name} rain today`, `${name} weather`, `${name} rainfall`, `${name} monsoon`,
      'Kerala rain', 'Kerala weather', 'Kerala monsoon tracker',
    ],
    openGraph: {
      title,
      description: `Live monsoon tracker for ${name}. Current rainfall, temperature, humidity and hourly forecast.`,
      url: `${BASE_URL}/districts/${districtId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Live rain & weather for ${name}, Kerala.`,
    },
    alternates: {
      canonical: `${BASE_URL}/districts/${districtId}`,
    },
  }
}

// Weather observation schema for district pages (Schema.org)
export function generateWeatherSchema(weather: WeatherData, districtName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Observation',
    name: `Weather in ${districtName}, Kerala`,
    description: `Current weather conditions for ${districtName} district, Kerala, India`,
    observationDate: weather.current.lastUpdated,
    value: {
      '@type': 'QuantitativeValue',
      value: weather.current.precipMm,
      unitCode: 'MMT',
      name: 'Rainfall (mm/hr)',
    },
    measuredProperty: {
      '@type': 'Property',
      name: 'Rainfall rate',
    },
    featureOfInterest: {
      '@type': 'Place',
      name: `${districtName}, Kerala, India`,
      geo: {
        '@type': 'GeoShape',
        box: '8.2765 74.8944 12.7958 77.2195',
      },
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Temperature',  value: `${Math.round(weather.current.tempC)}°C` },
      { '@type': 'PropertyValue', name: 'Humidity',     value: `${weather.current.humidity}%` },
      { '@type': 'PropertyValue', name: 'Wind Speed',   value: `${Math.round(weather.current.windKph)} km/h` },
      { '@type': 'PropertyValue', name: 'Condition',    value: weather.current.condition },
      { '@type': 'PropertyValue', name: 'Data Source',  value: weather.source === 'weatherapi' ? 'WeatherAPI.com' : 'OpenWeatherMap' },
    ],
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
