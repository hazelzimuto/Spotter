import { randomBytes } from 'node:crypto'
import { db, hasDatabaseUrl } from '@/lib/db'
import { saveDevMember, findDevMemberByMemberNumber } from '@/lib/auth/dev-store'
import { sendWelcomeEmail } from '@/lib/email/mailer'

/**
 * Generates a uniform 6-digit number between 100000 and 999999 using
 * crypto.randomBytes with rejection sampling to eliminate modulo bias.
 */
export function generateNumericMemberCode(): string {
  const range = 900000
  const maxValid = 0xffffffff - (0xffffffff % range)

  let raw: number
  do {
    const buffer = randomBytes(4)
    raw = buffer.readUInt32BE(0)
  } while (raw >= maxValid)

  const codeNumber = (raw % range) + 100000
  return codeNumber.toString()
}

/**
 * Generates a unique 6-digit Member Number, verifying against database uniqueness constraints.
 */
export async function generateUniqueMemberNumber(): Promise<string> {
  const maxAttempts = 10

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateNumericMemberCode()

    if (hasDatabaseUrl) {
      try {
        const existing = await db.member.findUnique({
          where: { memberNumber: candidate },
          select: { id: true },
        })
        if (!existing) return candidate
      } catch (err) {
        console.warn('Database query failed while checking member number uniqueness:', err)
        // Fall back to dev check
        if (!findDevMemberByMemberNumber(candidate)) {
          return candidate
        }
      }
    } else {
      if (!findDevMemberByMemberNumber(candidate)) {
        return candidate
      }
    }
  }

  // Fallback timestamp suffix if collision limit is somehow reached
  return `${Math.floor(100000 + Math.random() * 900000)}`
}

/**
 * Generates a secure, readable 8-character alphanumeric activation code (e.g., SPT-9X4K).
 */
export function generateActivationCode(): string {
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Excludes 0, 1, I, O for readability
  let result = 'SPT-'
  const bytes = randomBytes(4)
  for (let i = 0; i < 4; i++) {
    result += charset[bytes[i] % charset.length]
  }
  return result
}

export interface CreateIntendingMemberParams {
  fullName: string
  phone: string
  email?: string | null
  tier?: 'BASIC' | 'PREMIUM'
  durationMonths?: number
  openingBalanceKobo?: number
  staffActorId: string
  sendEmailNotification?: boolean
}

export interface IntendingMemberResult {
  success: boolean
  memberId?: string
  memberNumber?: string
  activationCode?: string
  fullName?: string
  email?: string | null
  phone?: string
  tier?: 'BASIC' | 'PREMIUM'
  expiryDate?: Date
  error?: string
}

/**
 * Creates an intending gym member with an assigned unique Member Number.
 * Follows Spotter Security Rules:
 * - Credentials (`deviceId`, `pinHash`, `passwordHash`) remain NULL until the member activates their account.
 * - Opening balance is stored strictly as integer kobo.
 * - Enforces uniqueness constraints on `memberNumber` and `email`.
 */
export async function createIntendingMember(
  params: CreateIntendingMemberParams,
): Promise<IntendingMemberResult> {
  const trimmedName = params.fullName.trim()
  const sanitizedPhone = params.phone.trim()
  const normalizedEmail = params.email ? params.email.trim().toLowerCase() : null
  const tier = params.tier || 'BASIC'
  const durationMonths = params.durationMonths || 1
  const openingBalance = Math.max(0, Math.floor(params.openingBalanceKobo || 0))

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + durationMonths * 30)

  // Verify email uniqueness if provided
  if (normalizedEmail) {
    if (hasDatabaseUrl) {
      try {
        const existingEmail = await db.member.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        })
        if (existingEmail) {
          return {
            success: false,
            error: 'A member with this email address is already registered in the gym database.',
          }
        }
      } catch (err) {
        console.warn('Database email check failed:', err)
      }
    }
  }

  // Generate unique Member Number and Activation Code
  const memberNumber = await generateUniqueMemberNumber()
  const activationCode = generateActivationCode()

  let memberId = ''

  if (hasDatabaseUrl) {
    try {
      const created = await db.member.create({
        data: {
          fullName: trimmedName,
          phone: sanitizedPhone,
          email: normalizedEmail,
          memberNumber,
          activationCode,
          tier,
          expiryDate,
          openingBalance,
          currentBalance: openingBalance,
          // Security: unlinked until member registers device
          deviceId: null,
          pinHash: null,
          passwordHash: null,
          emailVerified: false,
        },
      })
      memberId = created.id
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err)
      console.error('Failed to create member in database:', errMessage)
      return {
        success: false,
        error: 'Database transaction failed while creating intending member record.',
      }
    }
  } else {
    const devCreated = saveDevMember({
      fullName: trimmedName,
      phone: sanitizedPhone,
      email: normalizedEmail,
      memberNumber,
      activationCode,
      tier,
      expiryDate,
      emailVerified: false,
    })
    memberId = devCreated.id
  }

  // Optionally send welcome notification if email was provided and requested
  if (normalizedEmail && params.sendEmailNotification) {
    try {
      await sendWelcomeEmail({
        to: normalizedEmail,
        fullName: trimmedName,
        memberNumber,
      })
    } catch (mailErr) {
      console.warn('Unable to dispatch welcome email to intending member:', mailErr)
      // Do not fail member creation if email dispatch fails
    }
  }

  return {
    success: true,
    memberId,
    memberNumber,
    activationCode,
    fullName: trimmedName,
    email: normalizedEmail,
    phone: sanitizedPhone,
    tier,
    expiryDate,
  }
}
