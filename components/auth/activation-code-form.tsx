'use client'

import { useState, useActionState } from 'react'
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
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [state, formAction] = useActionState<ActivationCodeState, FormData>(
    submitActivationCode,
    {},
  )

  const isCodeEmpty = touched && code.trim() === ''

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (code.trim() === '') {
      e.preventDefault()
      setTouched(true)
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className={styles.form} noValidate>
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
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (!touched) setTouched(true)
          }}
          onBlur={() => setTouched(true)}
          required
          aria-invalid={isCodeEmpty ? true : state.error ? true : undefined}
          aria-describedby={isCodeEmpty ? 'activationCode-error' : 'activationCode-help'}
        />
        {isCodeEmpty ? (
          <p id="activationCode-error" className={styles.fieldError} role="alert">
            This field must not be empty
          </p>
        ) : (
          <p id="activationCode-help" className={styles.helper}>
            The desk generates this code for you. Each code works once.
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  )
}
