'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { hashPin, verifyPin } from '@/lib/auth/pin'
import { createSession, getOrCreateDeviceId } from '@/lib/auth/session'
import {
  clearPendingActivation,
  getPendingActivation,
  setPendingActivation,
} from '@/lib/auth/pending-activation'
import { validateActivationCode, validatePin } from '@/lib/auth/validation'

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
  const fullName = formData.get('fullName')?.toString()?.trim() || ''
  if (!fullName) {
    return { error: 'This field must not be empty' }
  }
  if (fullName.length < 2) {
    return { error: 'Full name must be at least 2 characters.' }
  }
  const nameParts = fullName.split(/\s+/).filter(Boolean)
  if (nameParts.length < 2) {
    return { error: 'Please enter at least 2 names separated with a space.' }
  }

  const phone = formData.get('phone')?.toString()?.trim() || ''
  if (!phone) {
    return { error: 'This field must not be empty' }
  }

  const email = formData.get('email')?.toString()?.trim() || ''
  if (!email) {
    return { error: 'This field must not be empty' }
  }
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  if (!isEmailValid) {
    return { error: 'Enter a valid email address' }
  }

  const { pin, error: pinError } = validatePin(formData.get('pin'))
  if (pinError) return { error: pinError }

  const confirmPin = formData.get('confirmPin')
  if (confirmPin !== pin) {
    return { error: 'The two PINs do not match.' }
  }

  const deviceId = await getOrCreateDeviceId()
  const pinHash = await hashPin(pin)

  // Initial 30-day membership access window
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)

  const member = await db.member.create({
    data: {
      fullName,
      phone,
      email,
      pinHash,
      deviceId,
      tier: 'BASIC',
      openingBalance: 0,
      currentBalance: 0,
      expiryDate,
    },
  })

  await createSession(member.id, deviceId)
  redirect('/member')
}

/**
 * Sign-in action: Authenticates a member on an already linked device using their 4-digit PIN.
 */
export async function submitSignIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { pin, error } = validatePin(formData.get('pin'))
  if (error) return { error }

  const deviceId = await getOrCreateDeviceId()

  const member = await db.member.findFirst({
    where: { deviceId },
    select: { id: true, pinHash: true, deviceId: true },
  })

  if (!member || !member.pinHash) {
    return {
      error:
        'This device has not been linked to a membership yet. Please enter your activation code from the front desk to link it.',
    }
  }

  const matches = await verifyPin(pin, member.pinHash)
  if (!matches) {
    return { error: 'Incorrect PIN. Please try again.' }
  }

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
  const { code, error } = validateActivationCode(formData.get('activationCode'))
  if (error) return { error }

  const member = await db.member.findUnique({
    where: { activationCode: code },
    select: { id: true, deviceId: true },
  })

  // Prevent enumerating valid activation codes
  if (!member || member.deviceId) {
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
  const memberId = await getPendingActivation()
  if (!memberId) redirect('/auth?view=activate')

  const { pin, error } = validatePin(formData.get('pin'))
  if (error) return { error }

  const confirm = formData.get('confirmPin')
  if (confirm !== pin) return { error: 'The two PINs do not match.' }

  const deviceId = await getOrCreateDeviceId()
  const pinHash = await hashPin(pin)

  // Bind device, store pinHash, and clear activationCode in a single query
  const bound = await db.member.updateMany({
    where: { id: memberId, activationCode: { not: null }, deviceId: null },
    data: { pinHash, deviceId, activationCode: null },
  })

  if (bound.count !== 1) {
    await clearPendingActivation()
    return {
      error:
        'This activation code has already been used. Ask the front desk for a fresh code.',
    }
  }

  await createSession(memberId, deviceId)
  await clearPendingActivation()

  redirect('/member')
}
