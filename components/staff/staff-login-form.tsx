'use client'

import { useActionState, useState, useTransition } from 'react'
import { staffLoginAction, seedReceptionistAction, StaffLoginState } from '@/app/staff/actions'
import styles from './staff.module.css'

const initialState: StaffLoginState = {}

export function StaffLoginForm() {
  const [state, formAction, isPending] = useActionState(staffLoginAction, initialState)
  const [seedStatus, setSeedStatus] = useState<string | null>(null)
  const [isSeeding, startSeedTransition] = useTransition()

  const handleSeed = () => {
    startSeedTransition(async () => {
      try {
        const res = await seedReceptionistAction()
        setSeedStatus(`Ready: ${res.email} (PIN: ${res.pin})`)
      } catch (e) {
        setSeedStatus('Failed to seed default receptionist.')
      }
    })
  }

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        {/* Brand Row */}
        <div className={styles.brandRow}>
          <div className={styles.brandLogo}>S</div>
          <div className={styles.brandText}>
            <h1 className={styles.brandTitle}>Spotter Front Desk</h1>
            <p className={styles.brandSubtitle}>Receptionist & Staff Operations Portal</p>
          </div>
        </div>

        {/* Header */}
        <div className={styles.loginHeader}>
          <h2 className={styles.loginTitle}>Staff Sign In</h2>
          <p className={styles.loginSubtitle}>
            Enter your authorized gym staff email and PIN to access the member desk.
          </p>
        </div>

        {/* Security Notice */}
        <div className={styles.securityNotice}>
          <svg
            className={styles.securityNoticeIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <div>
            <strong>Authorized Personnel Only.</strong> All desk actions, member creations, and session lifetimes are monitored and cryptographically audited.
          </div>
        </div>

        {/* Alert Error */}
        {state.error && (
          <div className={`${styles.alertBox} ${styles.alertError}`} role="alert">
            {state.error}
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Staff Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="e.g. desk@spottergym.com"
              className={`${styles.input} ${state.fieldErrors?.email ? styles.inputError : ''}`}
            />
            {state.fieldErrors?.email && (
              <p className={styles.errorText}>{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="pin" className={styles.label}>
              Desk Access PIN
            </label>
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              required
              placeholder="Enter numeric PIN"
              className={`${styles.input} ${state.fieldErrors?.pin ? styles.inputError : ''}`}
            />
            {state.fieldErrors?.pin && (
              <p className={styles.errorText}>{state.fieldErrors.pin[0]}</p>
            )}
          </div>

          <button type="submit" disabled={isPending} className={styles.submitBtn}>
            {isPending ? 'Verifying Credentials...' : 'Sign In to Front Desk'}
          </button>
        </form>

        {/* Dev / Setup Helper Card */}
        <div className={styles.devSeedCard}>
          <p className={styles.devSeedTitle}>Initial Setup & Testing Credentials</p>
          <p className={styles.devSeedDetails}>
            Default Account: <code>desk@spottergym.com</code> | PIN: <code>1234</code>
          </p>
          {seedStatus && (
            <p className={styles.devSeedDetails} style={{ color: 'var(--color-primary)' }}>
              {seedStatus}
            </p>
          )}
          <button
            type="button"
            onClick={handleSeed}
            disabled={isSeeding}
            className={styles.devSeedBtn}
          >
            {isSeeding ? 'Verifying Account...' : 'Ensure Default Receptionist Exists'}
          </button>
        </div>
      </div>
    </div>
  )
}
