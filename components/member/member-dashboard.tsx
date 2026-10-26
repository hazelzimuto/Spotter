'use client'

import React, { useState, useTransition, useId } from 'react'
import styles from './member-dashboard.module.css'
import {
  UK_SUBSCRIPTION_PLANS,
  formatGbp,
  calculateUkVat,
  type SubscriptionPlan,
} from '@/lib/payments/stripe'
import {
  initiateSubscriptionPayment,
  completeSubscriptionPayment,
} from '@/app/member/actions'

export interface MemberDashboardProps {
  member: {
    id: string
    fullName: string
    email?: string | null
    phone?: string | null
    memberNumber?: string | null
    tier: 'BASIC' | 'PREMIUM'
    expiryDate: string
    currentBalance: number
    openingBalance: number
  }
  payments: Array<{
    id: string
    amount: number
    reference: string
    createdAt: string
    method: string
  }>
  recentVisitsCount?: number
  onSignOut: () => Promise<void>
  initialPaymentSuccessRef?: string | null
  initialPaymentCancelled?: boolean
}

export function MemberDashboard({
  member,
  payments,
  recentVisitsCount = 0,
  onSignOut,
  initialPaymentSuccessRef,
  initialPaymentCancelled,
}: MemberDashboardProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('premium-monthly')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [demoNotice, setDemoNotice] = useState<{
    reference: string
    message: string
  } | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(
    initialPaymentSuccessRef
      ? `Payment confirmed! Reference: ${initialPaymentSuccessRef}. Your membership has been updated.`
      : null
  )
  const [cancelNotice, setCancelNotice] = useState<string | null>(
    initialPaymentCancelled
      ? 'Payment was cancelled. Your membership remains unchanged.'
      : null
  )

  const selectedPlan: SubscriptionPlan =
    UK_SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) ||
    UK_SUBSCRIPTION_PLANS[1]

  const { netPence, vatPence } = calculateUkVat(selectedPlan.pricePence)

  // Expiry calculations
  const expiryDate = new Date(member.expiryDate)
  const now = new Date()
  const diffMs = expiryDate.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const isExpired = daysRemaining <= 0
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7

  const formattedExpiry = expiryDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  function handleSelectPlan(id: string) {
    setSelectedPlanId(id)
    setError(null)
  }

  function handleProceedToPayment() {
    setError(null)
    setDemoNotice(null)

    startTransition(async () => {
      const res = await initiateSubscriptionPayment(selectedPlanId)

      if (!res.success) {
        setError(res.error || 'Failed to initialize payment session. Please try again.')
        return
      }

      if (res.url) {
        // Authoritative Stripe Checkout Redirect
        window.location.href = res.url
        return
      }

      if (res.demoMode && res.reference) {
        // Developer sandbox simulation when STRIPE_SECRET_KEY is not configured
        setDemoNotice({
          reference: res.reference,
          message:
            res.message ||
            'Stripe sandbox initialized. Click below to simulate instant renewal.',
        })
      }
    })
  }

  function handleConfirmDemoRenewal() {
    if (!demoNotice) return

    startTransition(async () => {
      const res = await completeSubscriptionPayment(
        demoNotice.reference,
        selectedPlanId
      )

      if (res.success) {
        setDemoNotice(null)
        setSuccessNotice('Membership successfully renewed for 30 days!')
      } else {
        setError(res.error || 'Failed to complete renewal simulation.')
      }
    })
  }

  function scrollToPlans() {
    const el = document.getElementById('membership-plans-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.dashboard}>
      {/* ── Top Bar ── */}
      <header className={styles.topNav}>
        <div className={styles.brandWrapper}>
          <div className={styles.brandLogo} aria-hidden="true">
            S
          </div>
          <div>
            <h1 className={styles.brandTitle}>Spotter Member Portal</h1>
            <p className={styles.brandSubtitle}>
              <span className={styles.ukFlag}>🇬🇧</span> UK Gym Network • London
            </p>
          </div>
        </div>

        <div className={styles.userActions}>
          <form action={onSignOut}>
            <button type="submit" className={styles.signOutBtn}>
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* ── Notification Banners ── */}
      {successNotice && (
        <aside className={styles.notificationBanner} role="status">
          <div className={styles.notificationContent}>
            <svg
              className={styles.notificationIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className={styles.notificationText}>{successNotice}</p>
          </div>
          <button
            type="button"
            className={styles.notificationDismiss}
            onClick={() => setSuccessNotice(null)}
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </aside>
      )}

      {cancelNotice && (
        <aside
          className={styles.notificationBanner}
          style={{ borderColor: 'var(--color-warning)', background: 'rgba(226, 160, 18, 0.12)' }}
          role="status"
        >
          <div className={styles.notificationContent}>
            <p className={styles.notificationText}>{cancelNotice}</p>
          </div>
          <button
            type="button"
            className={styles.notificationDismiss}
            onClick={() => setCancelNotice(null)}
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </aside>
      )}

      {/* ── Hero Status Card ── */}
      <section className={styles.heroCard} aria-labelledby="member-status-heading">
        <div className={styles.heroCardGlow} aria-hidden="true" />

        <div className={styles.heroHeader}>
          <div className={styles.memberMeta}>
            <span className={styles.greeting}>Member Profile</span>
            <h2 id="member-status-heading" className={styles.memberName}>
              {member.fullName}
            </h2>
            <div className={styles.memberTags}>
              {member.memberNumber && (
                <span className={styles.memberNumberBadge}>
                  #{member.memberNumber}
                </span>
              )}
              <span className={styles.tierBadge}>{member.tier} Member</span>
            </div>
          </div>

          <div
            className={`${styles.statusPill} ${
              isExpired
                ? styles.statusExpired
                : isExpiringSoon
                ? styles.statusExpiring
                : styles.statusActive
            }`}
          >
            <span className={styles.pulseDot} aria-hidden="true" />
            <span>
              {isExpired
                ? 'Membership Expired'
                : isExpiringSoon
                ? 'Renewal Due Soon'
                : 'Membership Active'}
            </span>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Days Remaining</span>
            <p className={styles.metricValue}>
              {isExpired ? '0' : daysRemaining}
              <span style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: 4 }}>
                days
              </span>
            </p>
            <span className={styles.metricSubtext}>Expires {formattedExpiry}</span>
          </div>

          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Current Balance</span>
            <p className={styles.metricValue}>
              {formatGbp(member.currentBalance)}
            </p>
            <span className={styles.metricSubtext}>
              {member.currentBalance <= 0 ? 'All fees settled' : 'Payment due'}
            </span>
          </div>

          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Monthly Visits</span>
            <p className={styles.metricValue}>
              {recentVisitsCount}
              <span style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: 4 }}>
                check-ins
              </span>
            </p>
            <span className={styles.metricSubtext}>Desk code verified</span>
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={styles.payActionBtn}
            onClick={scrollToPlans}
            style={{ width: 'auto', padding: 'var(--spacing-3) var(--spacing-6)' }}
          >
            {isExpired ? 'Renew Subscription Now →' : 'Upgrade or Extend Plan →'}
          </button>
        </div>
      </section>

      {/* ── Subscription Plans & Stripe Payment Section ── */}
      <section id="membership-plans-section" aria-labelledby="plans-heading">
        <header className={styles.sectionHeader}>
          <h2 id="plans-heading" className={styles.sectionTitle}>
            Subscription Plans & Renewal
          </h2>
          <p className={styles.sectionDescription}>
            Select your membership tier. Secure UK payment processing powered by Stripe in British Pounds (£).
          </p>
        </header>

        {/* Plan Cards */}
        <div className={styles.plansGrid} role="radiogroup" aria-label="UK Gym Membership Plans">
          {UK_SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id
            return (
              <div
                key={plan.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`${styles.planCard} ${isSelected ? styles.planCardSelected : ''}`}
                onClick={() => handleSelectPlan(plan.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    handleSelectPlan(plan.id)
                  }
                }}
              >
                {plan.badge && <span className={styles.planBadge}>{plan.badge}</span>}

                <div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPriceWrapper}>
                    <span className={styles.planPrice}>
                      {formatGbp(plan.pricePence)}
                    </span>
                    <span className={styles.planInterval}>
                      /{plan.interval === 'year' ? 'year' : 'month'}
                    </span>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>

                  <ul className={styles.featureList}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className={styles.featureItem}>
                        <svg
                          className={styles.featureCheck}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className={`${styles.selectPlanBtn} ${
                    isSelected ? styles.selectPlanBtnSelected : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectPlan(plan.id)
                  }}
                >
                  {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                </button>
              </div>
            )
          })}
        </div>

        {/* ── Stripe Checkout Order Summary Panel ── */}
        <div className={styles.checkoutPanel}>
          <div className={styles.checkoutHeader}>
            <div>
              <h3 className={styles.checkoutTitle}>Checkout Summary</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Spotter UK Subscription Renewal
              </span>
            </div>
            <div className={styles.stripeBadge}>
              <span aria-hidden="true">🔒</span>
              <span>Stripe Checkout</span>
            </div>
          </div>

          <div className={styles.summaryBreakdown}>
            <div className={styles.breakdownRow}>
              <span>Selected Tier</span>
              <strong style={{ color: 'var(--color-on-surface)' }}>{selectedPlan.name}</strong>
            </div>
            <div className={styles.breakdownRow}>
              <span>Billing Cadence</span>
              <span>{selectedPlan.interval === 'year' ? 'Annual (12 Months)' : 'Monthly (30 Days)'}</span>
            </div>
            <div className={styles.breakdownRow}>
              <span>Net Membership Fee</span>
              <span>{formatGbp(netPence)}</span>
            </div>
            <div className={styles.breakdownRow}>
              <span>Standard UK VAT (20% included)</span>
              <span>{formatGbp(vatPence)}</span>
            </div>
          </div>

          <div className={styles.breakdownTotal}>
            <span>Total Due Today:</span>
            <span style={{ color: 'var(--color-primary)' }}>
              {formatGbp(selectedPlan.pricePence)}
            </span>
          </div>

          <div className={styles.paymentMethodsBar}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginRight: 4 }}>
              Supported in UK:
            </span>
            <span className={styles.methodPill}>💳 Visa</span>
            <span className={styles.methodPill}>💳 Mastercard</span>
            <span className={styles.methodPill}>💳 American Express</span>
            <span className={styles.methodPill}> Apple Pay</span>
            <span className={styles.methodPill}>G Google Pay</span>
          </div>

          {error && (
            <p
              role="alert"
              style={{
                color: 'var(--color-error)',
                fontSize: '0.875rem',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              {error}
            </p>
          )}

          {/* Sandbox simulation prompt if STRIPE_SECRET_KEY is not configured */}
          {demoNotice && (
            <div
              style={{
                background: 'rgba(99, 91, 255, 0.1)',
                border: '1px solid #635bff',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-4)',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              <p style={{ margin: '0 0 var(--spacing-2)', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                {demoNotice.message}
              </p>
              <button
                type="button"
                className={styles.payActionBtn}
                style={{ width: 'auto', padding: 'var(--spacing-2) var(--spacing-4)' }}
                onClick={handleConfirmDemoRenewal}
                disabled={isPending}
              >
                {isPending ? 'Renewing…' : '✓ Confirm Test Renewal (Extend 30 Days)'}
              </button>
            </div>
          )}

          <button
            type="button"
            className={styles.payActionBtn}
            onClick={handleProceedToPayment}
            disabled={isPending}
            id="pay-with-stripe-button"
          >
            {isPending ? (
              <span>Connecting to Stripe…</span>
            ) : (
              <span>
                Pay {formatGbp(selectedPlan.pricePence)} with Stripe →
              </span>
            )}
          </button>

          <div className={styles.securityNote}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              256-bit encrypted checkout. Includes 48-hour network grace period guarantee.
            </span>
          </div>
        </div>
      </section>

      {/* ── Payment History ── */}
      <section className={styles.transactionsCard} aria-labelledby="history-heading">
        <h2 id="history-heading" className={styles.sectionTitle} style={{ fontSize: '1.25rem' }}>
          Payment History & Receipts
        </h2>
        <p className={styles.sectionDescription} style={{ marginBottom: 'var(--spacing-4)' }}>
          Authoritative audit record of your past membership renewals and receipts.
        </p>

        <div className={styles.tableWrapper}>
          {payments.length === 0 ? (
            <div className={styles.emptyHistory}>
              <p style={{ margin: 0 }}>No payments recorded yet.</p>
              <p style={{ margin: 'var(--spacing-1) 0 0', fontSize: '0.8rem' }}>
                Your membership renewal receipts will automatically appear here once processed.
              </p>
            </div>
          ) : (
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Reference</th>
                  <th scope="col">Method</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const date = new Date(p.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  return (
                    <tr key={p.id}>
                      <td>{date}</td>
                      <td>
                        <code style={{ fontSize: '0.8rem' }}>{p.reference}</code>
                      </td>
                      <td>Stripe / Card</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: 'var(--color-success-container)',
                            color: 'var(--color-on-success-container)',
                          }}
                        >
                          Confirmed
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatGbp(p.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── WhatsApp Desk Fallback ── */}
      <section className={styles.supportCard} aria-labelledby="support-heading">
        <div>
          <h3 id="support-heading" className={styles.supportTitle}>
            Questions about your membership or billing?
          </h3>
          <p className={styles.supportSubtext}>
            Our front desk team is on standby to help with receipt queries, plan freezes, or card payments.
          </p>
        </div>
        <a
          href="https://wa.me/?text=Hi%20Spotter%20Desk%2C%20I%20have%20a%20question%20about%20my%20gym%20membership"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappBtn}
        >
          <span>Chat on WhatsApp</span>
          <span aria-hidden="true">→</span>
        </a>
      </section>
    </div>
  )
}
