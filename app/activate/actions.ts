'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { hashPin } from '@/lib/auth/pin'
import { createSession, getOrCreateDeviceId } from '@/lib/auth/session'
import {
  clearPendingActivation,
  getPendingActivation,
  setPendingActivation,
} from '@/lib/auth/pending-activation'
import { validateActivationCode, validatePin } from '@/lib/auth/validation'

/**
 * FR-6, steps 1-3: the member types the one-time code from the front desk.
 */
export type ActivationCodeState = {
  error?: string
}

export async function submitActivationCode(
  _prev: ActivationCodeState,
  formData: FormData,
): Promise<ActivationCodeState> {
  const { code, error } = validateActivationCode(formData.get('activationCode'))
  if (error) return { error }

  const member = await db.member.findUnique({
    where: { activationCode: code },
    select: { id: true, deviceId: true },
  })

  // One message for "no such code" and "already linked to a device" so the
  // form cannot be used to enumerate valid activation codes.
  if (!member || member.deviceId) {
    return {
      error:
        'That code is not valid. Ask the front desk for a fresh code, or have them unlink your old device.',
    }
  }

  await setPendingActivation(member.id)
  redirect('/activate/pin')
}

/**
 * FR-6, steps 4-5: set the 4-digit PIN and bind this device.
 *
 * The member row is updated conditionally on `activationCode` still matching,
 * so two devices racing on the same code cannot both succeed.
 */
export async function submitPin(
  _prev: ActivationCodeState,
  formData: FormData,
): Promise<ActivationCodeState> {
  const memberId = await getPendingActivation()
  if (!memberId) redirect('/activate')

  const { pin, error } = validatePin(formData.get('pin'))
  if (error) return { error }

  const confirm = formData.get('confirmPin')
  if (confirm !== pin) return { error: 'The two PINs do not match.' }

  const deviceId = await getOrCreateDeviceId()
  const pinHash = await hashPin(pin)

  // Steps 4-5 of .agent/skills/member-device-auth: hash the PIN, bind the
  // device, and null the activation code so it cannot be reused.
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

  // The member home does not exist yet; land on the activation entry point.
  redirect('/')
}
