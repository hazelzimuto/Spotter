'use client'

import { useState, useActionState, useEffect } from 'react'
import {
  generateMemberNumberAction,
  staffLogoutAction,
  GenerateMemberState,
} from '@/app/staff/actions'
import styles from './staff.module.css'

export interface RecentMemberItem {
  id: string
  fullName: string
  memberNumber: string | null
  tier: 'BASIC' | 'PREMIUM'
  hasDevice: boolean
  createdAt: string
}

interface ReceptionistDashboardProps {
  staff: {
    staffId: string
    fullName: string
    email: string
    role: 'STAFF' | 'OWNER'
  }
  recentMembers: RecentMemberItem[]
}

const initialGenerateState: GenerateMemberState = {}

export function ReceptionistDashboard({ staff, recentMembers }: ReceptionistDashboardProps) {
  const [state, formAction, isPending] = useActionState(
    generateMemberNumberAction,
    initialGenerateState,
  )

  const [copied, setCopied] = useState(false)
  const [tier, setTier] = useState<'BASIC' | 'PREMIUM'>('BASIC')
  const [hasEmail, setHasEmail] = useState(false)
  const [liveRecent, setLiveRecent] = useState<RecentMemberItem[]>(recentMembers)
  const [showForm, setShowForm] = useState(true)

  // When a member is successfully created, update local recent list
  useEffect(() => {
    if (state.success && state.member?.memberNumber) {
      setShowForm(false)
      const newItem: RecentMemberItem = {
        id: state.member.memberId || `temp-${Date.now()}`,
        fullName: state.member.fullName || 'New Member',
        memberNumber: state.member.memberNumber,
        tier: state.member.tier || 'BASIC',
        hasDevice: false,
        createdAt: 'Just now',
      }
      setLiveRecent((prev) => [newItem, ...prev.slice(0, 9)])
    }
  }, [state.success, state.member])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  const handleRegisterAnother = () => {
    setShowForm(true)
    setCopied(false)
  }

  return (
    <div className={styles.pageContainer}>
      {/* Top Staff Navigation */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.brandRow}>
            <div className={styles.brandLogo}>S</div>
            <div className={styles.brandText}>
              <h1 className={styles.brandTitle}>Spotter Desk</h1>
            </div>
          </div>
          <span className={styles.portalBadge}>Receptionist Portal</span>
        </div>

        <div className={styles.navRight}>
          <div className={styles.staffProfile}>
            <div className={styles.staffAvatar}>
              {staff.fullName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.staffMeta}>
              <span className={styles.staffName}>{staff.fullName}</span>
              <span className={styles.staffRole}>
                {staff.role === 'OWNER' ? 'Gym Owner' : 'Front Desk Receptionist'}
              </span>
            </div>
          </div>

          <form action={staffLogoutAction}>
            <button type="submit" className={styles.logoutBtn}>
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className={styles.dashboardMain}>
        <div className={styles.dashboardHeader}>
          <h2 className={styles.dashboardTitle}>Intending Member Registration</h2>
          <p className={styles.dashboardSubtitle}>
            Generate an authoritative 6-digit member number for a new gym applicant. The applicant will use this number to securely activate their private account.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left Column: Form or Success Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            {state.success && state.member && !showForm ? (
              <div className={styles.successCard}>
                <div className={styles.successBadgeRow}>
                  <span className={styles.successTag}>Member Record Created</span>
                  <button
                    type="button"
                    onClick={handleRegisterAnother}
                    className={styles.devSeedBtn}
                  >
                    + Register Another Member
                  </button>
                </div>

                <div className={styles.numberDisplay}>
                  <span className={styles.numberLabel}>Assigned Member Number</span>
                  <p className={styles.numberDigits}>
                    {state.member.memberNumber?.slice(0, 3)}{' '}
                    {state.member.memberNumber?.slice(3)}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(state.member?.memberNumber || '')}
                    className={styles.copyBtn}
                  >
                    {copied ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy Member Number
                      </>
                    )}
                  </button>
                </div>

                <div className={styles.memberMetaList}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Full Name</span>
                    <span className={styles.metaValue}>{state.member.fullName}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Assigned Tier</span>
                    <span className={styles.metaValue}>{state.member.tier} Tier</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Contact Phone</span>
                    <span className={styles.metaValue}>{state.member.phone}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Activation Code</span>
                    <span className={styles.metaValue}>{state.member.activationCode}</span>
                  </div>
                </div>

                <div className={styles.instructionBox}>
                  <h4 className={styles.instructionTitle}>Handover Protocol for Receptionist:</h4>
                  <p className={styles.instructionText}>
                    1. Direct the member to <strong>Spotter</strong> on their personal mobile phone.
                    <br />
                    2. Member selects <strong>Activate Account</strong> and inputs this 6-digit Member Number: <strong>{state.member.memberNumber}</strong>.
                    <br />
                    3. The member sets their personal, private 4-digit PIN. Staff must never ask for or record member PINs.
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    New Member Details
                  </h3>
                  <p className={styles.cardSubtitle}>
                    All intending members are initialized with unlinked security credentials until their personal mobile device is bound.
                  </p>
                </div>

                {state.error && (
                  <div className={`${styles.alertBox} ${styles.alertError}`} role="alert">
                    {state.error}
                  </div>
                )}

                <form action={formAction} className={styles.form}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="fullName" className={styles.label}>
                      Applicant Full Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="e.g. Chinedu Okafor"
                      className={`${styles.input} ${state.fieldErrors?.fullName ? styles.inputError : ''}`}
                    />
                    {state.fieldErrors?.fullName && (
                      <p className={styles.errorText}>{state.fieldErrors.fullName[0]}</p>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="phone" className={styles.label}>
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+234..."
                        className={`${styles.input} ${state.fieldErrors?.phone ? styles.inputError : ''}`}
                      />
                      {state.fieldErrors?.phone && (
                        <p className={styles.errorText}>{state.fieldErrors.phone[0]}</p>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Email Address <span className={styles.labelSub}>(Optional)</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="client@example.com"
                        onChange={(e) => setHasEmail(e.target.value.trim().length > 0)}
                        className={`${styles.input} ${state.fieldErrors?.email ? styles.inputError : ''}`}
                      />
                      {state.fieldErrors?.email && (
                        <p className={styles.errorText}>{state.fieldErrors.email[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Membership Tier *</label>
                    <input type="hidden" name="tier" value={tier} />
                    <div className={styles.tierButtonGroup}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setTier('BASIC')}
                        onKeyDown={(e) => e.key === 'Enter' && setTier('BASIC')}
                        className={`${styles.tierOption} ${tier === 'BASIC' ? styles.tierOptionSelected : ''}`}
                      >
                        <span className={styles.tierName}>Basic Tier</span>
                        <span className={styles.tierDesc}>Standard gym access and general rule cards.</span>
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setTier('PREMIUM')}
                        onKeyDown={(e) => e.key === 'Enter' && setTier('PREMIUM')}
                        className={`${styles.tierOption} ${tier === 'PREMIUM' ? styles.tierOptionSelected : ''}`}
                      >
                        <span className={styles.tierName}>Premium Tier</span>
                        <span className={styles.tierDesc}>All gym access, trainer cards, and priority perks.</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="durationMonths" className={styles.label}>
                        Initial Duration *
                      </label>
                      <select
                        id="durationMonths"
                        name="durationMonths"
                        defaultValue="1"
                        className={styles.select}
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months (Quarterly)</option>
                        <option value="6">6 Months (Biannual)</option>
                        <option value="12">12 Months (Annual)</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="openingBalanceKobo" className={styles.label}>
                        Opening Balance <span className={styles.labelSub}>(In Kobo)</span>
                      </label>
                      <input
                        id="openingBalanceKobo"
                        name="openingBalanceKobo"
                        type="number"
                        min="0"
                        step="100"
                        defaultValue="0"
                        placeholder="0"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {hasEmail && (
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="sendEmailNotification"
                        className={styles.checkbox}
                        defaultChecked
                      />
                      Send welcome email with member number to applicant
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className={styles.submitBtn}
                  >
                    {isPending ? (
                      'Generating Secure Member Number...'
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Generate Member Number
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Security Controls & Recent Members */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            {/* Security Guardrails Panel */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Reception Security Perimeter
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <div className={styles.securityNotice}>
                  <div>
                    <strong>Cryptographic Uniform Sampling:</strong> Member numbers are generated with 24-bit rejection sampling to ensure zero modulo bias and avoid predictable sequences.
                  </div>
                </div>
                <div className={styles.securityNotice}>
                  <div>
                    <strong>Unlinked Device Credential:</strong> Generated member records have null credentials (<code>deviceId: null</code>, <code>pinHash: null</code>). Check-ins are blocked until the member activates on their mobile phone.
                  </div>
                </div>
                <div className={styles.securityNotice}>
                  <div>
                    <strong>Rate Protection:</strong> Front desk generation is restricted to 30 intending members per hour per receptionist account to prevent automated spam.
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Recent Desk Registrations</h3>
                <p className={styles.cardSubtitle}>
                  Recent intending member numbers assigned during your shift.
                </p>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Member #</th>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Tier</th>
                      <th className={styles.th}>Device Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveRecent.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.emptyState}>
                          No member numbers generated in this session yet.
                        </td>
                      </tr>
                    ) : (
                      liveRecent.map((mem) => (
                        <tr key={mem.id}>
                          <td className={styles.td}>
                            <strong>{mem.memberNumber || 'N/A'}</strong>
                          </td>
                          <td className={styles.td}>{mem.fullName}</td>
                          <td className={styles.td}>{mem.tier}</td>
                          <td className={styles.td}>
                            {mem.hasDevice ? (
                              <span className={styles.statusActive}>Active</span>
                            ) : (
                              <span className={styles.statusPending}>Pending Setup</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
