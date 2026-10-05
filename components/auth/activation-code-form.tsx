'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitActivationCode, type ActivationCodeState } from '@/app/activate/actions'
import styles from './auth.module.css'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className={styles.primaryButton} disabled={pending}>
      {pending ? 'Checking…' : 'Continue'}
    </button>
  )
}

export function ActivationCodeForm() {
  const [state, formAction] = useActionState<ActivationCodeState, FormData>(
    submitActivationCode,
    {},
  )

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="activationCode">
          Activation code
        </label>
        <input
          id="activationCode"
          name="activationCode"
          className={styles.input}
          type="text"
          inputMode="text"
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? undefined : 'activationCode-help'}
        />
        <p id="activationCode-help" className={styles.helper}>
          The desk generates this code for you. Each code works once.
        </p>
      </div>

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  )
}
