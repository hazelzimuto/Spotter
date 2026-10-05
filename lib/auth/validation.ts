/**
 * Shared input rules for the FR-6 auth screens.
 *
 * Code format is not specified anywhere in the PRD, so it is deliberately
 * permissive: any 4-20 character alphanumeric code is accepted. Tighten this
 * once staff settle on a format.
 */

export type FieldErrors = {
  activationCode?: string
  pin?: string
  confirmPin?: string
}

const CODE_PATTERN = /^[A-Za-z0-9]{4,20}$/

// .agent/rules/thresholds.md rule 4: the auth PIN is exactly 4 digits.
const PIN_PATTERN = /^[0-9]{4}$/

export function normaliseCode(raw: FormDataEntryValue | null) {
  return typeof raw === 'string' ? raw.trim().toUpperCase() : ''
}

export function validateActivationCode(raw: FormDataEntryValue | null) {
  const code = normaliseCode(raw)
  if (!code) return { code, error: 'Enter the code from the front desk.' }
  if (!CODE_PATTERN.test(code)) {
    return { code, error: 'That code does not look right. Check it and try again.' }
  }
  return { code, error: null }
}

export function validatePin(raw: FormDataEntryValue | null) {
  const pin = typeof raw === 'string' ? raw.trim() : ''
  if (!pin) return { pin, error: 'Choose a 4-digit PIN.' }
  if (!PIN_PATTERN.test(pin)) return { pin, error: 'Your PIN must be exactly 4 digits.' }
  return { pin, error: null }
}
