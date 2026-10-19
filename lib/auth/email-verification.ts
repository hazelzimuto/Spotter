import { randomBytes } from 'node:crypto'

/**
 * EMAIL VERIFICATION CODE UTILITIES
 *
 * Generates cryptographically secure 6-digit numeric verification codes
 * using Node.js crypto.randomBytes with rejection sampling to eliminate modulo bias.
 */

// Verification codes remain valid for 24 hours
export const VERIFICATION_CODE_EXPIRY_MS = 24 * 60 * 60 * 1000

/**
 * Generates a 6-digit numeric verification code using randomBytes.
 * Guarantees a range of 100000 to 999999 without leading zero truncation.
 */
export function generateEmailVerificationCode(): string {
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
 * Checks if a candidate 6-digit code matches the stored code and has not expired.
 */
export function isVerificationCodeValid(
  storedCode: string | null | undefined,
  expiresAt: Date | string | null | undefined,
  candidateCode: string,
): { valid: boolean; reason?: 'MISSING' | 'EXPIRED' | 'MISMATCH' } {
  if (!storedCode || !expiresAt) {
    return { valid: false, reason: 'MISSING' }
  }

  const expiry = new Date(expiresAt).getTime()
  if (Date.now() > expiry) {
    return { valid: false, reason: 'EXPIRED' }
  }

  if (storedCode.trim() !== candidateCode.trim()) {
    return { valid: false, reason: 'MISMATCH' }
  }

  return { valid: true }
}
