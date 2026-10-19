import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/auth/cookies'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)

  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/auth?view=signin'
  return NextResponse.redirect(new URL(returnTo, request.url))
}
