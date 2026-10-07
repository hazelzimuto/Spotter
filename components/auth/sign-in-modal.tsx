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
                ? 'Enter your member PIN to access your records.'
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
   Sign-in form — PIN entry
   ───────────────────────────────────────────────────────────── */
function SignInForm() {
  const [pin, setPin] = useState('')
  const [state, formAction] = useActionState<AuthFormState, FormData>(submitSignIn, {})

  return (
    <form
      id="sign-in-form"
      className={styles.modalForm}
      action={formAction}
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
        <label htmlFor="pin-input" className={styles.modalLabel}>
          Your 4-digit PIN
        </label>
        <input
          id="pin-input"
          name="pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          autoComplete="current-password"
          placeholder="••••"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className={styles.modalInput}
          aria-describedby="pin-hint"
          aria-invalid={state?.error ? true : undefined}
          required
        />
        <span id="pin-hint" className={styles.modalFootnote} style={{ textAlign: 'left' }}>
          Set during your first device activation.
        </span>
      </div>

      <button
        id="sign-in-submit"
        type="submit"
        disabled={pin.length < 4}
        className={styles.modalPrimaryBtn}
      >
        Sign in
      </button>

      <div className={styles.modalDivider}>or</div>

      <p className={styles.modalFootnote}>
        New member?{' '}
        <Link href="/auth?view=activate" className={styles.modalFootnoteLink} prefetch={false}>
          Get your activation code from the desk →
        </Link>
      </p>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────────
   Sign-up panel — routes to /auth?view=activate
   ───────────────────────────────────────────────────────────── */
function SignUpPanel() {
  return (
    <div className={styles.modalForm}>
      <p className={styles.modalFootnote} style={{ textAlign: 'left', fontSize: '0.9rem' }}>
        Spotter is a private member app. To get started, ask any staff member at
        the front desk for a one-time <strong>activation code</strong>. You'll
        use it to link this device to your membership.
      </p>

      <Link
        id="go-to-activate-btn"
        href="/auth?view=activate"
        className={styles.modalPrimaryBtn}
        style={{ textDecoration: 'none' }}
      >
        Enter activation code →
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
