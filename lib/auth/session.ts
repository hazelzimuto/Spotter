import { randomBytes, createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import {
  DEVICE_COOKIE,
  isSecureInProduction,
  SESSION_COOKIE,
  TEN_YEARS_SECONDS,
} from '@/lib/auth/cookies'

/**
 * FR-6 session handling.
 *
 * The browser holds an opaque 256-bit token. Only its SHA-256 digest is
 * persisted, so a leaked Session row cannot be replayed as a live cookie.
 */

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function randomToken() {
  return randomBytes(32).toString('base64url')
}

/**
 * Returns this browser's device identifier, minting and persisting one on
 * first use. Stored in its own long-lived cookie so the member stays bound to
 * a single device across sessions.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(DEVICE_COOKIE)?.value
  if (existing) return existing

  const deviceId = randomToken()
  cookieStore.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    secure: isSecureInProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: TEN_YEARS_SECONDS,
  })
  return deviceId
}

/**
 * Issues a session for `memberId` and writes the session cookie.
 *
 * Any pre-existing session for this member is revoked first, so FR-6's
 * "only one device may be linked at a time" holds even if a stale cookie
 * somehow survived.
 */
export async function createSession(memberId: string, deviceId: string) {
  await db.session.updateMany({
    where: { memberId, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  const token = randomToken()

  await db.session.create({
    data: {
      memberId,
      deviceId,
      tokenHash: hashToken(token),
      lastLoginAt: new Date(),
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecureInProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: TEN_YEARS_SECONDS,
  })
}

export type AuthenticatedMember = {
  memberId: string
  deviceId: string
  tier: 'BASIC' | 'PREMIUM'
  fullName: string
}

/**
 * Resolves the current session, or null when unauthenticated.
 *
 * Revocation is checked on both the session row and the member's `deviceId`,
 * so a staff force-unlink takes effect on the very next request.
 */
export async function getSession(): Promise<AuthenticatedMember | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { member: true },
  })

  if (!session || session.revokedAt) return null

  // A null or mismatched deviceId means staff force-unlinked this member.
  if (!session.member.deviceId || session.member.deviceId !== session.deviceId) {
    return null
  }

  return {
    memberId: session.memberId,
    deviceId: session.deviceId,
    tier: session.member.tier,
    fullName: session.member.fullName,
  }
}

/** Revokes the current session and clears its cookie. */
export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    await db.session.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  cookieStore.delete(SESSION_COOKIE)
}
