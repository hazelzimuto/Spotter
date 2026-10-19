'use client'

import React, { useState, useEffect, useTransition } from 'react'
import styles from './email-verification-banner.module.css'
import {
  submitEmailVerification,
  resendEmailVerification,
  type VerificationActionState,
} from '@/app/member/actions'

interface EmailVerificationBannerProps {
  email?: string | null
  initialVerified?: boolean
}

export function EmailVerificationBanner({
  email,
  initialVerified = false,
}: EmailVerificationBannerProps) {
  const [code, setCode] = useState('')
  const [isVerified, setIsVerified] = useState(initialVerified)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const [isPending, startTransition] = useTransition()
  const [isResending, startResendTransition] = useTransition()

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // If already verified and no success notice to show, do not render banner
  if (isVerified && !success) {
    return null
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Only accept numeric characters up to 6 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(cleaned)
    setError(null)
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter a complete 6-digit verification code.')
      return
    }

    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.set('code', code)
      const res: VerificationActionState = await submitEmailVerification({}, formData)

      if (res.error) {
        setError(res.error)
      } else if (res.success) {
        setIsVerified(true)
        setSuccess(res.message || 'Email verified successfully.')
      }
    })
  }

  function handleResend() {
    if (cooldown > 0 || isResending) return

    setError(null)
    setSuccess(null)

    startResendTransition(async () => {
      const res = await resendEmailVerification()
      if (res.error) {
        setError(res.error)
      } else if (res.success) {
        setSuccess(res.message || 'A new 6-digit code has been sent to your email.')
        setCooldown(60)
      }
    })
  }

  return (
    <section
      role="region"
      aria-label="Email verification"
      className={`${styles.banner} ${isVerified ? styles.bannerSuccess : ''}`}
    >
      <div className={styles.topRow}>
        <div
          className={`${styles.iconWrapper} ${isVerified ? styles.iconWrapperSuccess : ''}`}
          aria-hidden="true"
        >
          {isVerified ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
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
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          )}
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>
            {isVerified ? 'Email Address Verified' : 'Please Verify Your Email'}
          </h2>
          <p className={styles.description}>
            {isVerified ? (
              'Thank you. Your account email has been verified and confirmed.'
            ) : (
              <>
                We sent a 6-digit verification code to{' '}
                <span className={styles.emailHighlight}>{email || 'your email'}</span>. Enter the
                code below to confirm your account.
              </>
            )}
          </p>

          {!isVerified && (
            <form onSubmit={handleVerify} className={styles.formArea}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                placeholder="123456"
                aria-label="6-digit verification code"
                className={styles.codeInput}
                disabled={isPending}
              />

              <button
                type="submit"
                className={styles.verifyBtn}
                disabled={isPending || code.length !== 6}
              >
                {isPending ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                onClick={handleResend}
                className={styles.resendBtn}
                disabled={isResending || cooldown > 0}
              >
                {isResending
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend code'}
              </button>
            </form>
          )}

          {error && (
            <div role="alert" className={styles.errorMessage}>
              {error}
            </div>
          )}

          {success && (
            <div role="status" className={styles.successMessage}>
              {success}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
