import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'sonner'
import './globals.css'
import { DistrictProvider } from '@/context/DistrictProvider'
import { DistrictModal } from '@/components/DistrictModal'
import { BASE_METADATA, WEBSITE_SCHEMA, DATASET_SCHEMA } from '@/lib/metadata'

const GTM_ID    = process.env.NEXT_PUBLIC_GTM_ID
const GA_ID     = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GSC_TOKEN = process.env.NEXT_PUBLIC_GSC_VERIFICATION

const _geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const _instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
})

export const metadata: Metadata = {
  ...BASE_METADATA,
  ...(GSC_TOKEN ? { verification: { google: GSC_TOKEN } } : {}),
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF3E3' },
    { media: '(prefers-color-scheme: dark)',  color: '#0B1410' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="S0e8z6iZla707J9I04S7Plvb4EQUwRW8zcpcwhSpwGQ" />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DATASET_SCHEMA) }}
        />

        {/* GTM — load as early as possible */}
        {GTM_ID && (
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}

        {/* GA4 — only if no GTM (GTM should carry GA4 via tags) */}
        {GA_ID && !GTM_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GA_ID}',{send_page_view:true});`}
            </Script>
          </>
        )}
      </head>

      <body style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
        {/* GTM noscript fallback */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        <DistrictProvider>
          {/* Sonner toast — themed to match our cream design */}
          <Toaster
            position="bottom-center"
            expand={false}
            richColors={false}
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--ink)',
                border: '1px solid var(--line-2)',
                borderRadius: '14px',
                fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
                fontSize: '14px',
                padding: '12px 18px',
                boxShadow: '0 8px 28px rgba(10,20,16,.14)',
              },
              descriptionStyle: {
                color: 'var(--ink-3)',
                fontSize: '12px',
              },
            }}
          />

          {children}

          {/* Fullscreen district picker — shown for outside-Kerala visitors */}
          <DistrictModal />
        </DistrictProvider>
      </body>
    </html>
  )
}
