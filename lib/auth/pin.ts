import bcrypt from 'bcryptjs'

/**
 * PIN hashing for FR-6.
 *
 * SECURITY NOTE: a 4-digit PIN has only 10,000 possible values. bcrypt does
 * not protect against an offline attacker who obtains `Member.pinHash` — they
 * can test all 10,000 candidates far faster than any cost factor allows. The
 * real controls are device binding and rate limiting; this hashing exists
 * because .agent/skills/member-device-auth requires it, and it does still
 * prevent a casual database read from revealing the PIN in plain text.
 *
 * Keep this in sync with any future lockout scheme.
 */
const BCRYPT_ROUNDS = 10

export function hashPin(pin: string) {
  return bcrypt.hash(pin, BCRYPT_ROUNDS)
}

export function verifyPin(pin: string, pinHash: string) {
  return bcrypt.compare(pin, pinHash)
}
