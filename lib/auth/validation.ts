/**
 * Shared input rules and Zod validation for Spotter auth forms.
 */
import {
  CODE_PATTERN,
  PIN_PATTERN,
  MEMBER_NUMBER_PATTERN,
  EMAIL_PATTERN,
  normaliseCode,
  normaliseEmail,
  formDataToObject,
  signUpSchema,
  signInSchema,
  activationCodeSchema,
  pinSetupSchema,
  validateWithZod,
  type SignUpInput,
  type SignInInput,
  type ActivationCodeInput,
  type PinSetupInput,
} from '@/lib/validation/auth'

export {
  CODE_PATTERN,
  PIN_PATTERN,
  MEMBER_NUMBER_PATTERN,
  EMAIL_PATTERN,
  normaliseCode,
  normaliseEmail,
  formDataToObject,
  signUpSchema,
  signInSchema,
  activationCodeSchema,
  pinSetupSchema,
  validateWithZod,
  type SignUpInput,
  type SignInInput,
  type ActivationCodeInput,
  type PinSetupInput,
}

export type FieldErrors = {
  activationCode?: string
  pin?: string
  confirmPin?: string
}

export function validateEmail(raw: FormDataEntryValue | string | null | undefined) {
  const email = normaliseEmail(raw)
  if (!email) return { email, error: 'This field must not be empty' }
  const isEmailValid = EMAIL_PATTERN.test(email)
  if (!isEmailValid) {
    return { email, error: 'Enter a valid email address' }
  }
  return { email, error: null }
}

export function validateActivationCode(raw: FormDataEntryValue | null) {
  const result = validateWithZod(activationCodeSchema, { activationCode: raw })
  if (!result.success) {
    return { code: normaliseCode(raw), error: result.error }
  }
  return { code: result.data.activationCode, error: null }
}

export function validatePin(raw: FormDataEntryValue | null) {
  const pin = typeof raw === 'string' ? raw.trim() : ''
  if (!pin) return { pin, error: 'Choose a 4-digit PIN.' }
  if (!PIN_PATTERN.test(pin)) return { pin, error: 'Your PIN must be exactly 4 digits.' }
  return { pin, error: null }
}
