import { type NextRequest, NextResponse } from 'next/server'

const HINT_COOKIE = 'krh'         // geo hint for the client
const HINT_TTL    = 60 * 60 * 24  // 24 hours

export function proxy(req: NextRequest) {
  const res = NextResponse.next()

  // Skip if client already has a hint cookie (avoids redundant work)
  if (req.cookies.has(HINT_COOKIE)) return res

  // Vercel injects these on every request in production
  const country = req.headers.get('x-vercel-ip-country') ?? ''
  const region  = req.headers.get('x-vercel-ip-country-region') ?? ''
  const rawCity = req.headers.get('x-vercel-ip-city') ?? ''

  const cookieOpts = {
    maxAge: HINT_TTL,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }

  if (country === 'IN' && region === 'KL') {
    // Kerala user → store "KL:{city}" so the DistrictProvider skips the API call
    res.cookies.set(HINT_COOKIE, `KL:${rawCity}`, cookieOpts)
  } else if (country) {
    // Known non-Kerala user
    res.cookies.set(HINT_COOKIE, 'out', cookieOpts)
  }
  // If no Vercel geo headers (local dev) → no cookie set → provider calls /api/locate

  return res
}

export const config = {
  // Run on all pages except static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|svg|ico|webp)).*)'],
}
