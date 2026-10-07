'use server'

/**
 * Re-exports actions from unified /app/auth/actions for backwards compatibility.
 */
export {
  submitActivationCode,
  submitPin,
  type AuthFormState as ActivationCodeState,
} from '@/app/auth/actions'
