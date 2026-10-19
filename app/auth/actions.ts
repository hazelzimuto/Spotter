'use server'

import { redirect } from 'next/navigation'
import { db, hasDatabaseUrl } from '@/lib/db'
import {
  saveDevMember,
  findDevMemberByDeviceId,
  findDevMemberByActivationCode,
  findDevMemberByMemberNumber,
  updateDevMemberPin,
} from '@/lib/auth/dev-store'
import { hashPin, verifyPin } from '@/lib/auth/pin'
import { createSession, getOrCreateDeviceId } from '@/lib/auth/session'
import {
  clearPendingActivation,
  getPendingActivation,
  setPendingActivation,
} from '@/lib/auth/pending-activation'
import {
  signUpSchema,
  signInSchema,
  activationCodeSchema,
  pinSetupSchema,
  validateWithZod,
  isPasswordBreached,
} from '@/lib/validation/auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email/mailer'
import {
  generateEmailVerificationCode,
  VERIFICATION_CODE_EXPIRY_MS,
} from '@/lib/auth/email-verification'

export type AuthFormState = {
  error?: string
  success?: boolean
}

/**
 * Sign-up action: Creates a new member account with Full Name, Phone number, and 4-digit PIN,
 * binding this device directly to the new account.
 */
export async function submitSignUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rateLimit = await checkRateLimit(RATE_LIMITS.SIGN_UP)
  if (!rateLimit.success) {
    return { error: rateLimit.error }
  }

  const validation = validateWithZod(signUpSchema, formData)
  if (!validation.success) {
    return { error: validation.error }
  }

  const { fullName, email, memberNumber, password } = validation.data

  const pwnedCheck = await isPasswordBreached(password)
  if (pwnedCheck.breached) {
    return {
      error: 'This password has appeared in a data breach. Please choose a more secure password.',
    }
  }

  const deviceId = await getOrCreateDeviceId()
  const passwordHash = await hashPin(password)

  // Initial 30-day membership access window
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)

  // Generate secure 6-digit email verification code via randomBytes
  const verificationCode = generateEmailVerificationCode()
  const verificationCodeExpiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS)

  let memberId: string | null = null

  if (hasDatabaseUrl) {
    try {
      const member = await db.member.create({
        data: {
          fullName,
          email,
          memberNumber,
          passwordHash,
          pinHash: passwordHash,
          deviceId,
          tier: 'BASIC',
          openingBalance: 0,
          currentBalance: 0,
          expiryDate,
          emailVerified: false,
          verificationCode,
          verificationCodeExpiresAt,
        },
      })
      memberId = member.id
    } catch (err: unknown) {
      const prismaErr = err as { code?: string; meta?: { target?: string[] | string } }
      if (prismaErr?.code === 'P2002') {
        const target = String(prismaErr?.meta?.target || '')
        if (target.includes('memberNumber')) {
          return { error: 'An account with this member number already exists.' }
        }
        if (target.includes('email')) {
          return { error: 'An account with this email address already exists.' }
        }
        return { error: 'An account with these details already exists.' }
      }
      console.warn('Database member creation failed, falling back to dev store:', err)
    }
  }

  if (!memberId) {
    const member = saveDevMember({
      fullName,
      email,
      memberNumber,
      passwordHash,
      pinHash: passwordHash,
      deviceId,
      tier: 'BASIC',
      expiryDate,
      emailVerified: false,
      verificationCode,
      verificationCodeExpiresAt,
    })
    memberId = member.id
  }

  await createSession(memberId, deviceId)

  // Dispatch branded verification email and welcome email
  if (email) {
    try {
      await sendVerificationEmail({ to: email, fullName, code: verificationCode })
    } catch (err) {
      console.warn('Verification email delivery failed:', err)
    }

    try {
      await sendWelcomeEmail({ to: email, fullName, memberNumber })
    } catch (err) {
      console.warn('Welcome email delivery failed:', err)
    }
  }

  redirect('/member')
}

/**
 * Sign-in action: Authenticates a member using their 6-digit Member number and Password.
 */
export async function submitSignIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rateLimit = await checkRateLimit(RATE_LIMITS.SIGN_IN)
  if (!rateLimit.success) {
    return { error: rateLimit.error }
  }

  const validation = validateWithZod(signInSchema, formData)
  if (!validation.success) {
    return { error: validation.error }
  }

  const { memberNumber, password } = validation.data

  const deviceId = await getOrCreateDeviceId()

  if (hasDatabaseUrl) {
    try {
      const member = await db.member.findFirst({
        where: { memberNumber },
        select: { id: true, passwordHash: true, pinHash: true, deviceId: true },
      })

      if (member) {
        const hash = member.passwordHash || member.pinHash
        if (!hash) {
          return { error: 'Invalid member number or password.' }
        }

        const matches = await verifyPin(password, hash)
        if (!matches) {
          return { error: 'Invalid member number or password.' }
        }

        if (member.deviceId !== deviceId) {
          await db.member.update({
            where: { id: member.id },
            data: { deviceId },
          })
        }

        await createSession(member.id, deviceId)
        redirect('/member')
      }
    } catch (err) {
      console.warn('Database sign-in check failed, falling back to dev store:', err)
    }
  }

  const member =
    findDevMemberByMemberNumber(memberNumber) || findDevMemberByDeviceId(deviceId)
  if (!member) {
    return { error: 'Invalid member number or password.' }
  }

  const hash = member.passwordHash || member.pinHash
  if (!hash) {
    return { error: 'Invalid member number or password.' }
  }

  const matches = await verifyPin(password, hash)
  if (!matches) {
    return { error: 'Invalid member number or password.' }
  }

  member.deviceId = deviceId
  await createSession(member.id, deviceId)
  redirect('/member')
}

/**
 * Activation Step 1: Member enters the one-time activation code from the desk.
 */
export async function submitActivationCode(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rateLimit = await checkRateLimit(RATE_LIMITS.ACTIVATION_CODE)
  if (!rateLimit.success) {
    return { error: rateLimit.error }
  }

  const validation = validateWithZod(activationCodeSchema, formData)
  if (!validation.success) {
    return { error: validation.error }
  }

  const { activationCode: code } = validation.data

  if (hasDatabaseUrl) {
    try {
      const member = await db.member.findUnique({
        where: { activationCode: code },
        select: { id: true, deviceId: true },
      })

      if (member) {
        if (member.deviceId) {
          return {
            error:
              'That code is not valid. Ask the front desk for a fresh code, or have them unlink your old device.',
          }
        }

        await setPendingActivation(member.id)
        redirect('/auth?view=pin')
      }
    } catch (err) {
      console.warn('Database activation check failed, falling back to dev store:', err)
    }
  }

  let member = findDevMemberByActivationCode(code)
  if (!member) {
    member = saveDevMember({
      fullName: 'Gym Member',
      tier: 'BASIC',
      activationCode: code,
    })
  } else if (member.deviceId) {
    return {
      error:
        'That code is not valid. Ask the front desk for a fresh code, or have them unlink your old device.',
    }
  }

  await setPendingActivation(member.id)
  redirect('/auth?view=pin')
}

/**
 * Activation Step 2: Member chooses their 4-digit PIN and binds this device.
 */
export async function submitPin(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rateLimit = await checkRateLimit(RATE_LIMITS.PIN_SETUP)
  if (!rateLimit.success) {
    return { error: rateLimit.error }
  }

  const memberId = await getPendingActivation()
  if (!memberId) redirect('/auth?view=activate')

  const validation = validateWithZod(pinSetupSchema, formData)
  if (!validation.success) {
    return { error: validation.error }
  }

  const { pin } = validation.data

  const deviceId = await getOrCreateDeviceId()
  const pinHash = await hashPin(pin)

  let boundInDb = false
  if (hasDatabaseUrl) {
    try {
      // Bind device, store pinHash, and clear activationCode in a single query
      const bound = await db.member.updateMany({
        where: { id: memberId, activationCode: { not: null }, deviceId: null },
        data: { pinHash, deviceId, activationCode: null },
      })

      if (bound.count === 1) {
        boundInDb = true
      }
    } catch (err) {
      console.warn('Database pin bind failed, falling back to dev store:', err)
    }
  }

  if (!boundInDb) {
    updateDevMemberPin(memberId, pinHash, deviceId)
  }

  await createSession(memberId, deviceId)
  await clearPendingActivation()

  redirect('/member')
}
