'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitPin, type ActivationCodeState } from '@/app/activate/actions'
import { CautionIcon } from './caution-icon'
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
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinTouched, setPinTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [state, formAction] = useActionState<ActivationCodeState, FormData>(
    submitPin,
    {},
  )

  const isPinEmpty = pinTouched && pin.trim() === ''
  const isConfirmEmpty = confirmTouched && confirmPin.trim() === ''

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (pin.trim() === '' || confirmPin.trim() === '') {
      e.preventDefault()
      if (pin.trim() === '') setPinTouched(true)
      if (confirmPin.trim() === '') setConfirmTouched(true)
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
        <label className={styles.label} htmlFor="pin">
          Choose a PIN
        </label>
        <input
          id="pin"
          name="pin"
          className={`${styles.input} ${styles.pinInput} ${isPinEmpty ? styles.inputError : ''}`}
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={4}
          pattern="[0-9]{4}"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
            if (!pinTouched) setPinTouched(true)
          }}
          onBlur={() => setPinTouched(true)}
          required
          aria-invalid={isPinEmpty ? true : state.error ? true : undefined}
          aria-describedby={isPinEmpty ? 'pin-error' : 'pin-help'}
        />
        {isPinEmpty ? (
          <p id="pin-error" className={styles.fieldError} role="alert">
            <CautionIcon />
            <span>This field must not be empty</span>
          </p>
        ) : (
          <p id="pin-help" className={styles.helper}>
            Exactly 4 digits.
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmPin">
          Confirm PIN
        </label>
        <input
          id="confirmPin"
          name="confirmPin"
          className={`${styles.input} ${styles.pinInput} ${isConfirmEmpty ? styles.inputError : ''}`}
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={4}
          pattern="[0-9]{4}"
          value={confirmPin}
          onChange={(e) => {
            setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))
            if (!confirmTouched) setConfirmTouched(true)
          }}
          onBlur={() => setConfirmTouched(true)}
          required
          aria-invalid={isConfirmEmpty ? true : undefined}
          aria-describedby={isConfirmEmpty ? 'confirmPin-error' : undefined}
        />
        {isConfirmEmpty && (
          <p id="confirmPin-error" className={styles.fieldError} role="alert">
            <CautionIcon />
            <span>This field must not be empty</span>
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  )
}
