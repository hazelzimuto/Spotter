'use client'

/**
 * UnifiedAuthCard — Collapses member authentication forms into conditional views.
 *
 * Views:
 * - 'signin': PIN entry for already linked devices.
 * - 'signup': Self-serve member registration (Full Name, Phone, 4-digit PIN).
 * - 'activate': 1-time activation code entry from the front desk (Step 1).
 * - 'pin': 4-digit PIN configuration and confirmation (Step 2).
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  submitSignIn,
  submitSignUp,
  submitActivationCode,
  submitPin,
  type AuthFormState,
} from '@/app/auth/actions'
import { CautionIcon } from './caution-icon'
import styles from './auth.module.css'

export type AuthView = 'signin' | 'signup' | 'activate' | 'pin'

interface UnifiedAuthCardProps {
  initialView?: AuthView
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={styles.primaryButton} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  )
}

export function UnifiedAuthCard({ initialView = 'signin' }: UnifiedAuthCardProps) {
  const [view, setView] = useState<AuthView>(initialView)

  // Sync state with URL search params if changed via browser back/forward
  useEffect(() => {
    function handlePopState() {
      if (typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      const v = params.get('view')
      if (v === 'activate' || v === 'signin' || v === 'signup' || v === 'pin') {
        setView(v)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function switchView(nextView: AuthView) {
    setView(nextView)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', nextView)
      window.history.pushState(null, '', url.toString())
    }
  }

  return (
    <div className={styles.card}>
      {/* ── Top Navigation & Back Link ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className={styles.backButton} aria-label="Return to Spotter home">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <div className={styles.logo} aria-hidden="true">
          <span className={styles.logoLetter}>S</span>
        </div>
      </div>

      {/* ── Tab Switcher for Primary Auth Paths (Sign In vs Sign Up) ── */}
      {view !== 'pin' && view !== 'activate' && (
        <div
          className={styles.tabsContainer}
          role="tablist"
          aria-label="Member authentication options"
        >
          <button
            type="button"
            id="tab-signin-btn"
            role="tab"
            aria-selected={view === 'signin'}
            aria-controls="auth-panel-signin"
            className={`${styles.tab} ${view === 'signin' ? styles.tabActive : ''}`}
            onClick={() => switchView('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            id="tab-signup-btn"
            role="tab"
            aria-selected={view === 'signup'}
            aria-controls="auth-panel-signup"
            className={`${styles.tab} ${view === 'signup' ? styles.tabActive : ''}`}
            onClick={() => switchView('signup')}
          >
            Sign up
          </button>
        </div>
      )}

      {/* ── Conditional Views ── */}
      {view === 'signin' && (
        <div id="auth-panel-signin" role="tabpanel" aria-labelledby="tab-signin-btn">
          <SignInView
            onSwitchToSignUp={() => switchView('signup')}
            onSwitchToActivate={() => switchView('activate')}
          />
        </div>
      )}

      {view === 'signup' && (
        <div id="auth-panel-signup" role="tabpanel" aria-labelledby="tab-signup-btn">
          <SignUpView
            onSwitchToSignIn={() => switchView('signin')}
            onSwitchToActivate={() => switchView('activate')}
          />
        </div>
      )}

      {view === 'activate' && (
        <div id="auth-panel-activate" role="region" aria-label="Activate device with code">
          <ActivationCodeView
            onSwitchToSignIn={() => switchView('signin')}
            onSwitchToSignUp={() => switchView('signup')}
          />
        </div>
      )}

      {view === 'pin' && (
        <div id="auth-panel-pin" role="region" aria-label="Choose your member PIN">
          <PinSetupView onBackToActivate={() => switchView('activate')} />
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   VIEW 1: Sign-In with 4-digit PIN
   ───────────────────────────────────────────────────────────── */
function SignInView({
  onSwitchToSignUp,
  onSwitchToActivate,
}: {
  onSwitchToSignUp: () => void
  onSwitchToActivate: () => void
}) {
  const [pin, setPin] = useState('')
  const [touched, setTouched] = useState(false)
  const [state, formAction] = useActionState<AuthFormState, FormData>(submitSignIn, {})

  const isPinEmpty = touched && pin.trim() === ''

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (pin.trim() === '') {
      e.preventDefault()
      setTouched(true)
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subtext}>
          Enter your 4-digit PIN for this device to access your member records.
        </p>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className={styles.form} noValidate>
        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signin-pin">
            4-digit PIN
          </label>
          <input
            id="signin-pin"
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
              if (!touched) setTouched(true)
            }}
            onBlur={() => setTouched(true)}
            required
            className={`${styles.input} ${styles.pinInput} ${isPinEmpty ? styles.inputError : ''}`}
            aria-invalid={isPinEmpty ? true : state?.error ? true : undefined}
            aria-describedby={isPinEmpty ? 'signin-pin-error' : 'signin-pin-hint'}
          />
          {isPinEmpty ? (
            <p id="signin-pin-error" className={styles.fieldError} role="alert">
              <CautionIcon />
              <span>This field must not be empty</span>
            </p>
          ) : (
            <p id="signin-pin-hint" className={styles.helper}>
              Configured during your first device setup.
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <SubmitButton label="Sign in" pendingLabel="Verifying…" />
        </div>

        <div className={styles.switchPrompt}>
          <span>New member?</span>
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToSignUp}
            aria-label="Switch to Sign up view"
          >
            Create your account →
          </button>
        </div>

        <div className={styles.switchPrompt} style={{ marginTop: 0 }}>
          <span>Have an activation code?</span>
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToActivate}
            aria-label="Switch to Activation code view"
          >
            Enter code from desk →
          </button>
        </div>
      </form>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   VIEW 2: Self-Serve Sign-Up (Full Name, Phone, 4-digit PIN)
   ───────────────────────────────────────────────────────────── */
function SignUpView({
  onSwitchToSignIn,
  onSwitchToActivate,
}: {
  onSwitchToSignIn: () => void
  onSwitchToActivate: () => void
}) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [memberNumber, setMemberNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordBlurred, setPasswordBlurred] = useState(false)

  const [nameTouched, setNameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [memberNumberTouched, setMemberNumberTouched] = useState(false)

  const [state, formAction] = useActionState<AuthFormState, FormData>(submitSignUp, {})

  function getFullNameError(name: string, touched: boolean): string | null {
    if (!touched) return null
    const trimmed = name.trim()
    if (trimmed === '') {
      return 'This field must not be empty'
    }
    if (trimmed.length < 2) {
      return 'Full name must be at least 2 characters'
    }
    const words = trimmed.split(/\s+/).filter(Boolean)
    if (words.length < 2) {
      return 'Please enter at least 2 names separated with a space'
    }
    return null
  }

  function getEmailError(value: string, touched: boolean): string | null {
    const trimmed = value.trim()
    // Real-time format validation triggers the moment typing begins
    if (trimmed.length > 0) {
      const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)
      if (!isValidFormat) {
        return 'Enter a valid email address'
      }
      return null
    }
    // If touched and left empty
    if (touched && trimmed === '') {
      return 'This field must not be empty'
    }
    return null
  }

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

  function getPasswordError(value: string, blurred: boolean): string | null {
    if (!blurred) return null
    if (value.trim() === '') {
      return 'This field must not be empty'
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return null
  }

  const nameError = getFullNameError(fullName, nameTouched)
  const isNameValid = getFullNameError(fullName, true) === null
  const emailError = getEmailError(email, emailTouched)
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
  const memberNumberError = getMemberNumberError(memberNumber, memberNumberTouched)
  const isMemberNumberValid = memberNumber.trim().length === 6
  const passwordError = getPasswordError(password, passwordBlurred)
  const isPasswordValid = password.length >= 6
  const showPasswordHint = password.length > 0 && !passwordError

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      !isNameValid ||
      !isEmailValid ||
      !isMemberNumberValid ||
      !isPasswordValid
    ) {
      e.preventDefault()
      setNameTouched(true)
      setEmailTouched(true)
      setMemberNumberTouched(true)
      setPasswordBlurred(true)
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.subtext}>
          Join Spotter to access your gym visits, balance, and timetable on this phone.
        </p>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className={styles.form} noValidate>
        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-name">
            Full name
          </label>
          <input
            id="signup-name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Alex Johnson"
            minLength={2}
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              if (!nameTouched) setNameTouched(true)
            }}
            onBlur={() => setNameTouched(true)}
            required
            className={`${styles.input} ${nameError ? styles.inputError : ''}`}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'signup-name-error' : 'signup-name-help'}
          />
          {nameError ? (
            <p id="signup-name-error" className={styles.fieldError} role="alert">
              <CautionIcon />
              <span>{nameError}</span>
            </p>
          ) : (
            <p id="signup-name-help" className={styles.helper}>
              At least 2 names separated with a space.
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-email">
            Email address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="e.g. alex@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (!emailTouched) setEmailTouched(true)
            }}
            onBlur={() => setEmailTouched(true)}
            required
            className={`${styles.input} ${emailError ? styles.inputError : ''}`}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? 'signup-email-error' : undefined}
          />
          {emailError && (
            <p id="signup-email-error" className={styles.fieldError} role="alert">
              <CautionIcon />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-member-number">
            Member number
          </label>
          <input
            id="signup-member-number"
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
            required
            className={`${styles.input} ${memberNumberError ? styles.inputError : ''}`}
            aria-invalid={memberNumberError ? true : undefined}
            aria-describedby={
              memberNumberError
                ? 'signup-member-number-error'
                : 'signup-member-number-help'
            }
          />
          {memberNumberError ? (
            <p id="signup-member-number-error" className={styles.fieldError} role="alert">
              <CautionIcon />
              <span>{memberNumberError}</span>
            </p>
          ) : (
            <p id="signup-member-number-help" className={styles.helper}>
              6-digit member number from the gym.
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-password">
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              onBlur={() => setPasswordBlurred(true)}
              required
              className={`${styles.input} ${styles.passwordInput} ${passwordError ? styles.inputError : ''}`}
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={
                passwordError
                  ? 'signup-password-error'
                  : showPasswordHint
                  ? 'signup-password-help'
                  : undefined
              }
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
          {passwordError ? (
            <p id="signup-password-error" className={styles.fieldError} role="alert">
              <CautionIcon />
              <span>{passwordError}</span>
            </p>
          ) : showPasswordHint ? (
            <p id="signup-password-help" className={styles.helper}>
              Must be at least 6 characters.
            </p>
          ) : null}
        </div>

        <div className={styles.actions}>
          <SubmitButton label="Create account & enter" pendingLabel="Creating account…" />
        </div>

        <div className={styles.switchPrompt}>
          <span>Already have an account?</span>
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToSignIn}
            aria-label="Switch to Sign in view"
          >
            Sign in with PIN →
          </button>
        </div>

        <div className={styles.switchPrompt} style={{ marginTop: 0 }}>
          <span>Have an activation code?</span>
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToActivate}
            aria-label="Switch to Activation code view"
          >
            Enter code from desk →
          </button>
        </div>
      </form>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   VIEW 3: Activation Code Entry (Optional Staff Flow)
   ───────────────────────────────────────────────────────────── */
function ActivationCodeView({
  onSwitchToSignIn,
  onSwitchToSignUp,
}: {
  onSwitchToSignIn: () => void
  onSwitchToSignUp: () => void
}) {
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [state, formAction] = useActionState<AuthFormState, FormData>(submitActivationCode, {})

  const isCodeEmpty = touched && code.trim() === ''

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (code.trim() === '') {
      e.preventDefault()
      setTouched(true)
    }
  }

  return (
    <>
      <div className={styles.header}>
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className={styles.backButton}
          aria-label="Back to sign up"
          style={{ marginBottom: 'var(--spacing-2)' }}
        >
          <span aria-hidden="true">←</span> Back to sign up
        </button>
        <h1 className={styles.heading}>Link with code</h1>
        <p className={styles.subtext}>
          Enter the activation code from the front desk to connect this phone to your membership.
        </p>
        <span className={styles.badge}>One member, one device</span>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className={styles.form} noValidate>
        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="activation-code">
            Activation code
          </label>
          <input
            id="activation-code"
            name="activationCode"
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
            className={`${styles.input} ${isCodeEmpty ? styles.inputError : ''}`}
            aria-invalid={isCodeEmpty ? true : state?.error ? true : undefined}
            aria-describedby={isCodeEmpty ? 'activation-code-error' : 'activation-code-help'}
          />
          {isCodeEmpty ? (
            <p id="activation-code-error" className={styles.fieldError} role="alert">
              <CautionIcon />
              <span>This field must not be empty</span>
            </p>
          ) : (
            <p id="activation-code-help" className={styles.helper}>
              The desk generates this code for you. Each code works once.
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <SubmitButton label="Continue to PIN setup →" pendingLabel="Validating code…" />
        </div>

        <div className={styles.switchPrompt}>
          <span>Already linked this phone?</span>
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToSignIn}
            aria-label="Switch to Sign in view"
          >
            Sign in with PIN →
          </button>
        </div>
      </form>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   VIEW 4: Set PIN & Confirm PIN (After Code Activation)
   ───────────────────────────────────────────────────────────── */
function PinSetupView({ onBackToActivate }: { onBackToActivate: () => void }) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinTouched, setPinTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [state, formAction] = useActionState<AuthFormState, FormData>(submitPin, {})

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
    <>
      <div className={styles.header}>
        <button
          type="button"
          onClick={onBackToActivate}
          className={styles.backButton}
          aria-label="Back to activation code entry"
          style={{ marginBottom: 'var(--spacing-2)' }}
        >
          <span aria-hidden="true">←</span> Re-enter activation code
        </button>
        <h1 className={styles.heading}>Choose your PIN</h1>
        <p className={styles.subtext}>
          Pick a 4-digit PIN for this device. Staff can unlink it if you ever need to switch phones.
        </p>
        <span className={styles.badge}>Step 2 of 2: Device binding</span>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className={styles.form} noValidate>
        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="setup-pin">
            Choose a 4-digit PIN
          </label>
          <input
            id="setup-pin"
            name="pin"
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
            className={`${styles.input} ${styles.pinInput} ${isPinEmpty ? styles.inputError : ''}`}
            aria-invalid={isPinEmpty ? true : state?.error ? true : undefined}
            aria-describedby={isPinEmpty ? 'setup-pin-error' : 'setup-pin-help'}
          />
          {isPinEmpty ? (
            <p id="setup-pin-error" className={styles.fieldError} role="alert">
              <CautionIcon />
              <span>This field must not be empty</span>
            </p>
          ) : (
            <p id="setup-pin-help" className={styles.helper}>
              Exactly 4 numeric digits.
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirm-pin">
            Confirm PIN
          </label>
          <input
            id="confirm-pin"
            name="confirmPin"
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
            className={`${styles.input} ${styles.pinInput} ${isConfirmEmpty ? styles.inputError : ''}`}
            aria-invalid={isConfirmEmpty ? true : undefined}
            aria-describedby={isConfirmEmpty ? 'confirm-pin-error' : undefined}
          />
          {isConfirmEmpty && (
            <p id="confirm-pin-error" className={styles.fieldError} role="alert">
              <CautionIcon />
              <span>This field must not be empty</span>
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <SubmitButton label="Finish setup & enter" pendingLabel="Binding device…" />
        </div>
      </form>
    </>
  )
}
