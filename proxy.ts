import { NextResponse, type NextRequest } from 'next/server'

/**
 * Optimistic route gate for the FR-6 auth flow.
 *
 * This only checks whether the session cookie is present. It deliberately does
 * not hit the database, because proxy runs on every request including
 * prefetches. The authoritative check lives in lib/auth/session.ts, which
 * every Server Action and private query calls (see .agent/rules/architecture.md
 * rule 2).
 */

const SESSION_COOKIE = 'spotter_session'

/** Auth and activation paths reachable without a session. */
const AUTH_PATHS = ['/auth', '/activate', '/activate/pin']

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value)

  // Redirect legacy /privacy and /terms URLs to the home page conditional views.
  if (pathname === '/privacy') {
    return NextResponse.redirect(new URL('/?view=privacy', request.url))
  }
  if (pathname === '/terms') {
    return NextResponse.redirect(new URL('/?view=terms', request.url))
  }

  // Redirect legacy /activate routes to unified /auth conditional views.
  if (pathname === '/activate') {
    return NextResponse.redirect(new URL('/auth?view=activate', request.url))
  }
  if (pathname === '/activate/pin') {
    return NextResponse.redirect(new URL('/auth?view=pin', request.url))
  }

  // Root landing page (/) is public for unauthenticated visitors.
  if (pathname === '/') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/member', request.url))
    }
    return NextResponse.next()
  }

  // Authenticated members have no reason to see the auth screens.
  if (hasSession && isAuthPath(pathname)) {
    return NextResponse.redirect(new URL('/member', request.url))
  }

  // Auth flows are public for unauthenticated visitors.
  if (isAuthPath(pathname)) {
    return NextResponse.next()
  }

  // Protected routes require an active session.
  if (!hasSession) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run on every route except Next internals, the webhook endpoints, and
  // static assets — otherwise auth redirects would block CSS and JS.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)$).*)',
  ],
}
