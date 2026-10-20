import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { db, hasDatabaseUrl } from '@/lib/db'
import {
  STAFF_SESSION_COOKIE,
  STAFF_SESSION_SECONDS,
  isSecureInProduction,
} from '@/lib/auth/cookies'
import {
  saveDevStaff,
  findDevStaffByEmail,
  findDevStaffById,
  countDevStaff,
} from './dev-store'

/**
 * RECEPTIONIST & STAFF SESSION SERVICE
 *
 * Implements cryptographically signed, tamper-proof session tokens for staff.
 * Operates on a strict 8-hour shift lifetime with authoritative database verification
 * on every request to ensure immediate revocation if staff is deactivated.
 */

export interface AuthenticatedStaff {
  staffId: string
  fullName: string
  email: string
  phone: string
  role: 'STAFF' | 'OWNER'
}

interface StaffSessionPayload {
  staffId: string
  role: 'STAFF' | 'OWNER'
  email: string
  expiresAt: number
}

function getStaffSecret(): string {
  return (
    process.env.STAFF_SESSION_SECRET ||
    process.env.DATABASE_URL ||
    'spotter-staff-auth-signing-key-default'
  )
}

function signPayload(payloadJson: string): string {
  const secret = getStaffSecret()
  return createHmac('sha256', secret).update(payloadJson).digest('base64url')
}

/**
 * Encodes and signs a staff session token.
 */
function createSignedToken(payload: StaffSessionPayload): string {
  const payloadJson = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = signPayload(payloadJson)
  return `${payloadJson}.${signature}`
}

/**
 * Validates the HMAC signature and timestamp of a staff session token.
 */
function verifySignedToken(token: string): StaffSessionPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadBase64, signature] = parts
  const expectedSignature = signPayload(payloadBase64)

  try {
    const sigA = Buffer.from(signature, 'utf8')
    const sigB = Buffer.from(expectedSignature, 'utf8')
    if (sigA.length !== sigB.length || !timingSafeEqual(sigA, sigB)) {
      return null
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadJson) as StaffSessionPayload

    // Enforce 8-hour shift expiry
    if (Date.now() > payload.expiresAt) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Creates and sets an HTTP-only staff session cookie.
 */
export async function createStaffSession(staff: {
  id: string
  role: 'STAFF' | 'OWNER'
  email: string
}) {
  const expiresAt = Date.now() + STAFF_SESSION_SECONDS * 1000
  const token = createSignedToken({
    staffId: staff.id,
    role: staff.role,
    email: staff.email.trim().toLowerCase(),
    expiresAt,
  })

  const cookieStore = await cookies()
  cookieStore.set(STAFF_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecureInProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: STAFF_SESSION_SECONDS,
  })
}

/**
 * Resolves the currently authenticated receptionist or staff member.
 * Checks cookie signature, expiration, and performs an authoritative database
 * verification to confirm the staff account is active (`isActive: true`).
 */
export async function getStaffSession(): Promise<AuthenticatedStaff | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(STAFF_SESSION_COOKIE)?.value
  if (!token) return null

  const payload = verifySignedToken(token)
  if (!payload) return null

  // Authoritative database check
  if (hasDatabaseUrl) {
    try {
      const staff = await db.staff.findUnique({
        where: { id: payload.staffId },
      })

      if (staff && staff.isActive && (staff.role === 'STAFF' || staff.role === 'OWNER')) {
        return {
          staffId: staff.id,
          fullName: staff.fullName,
          email: staff.email || payload.email,
          phone: staff.phone,
          role: staff.role,
        }
      }

      // If staff record does not exist or was deactivated, revoke access immediately
      return null
    } catch (err) {
      console.warn('Database staff lookup failed, attempting dev store fallback:', err)
    }
  }

  // Fallback to in-memory dev store
  const devStaff = findDevStaffById(payload.staffId)
  if (devStaff && devStaff.isActive && (devStaff.role === 'STAFF' || devStaff.role === 'OWNER')) {
    return {
      staffId: devStaff.id,
      fullName: devStaff.fullName,
      email: devStaff.email,
      phone: devStaff.phone,
      role: devStaff.role,
    }
  }

  return null
}

/**
 * Clears the staff session cookie.
 */
export async function destroyStaffSession() {
  const cookieStore = await cookies()
  cookieStore.delete(STAFF_SESSION_COOKIE)
}

/**
 * Automatically ensures at least one default receptionist account exists
 * so receptionists can log into the dashboard immediately during development or initial setup.
 */
export async function ensureDefaultReceptionist(): Promise<{
  email: string
  defaultPin: string
  created: boolean
}> {
  const defaultEmail = 'desk@spottergym.com'
  const defaultPin = '1234'
  const defaultPhone = '+2348000000001'
  const defaultName = 'Front Desk Receptionist'
  const pinHash = await bcrypt.hash(defaultPin, 10)

  if (hasDatabaseUrl) {
    try {
      const existing = await db.staff.findFirst({
        where: {
          OR: [{ email: defaultEmail }, { role: 'STAFF' }],
        },
      })

      if (!existing) {
        await db.staff.create({
          data: {
            fullName: defaultName,
            phone: defaultPhone,
            email: defaultEmail,
            role: 'STAFF',
            pinHash,
            isActive: true,
          },
        })
        return { email: defaultEmail, defaultPin, created: true }
      }

      return { email: existing.email || defaultEmail, defaultPin, created: false }
    } catch (err) {
      console.warn('Unable to query database for staff seeding:', err)
    }
  }

  // Dev store
  if (countDevStaff() === 0) {
    saveDevStaff({
      fullName: defaultName,
      phone: defaultPhone,
      email: defaultEmail,
      role: 'STAFF',
      pinHash,
      isActive: true,
    })
    return { email: defaultEmail, defaultPin, created: true }
  }

  return { email: defaultEmail, defaultPin, created: false }
}
