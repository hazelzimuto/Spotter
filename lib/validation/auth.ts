import { z } from 'zod'
export { isPasswordBreached, type BreachedPasswordCheckResult } from './pwned'

/**
 * SPOTTER ZOD VALIDATION SCHEMAS
 *
 * Grounded in .agent/rules/thresholds.md and PRD constraints:
 * - Member Number: exactly 6 digits
 * - PIN: exactly 4 digits
 * - Activation Code: 4-20 alphanumeric characters
 * - Password: minimum 6 characters
 * - Full Name: minimum 2 characters, at least 2 names
 * - Email: valid format, normalized to lowercase and trimmed
 */

export const CODE_PATTERN = /^[A-Za-z0-9]{4,20}$/
export const PIN_PATTERN = /^[0-9]{4}$/
export const MEMBER_NUMBER_PATTERN = /^\d{6}$/
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const VERIFICATION_CODE_PATTERN = /^\d{6}$/

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase.
 */
export function normaliseEmail(raw: FormDataEntryValue | string | null | undefined): string {
  if (typeof raw !== 'string') return ''
  return raw.trim().toLowerCase()
}

/**
 * Normalizes an activation code by trimming whitespace and converting to uppercase.
 */
export function normaliseCode(raw: FormDataEntryValue | string | null | undefined): string {
  if (typeof raw !== 'string') return ''
  return raw.trim().toUpperCase()
}

/**
 * Converts FormData entries into a plain JavaScript key-value object.
 */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  formData.forEach((value, key) => {
    if (result[key] === undefined) {
      result[key] = value
    }
  })
  return result
}

// Helper preprocessor for string form inputs (null/undefined -> '')
const formString = () => z.preprocess((val) => (val == null ? '' : String(val)), z.string())

/**
 * Schema 1: Member Sign Up
 */
export const signUpSchema = z.object({
  fullName: formString()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, 'This field must not be empty')
        .min(2, 'Full name must be at least 2 characters.')
        .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, {
          message: 'Please enter at least 2 names separated with a space.',
        }),
    ),
  email: formString()
    .transform((val) => val.trim().toLowerCase())
    .pipe(
      z
        .string()
        .min(1, 'This field must not be empty')
        .regex(EMAIL_PATTERN, 'Enter a valid email address'),
    ),
  memberNumber: formString()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, 'This field must not be empty')
        .regex(MEMBER_NUMBER_PATTERN, 'Member number must be exactly 6 numbers.'),
    ),
  password: formString()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, 'This field must not be empty')
        .min(6, 'Password must be at least 6 characters'),
    ),
  agreeTerms: z.preprocess(
    (val) => val === true || val === 'true' || val === 'on',
    z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms and Conditions to create an account.',
    }),
  ),
})

export type SignUpInput = z.infer<typeof signUpSchema>

/**
 * Schema 2: Member Sign In
 */
export const signInSchema = z.object({
  memberNumber: formString()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, 'This field must not be empty')
        .regex(MEMBER_NUMBER_PATTERN, 'Member number must be exactly 6 numbers.'),
    ),
  password: formString()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, 'This field must not be empty')
        .min(6, 'Password must be at least 6 characters'),
    ),
})

export type SignInInput = z.infer<typeof signInSchema>

/**
 * Schema 3: Activation Code Entry
 */
export const activationCodeSchema = z.object({
  activationCode: formString()
    .transform((val) => val.trim().toUpperCase())
    .pipe(
      z
        .string()
        .min(1, 'Enter the code from the front desk.')
        .regex(CODE_PATTERN, 'That code does not look right. Check it and try again.'),
    ),
})

export type ActivationCodeInput = z.infer<typeof activationCodeSchema>

/**
 * Schema 4: PIN Setup & Confirmation
 */
export const pinSetupSchema = z
  .object({
    pin: formString()
      .transform((val) => val.trim())
      .pipe(
        z
          .string()
          .min(1, 'Choose a 4-digit PIN.')
          .regex(PIN_PATTERN, 'Your PIN must be exactly 4 digits.'),
      ),
    confirmPin: formString()
      .transform((val) => val.trim())
      .pipe(z.string().min(1, 'This field must not be empty')),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'The two PINs do not match.',
    path: ['confirmPin'],
  })

export type PinSetupInput = z.infer<typeof pinSetupSchema>

/**
 * Schema 5: 6-Digit Email Verification Code
 */
export const verifyEmailCodeSchema = z.object({
  code: formString()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, 'Please enter your 6-digit verification code.')
        .regex(VERIFICATION_CODE_PATTERN, 'Verification code must be exactly 6 numbers.'),
    ),
})

export type VerifyEmailCodeInput = z.infer<typeof verifyEmailCodeSchema>

/**
 * Generic validator helper for Zod schemas operating on FormData or plain objects.
 */
export function validateWithZod<T extends z.ZodTypeAny>(
  schema: T,
  input: FormData | Record<string, unknown>,
):
  | { success: true; data: z.output<T> }
  | { success: false; error: string; fieldErrors: Record<string, string> } {
  const rawData = input instanceof FormData ? formDataToObject(input) : input
  const parsed = schema.safeParse(rawData)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString() || 'form'
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid form input.',
      fieldErrors,
    }
  }

  return {
    success: true,
    data: parsed.data,
  }
}
