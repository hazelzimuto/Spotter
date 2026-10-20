'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './onboarding.module.css'
import {
  StepOneIllustration,
  StepTwoIllustration,
  StepThreeIllustration,
} from './onboarding-illustrations'

interface OnboardingFlowProps {
  firstName: string
}

export function OnboardingFlow({ firstName }: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  function handleNext() {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    } else {
      router.push('/member')
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  function handleSkip() {
    router.push('/member')
  }

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow} aria-hidden="true" />

      <main className={styles.card} role="main">
        {/* Top bar with Step badge & Skip */}
        <header className={styles.topNav}>
          <span className={styles.stepBadge}>
            Step {currentStep} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className={styles.skipLink}
            aria-label="Skip onboarding and go to dashboard"
          >
            Skip to Dashboard
          </button>
        </header>

        {/* Progress Bar */}
        <div
          className={styles.progressBarTrack}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
        >
          <div
            className={styles.progressBarFill}
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1: Check In with Daily Whiteboard Code */}
        {currentStep === 1 && (
          <article className={styles.stepBody}>
            <h1 className={styles.title}>
              Welcome, {firstName}! Check in with the daily code
            </h1>
            <p className={styles.description}>
              Spotter is your private member portal. When you walk into the gym, check the physical whiteboard at the entrance for today&apos;s 4-digit code to log your visit instantly.
            </p>

            <div className={styles.illustrationWrapper}>
              <StepOneIllustration className={styles.illustrationSvg} />
            </div>

            <aside className={styles.callout}>
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>
                Visits are limited to 1 check-in per 4-hour window to keep your attendance records clean and accurate.
              </span>
            </aside>
          </article>
        )}

        {/* Step 2: Instant Verified Answers */}
        {currentStep === 2 && (
          <article className={styles.stepBody}>
            <h1 className={styles.title}>
              Ask Spotter about gym rules &amp; hours
            </h1>
            <p className={styles.description}>
              Skip the line at the front desk. Ask questions about equipment rules, peak times, and facility hours anytime, grounded exclusively in official gym records.
            </p>

            <div className={styles.illustrationWrapper}>
              <StepTwoIllustration className={styles.illustrationSvg} />
            </div>

            <aside className={styles.callout}>
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                For billing disputes, medical advice, or personal requests, Spotter will instantly connect you with front desk staff via WhatsApp.
              </span>
            </aside>
          </article>
        )}

        {/* Step 3: Track Records & Renewals */}
        {currentStep === 3 && (
          <article className={styles.stepBody}>
            <h1 className={styles.title}>
              Track your records and renew online
            </h1>
            <p className={styles.description}>
              Your workout history and membership status are always at your fingertips. Renew your subscription seamlessly via Paystack without waiting in line.
            </p>

            <div className={styles.illustrationWrapper}>
              <StepThreeIllustration className={styles.illustrationSvg} />
            </div>

            <aside className={styles.callout}>
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>
                Your Spotter account is securely bound to this device, keeping your attendance and payments confidential.
              </span>
            </aside>
          </article>
        )}

        {/* Navigation Action Buttons */}
        <footer className={styles.buttonRow}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className={styles.backBtn}
              aria-label="Previous onboarding step"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className={styles.primaryBtn}
            aria-label={
              currentStep === totalSteps
                ? 'Enter member portal'
                : 'Next onboarding step'
            }
          >
            {currentStep === totalSteps ? (
              <>
                <span>Enter Member Portal</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            ) : (
              <>
                <span>Next</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </footer>
      </main>
    </div>
  )
}
