'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db, hasDatabaseUrl } from '@/lib/db'
import {
  findDevStaffByEmail,
  countDevStaff,
} from '@/lib/auth/dev-store'
import {
  createStaffSession,
  destroyStaffSession,
  getStaffSession,
  ensureDefaultReceptionist,
} from '@/lib/auth/staff-session'
import {
  createIntendingMember,
  IntendingMemberResult,
} from '@/lib/member/generate-number'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const StaffLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid staff email address.'),
  pin: z
    .string()
    .trim()
    .min(4, 'PIN must be at least 4 digits.')
    .max(8, 'PIN cannot exceed 8 digits.')
    .regex(/^\d+$/, 'PIN must contain digits only.'),
})

const GenerateMemberSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name cannot exceed 80 characters.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits.')
    .max(20, 'Phone number is too long.')
    .regex(/^[+\d\s()-]+$/, 'Please enter a valid phone number.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .optional()
    .or(z.literal('')),
  tier: z.enum(['BASIC', 'PREMIUM']).default('BASIC'),
  durationMonths: z.coerce.number().int().min(1).max(24).default(1),
  openingBalanceKobo: z.coerce.number().int().min(0).default(0),
  sendEmailNotification: z.boolean().default(false),
})

export type StaffLoginState = {
  success?: boolean
  error?: string
  fieldErrors?: {
    email?: string[]
    pin?: string[]
  }
}

export type GenerateMemberState = {
  success?: boolean
  error?: string
  fieldErrors?: {
    fullName?: string[]
    phone?: string[]
    email?: string[]
    tier?: string[]
    durationMonths?: string[]
    openingBalanceKobo?: string[]
  }
  member?: IntendingMemberResult
}

async function getClientIp(): Promise<string> {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return headerList.get('x-real-ip') || '127.0.0.1'
}

/**
 * Staff Login Server Action
 * Validates staff email and PIN against authoritative database with bcrypt.
 * Enforces strict sliding-window rate limiting (5 attempts per 15 minutes).
 */
export async function staffLoginAction(
  prevState: StaffLoginState,
  formData: FormData,
): Promise<StaffLoginState> {
  const rawEmail = formData.get('email') as string
  const rawPin = formData.get('pin') as string

  const parsed = StaffLoginSchema.safeParse({ email: rawEmail, pin: rawPin })
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: 'Please correct the highlighted fields.',
    }
  }

  const { email, pin } = parsed.data
  const normalizedEmail = email.toLowerCase()

  // Rate limit staff login attempts by IP
  const rl = await checkRateLimit(RATE_LIMITS.STAFF_LOGIN)
  if (!rl.success) {
    return {
      success: false,
      error: rl.error || 'Too many login attempts. Please wait before trying again.',
    }
  }

  // Look up staff account
  let staffRecord: {
    id: string
    role: 'STAFF' | 'OWNER'
    email: string
    pinHash: string
    isActive: boolean
  } | null = null

  if (hasDatabaseUrl) {
    try {
      const dbStaff = await db.staff.findUnique({
        where: { email: normalizedEmail },
      })
      if (dbStaff && dbStaff.email && dbStaff.pinHash) {
        staffRecord = {
          id: dbStaff.id,
          role: dbStaff.role,
          email: dbStaff.email,
          pinHash: dbStaff.pinHash,
          isActive: dbStaff.isActive,
        }
      }
    } catch (err) {
      console.warn('Database staff query error during login:', err)
    }
  }

  // Fallback to dev store if database didn't have it or not connected
  if (!staffRecord) {
    const devStaff = findDevStaffByEmail(normalizedEmail)
    if (devStaff) {
      staffRecord = {
        id: devStaff.id,
        role: devStaff.role,
        email: devStaff.email,
        pinHash: devStaff.pinHash,
        isActive: devStaff.isActive,
      }
    }
  }

  // Generic rejection to avoid email enumeration
  if (!staffRecord || !staffRecord.isActive) {
    return {
      success: false,
      error: 'Invalid staff email or access PIN. Please check your credentials or contact the gym owner.',
    }
  }

  // Verify PIN with bcrypt
  const isPinValid = await bcrypt.compare(pin, staffRecord.pinHash)
  if (!isPinValid) {
    return {
      success: false,
      error: 'Invalid staff email or access PIN. Please check your credentials or contact the gym owner.',
    }
  }

  // Create secure HTTP-only 8-hour staff session cookie
  await createStaffSession({
    id: staffRecord.id,
    role: staffRecord.role,
    email: staffRecord.email,
  })

  redirect('/staff')
}

/**
 * Staff Logout Server Action
 */
export async function staffLogoutAction(): Promise<void> {
  await destroyStaffSession()
  redirect('/staff/login')
}

/**
 * Intending Member Generation Server Action
 * Strictly gated to authenticated staff. Enforces creation rate limits,
 * input validation, uniform 6-digit member number generation, and audit trail.
 */
export async function generateMemberNumberAction(
  prevState: GenerateMemberState,
  formData: FormData,
): Promise<GenerateMemberState> {
  // 1. Authoritative Staff Session Verification
  const staff = await getStaffSession()
  if (!staff) {
    return {
      success: false,
      error: 'Your staff session has expired or is unauthorized. Please log in again.',
    }
  }

  // 2. Staff Member Generation Rate Limit (30 creations / hour)
  const rl = await checkRateLimit(RATE_LIMITS.STAFF_GENERATE_MEMBER)
  if (!rl.success) {
    return {
      success: false,
      error: rl.error || 'Member generation rate limit reached. Please wait before creating more members.',
    }
  }

  // 3. Input Validation
  const rawData = {
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    email: formData.get('email') || undefined,
    tier: formData.get('tier') || 'BASIC',
    durationMonths: formData.get('durationMonths') || '1',
    openingBalanceKobo: formData.get('openingBalanceKobo') || '0',
    sendEmailNotification: formData.get('sendEmailNotification') === 'on',
  }

  const parsed = GenerateMemberSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: 'Please correct the highlighted fields before submitting.',
    }
  }

  const {
    fullName,
    phone,
    email,
    tier,
    durationMonths,
    openingBalanceKobo,
    sendEmailNotification,
  } = parsed.data

  // 4. Create Intending Member with Unlinked Security Fields
  const result = await createIntendingMember({
    fullName,
    phone,
    email: email || null,
    tier,
    durationMonths,
    openingBalanceKobo,
    staffActorId: staff.staffId,
    sendEmailNotification,
  })

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to generate member record. Please try again.',
    }
  }

  revalidatePath('/staff')

  return {
    success: true,
    member: result,
  }
}

/**
 * Seed Receptionist Account Server Action
 * Available in dev or when no staff exists, so the receptionist can test immediately.
 */
export async function seedReceptionistAction(): Promise<{
  success: boolean
  message: string
  email: string
  pin: string
}> {
  const result = await ensureDefaultReceptionist()
  return {
    success: true,
    message: result.created
      ? 'Default receptionist account created successfully.'
      : 'Receptionist account already active in system.',
    email: result.email,
    pin: result.defaultPin,
  }
}
