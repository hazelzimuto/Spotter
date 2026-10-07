'use client'

/**
 * SignInModal — Landing page entry-point for members.
 *
 * Sign-up tab: routes the member to /activate where they enter the
 *   one-time activation code issued by staff (FR-6, step 1).
 *
 * Sign-in tab: stub PIN form that will wire to the server action once
 *   the member-auth sign-in flow is implemented.
 *
 * No database calls are made from this client component.
 */

import { useEffect, useRef, useState, useActionState } from 'react'
import Link from 'next/link'
import { submitSignIn, type AuthFormState } from '@/app/auth/actions'
import { CautionIcon } from './caution-icon'
import styles from '@/app/landing.module.css'

interface SignInModalProps {
  onClose: () => void
  initialTab?: 'signin' | 'signup'
}

export function SignInModal({ onClose, initialTab = 'signin' }: SignInModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) onClose()
  }

  return (
    <div
      ref={backdropRef}
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={activeTab === 'signin' ? 'Sign in to Spotter' : 'Create your Spotter account'}
    >
      <div className={styles.modalCard}>
        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalLogo} aria-hidden="true">
              <span className={styles.modalLogoLetter}>S</span>
            </div>
            <h2 className={styles.modalTitle}>
              {activeTab === 'signin' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className={styles.modalSubtext}>
              {activeTab === 'signin'
                ? 'Enter your member number and password to access your records.'
                : 'Collect your activation code from the front desk to link this device.'}
            </p>
          </div>
          <button
            id="modal-close-btn"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* ── Tab switcher ── */}
        <div className={styles.modalTabs} role="tablist" aria-label="Authentication options">
          <button
            id="tab-signin"
            role="tab"
            aria-selected={activeTab === 'signin'}
            aria-controls="panel-signin"
            className={`${styles.modalTab} ${activeTab === 'signin' ? styles.modalTabActive : ''}`}
            onClick={() => setActiveTab('signin')}
          >
            Sign in
          </button>
          <button
            id="tab-signup"
            role="tab"
            aria-selected={activeTab === 'signup'}
            aria-controls="panel-signup"
            className={`${styles.modalTab} ${activeTab === 'signup' ? styles.modalTabActive : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign up
          </button>
        </div>

        {/* ── Sign-in panel ── */}
        {activeTab === 'signin' && (
          <div id="panel-signin" role="tabpanel" aria-labelledby="tab-signin">
            <SignInForm />
          </div>
        )}

        {/* ── Sign-up panel ── */}
        {activeTab === 'signup' && (
          <div id="panel-signup" role="tabpanel" aria-labelledby="tab-signup">
            <SignUpPanel />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Sign-in form — Member number & Password
   ───────────────────────────────────────────────────────────── */
function SignInForm() {
  const [memberNumber, setMemberNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [memberNumberTouched, setMemberNumberTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [state, formAction] = useActionState<AuthFormState, FormData>(submitSignIn, {})

  function getMemberNumberError(value: string, touched: boolean): string | null {
    if (!touched) return null
    const trimmed = value.trim()
    if (trimmed === '') {
      return 'This field must not be empty'
    }
    if (trimmed.length < 6) {
      return 'Member number must be 6 numbers'
    }
    return null
  }

  function getPasswordError(value: string, touched: boolean): string | null {
    if (!touched) return null
    if (value.trim() === '') {
      return 'This field must not be empty'
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return null
  }

  const memberNumberError = getMemberNumberError(memberNumber, memberNumberTouched)
  const isMemberNumberValid = memberNumber.trim().length === 6
  const passwordError = getPasswordError(password, passwordTouched)
  const isPasswordValid = password.length >= 6

  const isFormComplete =
    isMemberNumberValid &&
    isPasswordValid &&
    !memberNumberError &&
    !passwordError

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isFormComplete) {
      e.preventDefault()
      setMemberNumberTouched(true)
      setPasswordTouched(true)
    }
  }

  return (
    <form
      id="sign-in-form"
      className={styles.modalForm}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
    >
      {state?.error && (
        <div
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-error-container)',
            color: 'var(--color-on-error-container)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--typography-font-size-13)',
            lineHeight: 1.4,
          }}
          role="alert"
        >
          {state.error}
        </div>
      )}

      <div className={styles.modalField}>
        <label htmlFor="modal-member-number" className={styles.modalLabel}>
          Member number
        </label>
        <input
          id="modal-member-number"
          name="memberNumber"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="e.g. 123456"
          value={memberNumber}
          onChange={(e) => {
            const numbersOnly = e.target.value.replace(/\D/g, '').slice(0, 6)
            setMemberNumber(numbersOnly)
            if (!memberNumberTouched) setMemberNumberTouched(true)
          }}
          onBlur={() => setMemberNumberTouched(true)}
          className={`${styles.modalInput} ${memberNumberError ? styles.modalInputError : ''}`}
          aria-describedby={memberNumberError ? 'modal-member-number-error' : undefined}
          aria-invalid={memberNumberError ? true : undefined}
          required
        />
        {memberNumberError && (
          <p id="modal-member-number-error" className={styles.modalFieldError} role="alert">
            <CautionIcon />
            <span>{memberNumberError}</span>
          </p>
        )}
      </div>

      <div className={styles.modalField}>
        <label htmlFor="modal-password" className={styles.modalLabel}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="modal-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            onBlur={() => setPasswordTouched(true)}
            className={`${styles.modalInput} ${styles.passwordInput} ${passwordError ? styles.modalInputError : ''}`}
            aria-describedby={passwordError ? 'modal-password-error' : undefined}
            aria-invalid={passwordError ? true : undefined}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {passwordError && (
          <p id="modal-password-error" className={styles.modalFieldError} role="alert">
            <CautionIcon />
            <span>{passwordError}</span>
          </p>
        )}
      </div>

      <button
        id="sign-in-submit"
        type="submit"
        disabled={!isFormComplete}
        className={styles.modalPrimaryBtn}
      >
        Sign in
      </button>

      <div className={styles.modalDivider}>or</div>

      <p className={styles.modalFootnote}>
        New member?{' '}
        <Link href="/auth?view=signup" className={styles.modalFootnoteLink} prefetch={false}>
          Create your account →
        </Link>
      </p>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────────
   Sign-up panel — routes to /auth?view=signup
   ───────────────────────────────────────────────────────────── */
function SignUpPanel() {
  return (
    <div className={styles.modalForm}>
      <p className={styles.modalFootnote} style={{ textAlign: 'left', fontSize: '0.9rem' }}>
        Create your Spotter account directly to track your workouts, attendance, and gym rules on this device.
      </p>

      <Link
        id="go-to-signup-btn"
        href="/auth?view=signup"
        className={styles.modalPrimaryBtn}
        style={{ textDecoration: 'none' }}
      >
        Create your account →
      </Link>

      <div className={styles.modalDivider}>already have an account?</div>

      <p className={styles.modalFootnote}>
        Use the{' '}
        <strong style={{ color: 'var(--color-on-surface)' }}>Sign in</strong>{' '}
        tab above to enter your PIN.
      </p>
    </div>
  )
}
