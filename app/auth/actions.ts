'use server'

import { redirect } from 'next/navigation'
import { db, hasDatabaseUrl } from '@/lib/db'
import {
  saveDevMember,
  findDevMemberByDeviceId,
  findDevMemberByActivationCode,
  updateDevMemberPin,
} from '@/lib/auth/dev-store'
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

  const email = formData.get('email')?.toString()?.trim() || ''
  if (!email) {
    return { error: 'This field must not be empty' }
  }
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  if (!isEmailValid) {
    return { error: 'Enter a valid email address' }
  }

  const memberNumber = formData.get('memberNumber')?.toString()?.trim() || ''
  if (!memberNumber) {
    return { error: 'This field must not be empty' }
  }
  if (!/^\d{6}$/.test(memberNumber)) {
    return { error: 'Member number must be exactly 6 numbers.' }
  }

  const password = formData.get('password')?.toString() || ''
  if (!password) {
    return { error: 'This field must not be empty' }
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const agreeTerms = formData.get('agreeTerms')
  if (!agreeTerms || agreeTerms === 'false') {
    return { error: 'You must agree to the Terms and Conditions to create an account.' }
  }

  const deviceId = await getOrCreateDeviceId()
  const passwordHash = await hashPin(password)

  // Initial 30-day membership access window
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)

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
        },
      })
      memberId = member.id
    } catch (err) {
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
    })
    memberId = member.id
  }

  await createSession(memberId, deviceId)
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

  if (hasDatabaseUrl) {
    try {
      const member = await db.member.findFirst({
        where: { deviceId },
        select: { id: true, pinHash: true, deviceId: true },
      })

      if (member?.pinHash) {
        const matches = await verifyPin(pin, member.pinHash)
        if (!matches) {
          return { error: 'Incorrect PIN. Please try again.' }
        }

        await createSession(member.id, deviceId)
        redirect('/member')
      }
    } catch (err) {
      console.warn('Database sign-in check failed, falling back to dev store:', err)
    }
  }

  const member = findDevMemberByDeviceId(deviceId)
  if (!member || !member.pinHash) {
    return {
      error:
        'This device has not been linked to a membership yet. Please create an account to get started.',
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
  const memberId = await getPendingActivation()
  if (!memberId) redirect('/auth?view=activate')

  const { pin, error } = validatePin(formData.get('pin'))
  if (error) return { error }

  const confirm = formData.get('confirmPin')
  if (confirm !== pin) return { error: 'The two PINs do not match.' }

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
