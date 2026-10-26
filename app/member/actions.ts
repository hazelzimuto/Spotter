'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { db, hasDatabaseUrl } from '@/lib/db'
import {
  findDevMemberById,
  updateDevMemberEmailVerification,
  setDevMemberVerificationCode,
} from '@/lib/auth/dev-store'
import {
  generateEmailVerificationCode,
  isVerificationCodeValid,
  VERIFICATION_CODE_EXPIRY_MS,
} from '@/lib/auth/email-verification'
import { sendVerificationEmail } from '@/lib/email/mailer'
import { validateWithZod, verifyEmailCodeSchema } from '@/lib/validation/auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export interface VerificationActionState {
  success?: boolean
  error?: string
  message?: string
}

/**
 * Server action to verify the member's email using the 6-digit code.
 */
export async function submitEmailVerification(
  _prev: VerificationActionState,
  formData: FormData,
): Promise<VerificationActionState> {
  const session = await getSession()
  if (!session) {
    return { error: 'Your session has expired. Please sign in again.' }
  }

  const rateLimit = await checkRateLimit(RATE_LIMITS.VERIFY_EMAIL)
  if (!rateLimit.success) {
    return { error: rateLimit.error }
  }

  const validation = validateWithZod(verifyEmailCodeSchema, formData)
  if (!validation.success) {
    return { error: validation.error }
  }

  const { code } = validation.data

  const isDevMember = session.memberId.startsWith('dev-mem-')

  if (hasDatabaseUrl && !isDevMember) {
    try {
      const member = await db.member.findUnique({
        where: { id: session.memberId },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          verificationCode: true,
          verificationCodeExpiresAt: true,
        },
      })

      if (!member) {
        return { error: 'Member record not found.' }
      }

      if (member.emailVerified) {
        return { success: true, message: 'Your email address is already verified.' }
      }

      const check = isVerificationCodeValid(
        member.verificationCode,
        member.verificationCodeExpiresAt,
        code,
      )

      if (!check.valid) {
        if (check.reason === 'EXPIRED') {
          return { error: 'This verification code has expired. Please request a new code.' }
        }
        if (check.reason === 'MISMATCH') {
          return { error: 'Incorrect verification code. Please check your email and try again.' }
        }
        return { error: 'No pending verification code found. Please request a new code.' }
      }

      await db.member.update({
        where: { id: session.memberId },
        data: {
          emailVerified: true,
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })
    } catch (err) {
      console.error('Database verification update failed:', err)
      return { error: 'Unable to verify email at this moment. Please try again shortly.' }
    }
  } else {
    // In-memory dev store fallback
    const devMember = findDevMemberById(session.memberId)
    if (!devMember) {
      return { error: 'Member record not found.' }
    }

    if (devMember.emailVerified) {
      return { success: true, message: 'Your email address is already verified.' }
    }

    const check = isVerificationCodeValid(
      devMember.verificationCode,
      devMember.verificationCodeExpiresAt,
      code,
    )

    if (!check.valid) {
      if (check.reason === 'EXPIRED') {
        return { error: 'This verification code has expired. Please request a new code.' }
      }
      if (check.reason === 'MISMATCH') {
        return { error: 'Incorrect verification code. Please check your email and try again.' }
      }
      return { error: 'No pending verification code found. Please request a new code.' }
    }

    updateDevMemberEmailVerification(session.memberId, true)
  }

  revalidatePath('/member')
  return { success: true, message: 'Your email address has been verified successfully.' }
}

/**
 * Server action to resend a fresh 6-digit verification code.
 */
export async function resendEmailVerification(): Promise<VerificationActionState> {
  const session = await getSession()
  if (!session || !session.email) {
    return { error: 'Unable to identify your email address. Please sign in again.' }
  }

  const rateLimit = await checkRateLimit(RATE_LIMITS.RESEND_VERIFICATION)
  if (!rateLimit.success) {
    return { error: rateLimit.error }
  }

  const isDevMember = session.memberId.startsWith('dev-mem-')

  // Check if already verified
  if (hasDatabaseUrl && !isDevMember) {
    const member = await db.member.findUnique({
      where: { id: session.memberId },
      select: { emailVerified: true },
    })
    if (member?.emailVerified) {
      return { success: true, message: 'Your email address is already verified.' }
    }
  } else {
    const devMember = findDevMemberById(session.memberId)
    if (devMember?.emailVerified) {
      return { success: true, message: 'Your email address is already verified.' }
    }
  }

  const newCode = generateEmailVerificationCode()
  const newExpiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS)

  if (hasDatabaseUrl && !isDevMember) {
    try {
      await db.member.update({
        where: { id: session.memberId },
        data: {
          verificationCode: newCode,
          verificationCodeExpiresAt: newExpiresAt,
        },
      })
    } catch (err) {
      console.error('Failed to update verification code in database:', err)
      return { error: 'Unable to generate a new code right now. Please try again.' }
    }
  } else {
    setDevMemberVerificationCode(session.memberId, newCode, newExpiresAt)
  }

  try {
    await sendVerificationEmail({
      to: session.email,
      fullName: session.fullName,
      code: newCode,
    })
  } catch (err) {
    console.error('Failed to dispatch verification email:', err)
    return { error: 'Failed to send verification email. Please check your mail settings.' }
  }

  return {
    success: true,
    message: 'A fresh 6-digit verification code has been sent to your email.',
  }
}

/**
 * Server action to initiate a Stripe checkout session for membership subscription renewal.
 */
export async function initiateSubscriptionPayment(planId: string): Promise<import('@/lib/payments/stripe').InitiatePaymentResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, reference: '', error: 'Your session has expired. Please sign in again.' }
  }

  const { headers } = await import('next/headers')
  const reqHeaders = await headers()
  const host = reqHeaders.get('host') || 'localhost:3000'
  const proto = reqHeaders.get('x-forwarded-proto') || 'http'
  const origin = `${proto}://${host}`

  const { initiateSubscriptionCheckout } = await import('@/lib/payments/stripe')
  return await initiateSubscriptionCheckout({
    memberId: session.memberId,
    email: session.email,
    fullName: session.fullName,
    planId,
    origin,
  })
}

/**
 * Server action to confirm a subscription payment renewal and revalidate member portal.
 */
export async function completeSubscriptionPayment(reference: string, planId?: string) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Your session has expired. Please sign in again.' }
  }

  const { confirmSubscriptionPayment } = await import('@/lib/payments/stripe')
  const res = await confirmSubscriptionPayment({
    reference,
    memberId: session.memberId,
    planId,
  })

  if (res.success) {
    revalidatePath('/member')
    return { success: true, message: 'Subscription renewed successfully.' }
  }

  return { success: false, error: res.error || 'Failed to confirm renewal.' }
}

