import {
  isSecureInProduction,
  PENDING_ACTIVATION_COOKIE,
  PENDING_ACTIVATION_SECONDS,
} from '@/lib/auth/cookies'
import { cookies } from 'next/headers'

/**
 * Bridges the two FR-6 screens. The activation code is validated on screen 1;
 * screen 2 may only set a PIN for a member id carried here, so the PIN screen
 * cannot be reached by navigating directly to it.
 */
export async function setPendingActivation(memberId: string) {
  const cookieStore = await cookies()
  cookieStore.set(PENDING_ACTIVATION_COOKIE, memberId, {
    httpOnly: true,
    secure: isSecureInProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: PENDING_ACTIVATION_SECONDS,
  })
}

export async function getPendingActivation(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(PENDING_ACTIVATION_COOKIE)?.value ?? null
}

export async function clearPendingActivation() {
  const cookieStore = await cookies()
  cookieStore.delete(PENDING_ACTIVATION_COOKIE)
}
