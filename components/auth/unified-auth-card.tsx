'use client'

/**
 * UnifiedAuthCard — Collapses member authentication forms into conditional views.
 *
 * Views:
 * - 'signin': PIN entry for already linked devices.
 * - 'activate': 1-time activation code entry from the front desk (Step 1).
 * - 'pin': 4-digit PIN configuration and confirmation (Step 2).
 */

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  submitSignIn,
  submitActivationCode,
  submitPin,
  type AuthFormState,
} from '@/app/auth/actions'
import styles from './auth.module.css'

export type AuthView = 'signin' | 'activate' | 'pin'

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
      if (v === 'activate' || v === 'signin' || v === 'pin') {
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

      {/* ── Tab Switcher for Primary Auth Paths (Sign In vs Activate) ── */}
      {view !== 'pin' && (
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
            id="tab-activate-btn"
            role="tab"
            aria-selected={view === 'activate'}
            aria-controls="auth-panel-activate"
            className={`${styles.tab} ${view === 'activate' ? styles.tabActive : ''}`}
            onClick={() => switchView('activate')}
          >
            Link device
          </button>
        </div>
      )}

      {/* ── Conditional Views ── */}
      {view === 'signin' && (
        <div id="auth-panel-signin" role="tabpanel" aria-labelledby="tab-signin-btn">
          <SignInView onSwitchToActivate={() => switchView('activate')} />
        </div>
      )}

      {view === 'activate' && (
        <div id="auth-panel-activate" role="tabpanel" aria-labelledby="tab-activate-btn">
          <ActivationCodeView onSwitchToSignIn={() => switchView('signin')} />
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
function SignInView({ onSwitchToActivate }: { onSwitchToActivate: () => void }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(submitSignIn, {})

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subtext}>
          Enter your 4-digit PIN for this device to access your member records.
        </p>
      </div>

      <form action={formAction} className={styles.form} noValidate>
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
            required
            className={`${styles.input} ${styles.pinInput}`}
            aria-invalid={state?.error ? true : undefined}
            aria-describedby="signin-pin-hint"
          />
          <p id="signin-pin-hint" className={styles.helper}>
            Configured during your first device setup.
          </p>
        </div>

        <div className={styles.actions}>
          <SubmitButton label="Sign in" pendingLabel="Verifying…" />
        </div>

        <div className={styles.switchPrompt}>
          <span>New member or new phone?</span>
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToActivate}
            aria-label="Switch to Link device view"
          >
            Activate device with code →
          </button>
        </div>
      </form>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   VIEW 2: Activation Code Entry (Step 1)
   ───────────────────────────────────────────────────────────── */
function ActivationCodeView({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(submitActivationCode, {})

  return (
    <>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <h1 className={styles.heading}>Link your device</h1>
        </div>
        <p className={styles.subtext}>
          Enter the activation code from the front desk to connect this phone to your membership.
        </p>
        <span className={styles.badge}>One member, one device</span>
      </div>

      <form action={formAction} className={styles.form} noValidate>
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
            required
            className={styles.input}
            aria-invalid={state?.error ? true : undefined}
            aria-describedby="activation-code-help"
          />
          <p id="activation-code-help" className={styles.helper}>
            The desk generates this code for you. Each code works once.
          </p>
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
   VIEW 3: Set PIN & Confirm PIN (Step 2)
   ───────────────────────────────────────────────────────────── */
function PinSetupView({ onBackToActivate }: { onBackToActivate: () => void }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(submitPin, {})

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

      <form action={formAction} className={styles.form} noValidate>
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
            required
            className={`${styles.input} ${styles.pinInput}`}
            aria-invalid={state?.error ? true : undefined}
            aria-describedby="setup-pin-help"
          />
          <p id="setup-pin-help" className={styles.helper}>
            Exactly 4 numeric digits.
          </p>
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
            required
            className={`${styles.input} ${styles.pinInput}`}
          />
        </div>

        <div className={styles.actions}>
          <SubmitButton label="Finish setup & enter" pendingLabel="Binding device…" />
        </div>
      </form>
    </>
  )
}
