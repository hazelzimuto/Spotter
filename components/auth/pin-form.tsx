'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitPin, type ActivationCodeState } from '@/app/activate/actions'
import styles from './auth.module.css'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className={styles.primaryButton} disabled={pending}>
      {pending ? 'Saving…' : 'Finish setup'}
    </button>
  )
}

export function PinForm() {
  const [state, formAction] = useActionState<ActivationCodeState, FormData>(
    submitPin,
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
        <label className={styles.label} htmlFor="pin">
          Choose a PIN
        </label>
        <input
          id="pin"
          name="pin"
          className={`${styles.input} ${styles.pinInput}`}
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={4}
          pattern="[0-9]{4}"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? undefined : 'pin-help'}
        />
        <p id="pin-help" className={styles.helper}>
          Exactly 4 digits.
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmPin">
          Confirm PIN
        </label>
        <input
          id="confirmPin"
          name="confirmPin"
          className={`${styles.input} ${styles.pinInput}`}
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={4}
          pattern="[0-9]{4}"
          required
        />
      </div>

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  )
}
