'use client'

import { useEffect, useRef } from 'react'
import styles from '@/app/legal.module.css'

export type LegalViewType = 'privacy' | 'terms'

interface LegalViewProps {
  activeView: LegalViewType
  onSwitchView: (view: LegalViewType) => void
  onClose: () => void
}

export function LegalView({
  activeView,
  onSwitchView,
  onClose,
}: LegalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentYear = new Date().getFullYear()

  // Lock body scroll and listen for Escape key while the legal view is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Scroll to top when view changes
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeView])

  return (
    <div
      ref={containerRef}
      className={styles.pageWrapper}
      role="dialog"
      aria-modal="true"
      aria-label={activeView === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
    >
      <div className={styles.backgroundAmbiance} aria-hidden="true" />

      {/* ── Top Header / Navigation ── */}
      <header className={styles.header}>
        <div className={styles.navInner}>
          <button
            type="button"
            className={styles.navBrand}
            onClick={onClose}
            aria-label="Return to Spotter home"
          >
            <div className={styles.navLogo} aria-hidden="true">
              <span className={styles.navLogoLetter}>S</span>
            </div>
            <span className={styles.navBrandName}>Spotter</span>
          </button>

          <div className={styles.navActions}>
            <button
              type="button"
              className={styles.backLink}
              onClick={onClose}
              id="legal-back-btn"
            >
              <span aria-hidden="true">←</span> Back to Spotter
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Legal Content ── */}
      <main className={styles.mainContainer}>
        {activeView === 'privacy' ? (
          /* ================= PRIVACY POLICY VIEW ================= */
          <>
            <div className={styles.docHeader}>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>Legal & Privacy</span>
                <span className={`${styles.badge} ${styles.lawBadge}`}>
                  NDPA 2023 Compliant
                </span>
              </div>

              <h1 className={styles.docTitle}>Privacy Policy</h1>

              <div className={styles.docMeta}>
                <span>Effective Date: October 2026</span>
                <span aria-hidden="true">•</span>
                <span>Applicable Law: Federal Republic of Nigeria</span>
              </div>

              <nav className={styles.docTabs} aria-label="Legal document switcher">
                <button
                  type="button"
                  className={`${styles.docTab} ${styles.docTabActive}`}
                  aria-current="page"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  className={styles.docTab}
                  onClick={() => onSwitchView('terms')}
                >
                  Terms of Service
                </button>
              </nav>
            </div>

            {/* Highlight Callout */}
            <div className={styles.callout}>
              <div className={styles.calloutTitle}>
                <span>🛡️</span> Grounded in Privacy and Nigerian Data Protection Law
              </div>
              <p className={styles.calloutText}>
                Spotter is a private web application designed exclusively for gym members
                to check their attendance, balances, and gym policies. We process all
                personal data in strict compliance with the{' '}
                <strong>Nigeria Data Protection Act, 2023 (NDPA)</strong> and the regulations
                of the <strong>Nigeria Data Protection Commission (NDPC)</strong>. Your
                confidential gym records are never shared with other members, sold to
                advertisers, or used to train third-party artificial intelligence models.
              </p>
            </div>

            <div className={styles.content}>
              {/* Section 1 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Scope and Principles</h2>
                <p className={styles.paragraph}>
                  This Privacy Policy applies to registered gym members who access Spotter
                  via supported mobile and desktop browsers. In accordance with Section 24 of
                  the NDPA, Spotter adheres to core data processing principles:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Lawfulness, Fairness, and Transparency:</strong> Personal data is
                    collected solely for legitimate gym membership management and operations.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Purpose Limitation:</strong> We collect only the data necessary
                    to identify your membership, record your daily visits, process renewal
                    payments, and ground answers to gym questions.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Data Minimisation:</strong> We never collect unnecessary biometric,
                    location, or medical surveillance data.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Integrity and Confidentiality:</strong> All records are stored with
                    cryptographic protections and access controls.
                  </li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
                <p className={styles.paragraph}>
                  Spotter collects and maintains limited categories of member data:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Membership Identity:</strong> Member identifier (ID), full name,
                    membership tier (e.g., Basic, Premium), and registered phone number used
                    for front-desk activation code issuance.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Authentication & Device Credentials:</strong> A unique device
                    identifier (bound during one-time activation), and a cryptographic hash of
                    your 4-digit PIN (using industry-standard salted hashing). Spotter never
                    stores or transmits your plaintext PIN.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Attendance Records:</strong> Timestamps of member check-ins logged
                    when submitting the whiteboard daily check-in code at the gym (subject to a
                    maximum of one check-in per 4-hour window).
                  </li>
                  <li className={styles.listItem}>
                    <strong>Financial & Ledger Records:</strong> Opening balance and current
                    membership balance denominated in Nigerian kobo, payment dates, and
                    transaction references.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Local Device Cache:</strong> Cached membership status and approved
                    gym information cards stored in your browser storage to support offline
                    readiness.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  3. Lawful Bases for Processing (Section 25 NDPA)
                </h2>
                <p className={styles.paragraph}>
                  Under Section 25 of the Nigeria Data Protection Act 2023, our legal bases
                  for processing your personal data include:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Performance of a Contract:</strong> Processing attendance,
                    membership validity, and dues is essential to administer your gym membership
                    contract.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Compliance with Legal Obligations:</strong> Retaining financial
                    transaction records to comply with applicable Nigerian financial, accounting,
                    and tax regulations.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Legitimate Interests:</strong> Preventing unauthorized gym access,
                    protecting device integrity, and ensuring accurate ledger balances.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Consent:</strong> Where applicable for specific optional queries
                    or notifications.
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>4. Payment Processing and Paystack</h2>
                <p className={styles.paragraph}>
                  When you renew your membership or pay dues within Spotter, transactions are
                  routed through <strong>Paystack</strong>, a licensed and PCI-DSS compliant
                  payment gateway operating in Nigeria.
                </p>
                <div className={styles.highlightCard}>
                  <h3 className={styles.highlightCardTitle}>
                    Cardholder Data Security Standard
                  </h3>
                  <p className={styles.paragraph}>
                    Spotter <strong>never collects, stores, or handles</strong> your primary
                    account numbers (PAN), CVV/CVC codes, card expiration dates, or bank
                    account PINs. All payment processing takes place securely within Paystack.
                    Spotter receives only an idempotent transaction reference token, transaction
                    status, and verified amount in kobo via authenticated webhooks.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  5. AI Queries & Privacy (Ask About the Gym)
                </h2>
                <p className={styles.paragraph}>
                  Spotter features an automated assistant to answer questions about gym rules,
                  hours, equipment, and facility policies. We maintain strict privacy walls:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Exclusively Grounded in Approved Records:</strong> The AI retrieves
                    information only from cards reviewed and approved by gym management.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Zero Member Record Leaks:</strong> Your private attendance history,
                    account balance, and personal identity are completely bypassed during
                    general question searches and are never shared with embedding or LLM models.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Safety Refusal Enforcement:</strong> Spotter strictly refuses to
                    answer questions about other members, medical advice, real-time desk status,
                    refunds, waivers, discounts, cancellations, staff conduct, or financial
                    commitments on behalf of the gym.
                  </li>
                  <li className={styles.listItem}>
                    <strong>WhatsApp Desk Fallback:</strong> Any query that cannot be answered
                    with approved records is directed to the gym desk WhatsApp channel.
                  </li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  6. Device Binding and Single-Device Security
                </h2>
                <p className={styles.paragraph}>
                  To prevent account spoofing and pass-sharing, Spotter enforces a single-device
                  policy:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    Your membership is linked to one device using an activation code generated
                    by front desk staff and a 4-digit PIN configured on that device.
                  </li>
                  <li className={styles.listItem}>
                    If your device is lost, stolen, or replaced, you must request an in-person
                    force-unlink at the front desk before a new device can be activated.
                  </li>
                  <li className={styles.listItem}>
                    Sessions are maintained using secure, HTTP-only authentication cookies
                    inaccessible to third-party client scripts.
                  </li>
                </ul>
              </section>

              {/* Section 7 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  7. Your Rights under the Nigeria Data Protection Act (NDPA)
                </h2>
                <p className={styles.paragraph}>
                  Under Section 34 of the NDPA, you are entitled to exercise your data subject
                  rights:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Right to Access:</strong> You can directly view your attendance logs
                    and financial balance history at any time in the Spotter &quot;My Records&quot; tab.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Right to Rectification:</strong> If any attendance entry, balance, or
                    personal record is inaccurate, you can request an immediate correction with
                    the gym desk staff.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Right to Erasure (Right to be Forgotten):</strong> Subject to
                    statutory retention requirements for financial audits, you can request
                    deletion of your account upon membership termination.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Right to Object and Restrict Processing:</strong> You may request
                    limitations on how your data is processed where contested.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Right to Lodge a Complaint:</strong> You have the legal right to
                    lodge a complaint with the{' '}
                    <strong>Nigeria Data Protection Commission (NDPC)</strong> (
                    <a
                      href="https://ndpc.gov.ng"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                    >
                      ndpc.gov.ng
                    </a>
                    ) if you believe your data protection rights have been violated.
                  </li>
                </ul>
              </section>

              {/* Section 8 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>8. Data Retention</h2>
                <p className={styles.paragraph}>
                  Personal attendance records and active balances are retained for the duration
                  of your active membership and for a reasonable statutory period following
                  cancellation to fulfill Nigerian commercial ledger and tax documentation
                  mandates. After this retention window, inactive records are securely anonymized
                  or deleted.
                </p>
              </section>

              {/* Section 9 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>9. Contact Us</h2>
                <p className={styles.paragraph}>
                  If you have any questions about this Privacy Policy, your rights under the
                  NDPA, or wish to make a data subject request, please speak with your gym front
                  desk or reach out via the official desk WhatsApp fallback link available inside
                  the Spotter application.
                </p>
              </section>
            </div>
          </>
        ) : (
          /* ================= TERMS OF SERVICE VIEW ================= */
          <>
            <div className={styles.docHeader}>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>Legal & Conditions</span>
                <span className={styles.badge}>Member Agreement</span>
              </div>

              <h1 className={styles.docTitle}>Terms of Service</h1>

              <div className={styles.docMeta}>
                <span>Effective Date: October 2026</span>
                <span aria-hidden="true">•</span>
                <span>Governing Jurisdiction: Federal Republic of Nigeria</span>
              </div>

              <nav className={styles.docTabs} aria-label="Legal document switcher">
                <button
                  type="button"
                  className={styles.docTab}
                  onClick={() => onSwitchView('privacy')}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  className={`${styles.docTab} ${styles.docTabActive}`}
                  aria-current="page"
                >
                  Terms of Service
                </button>
              </nav>
            </div>

            {/* Highlight Callout */}
            <div className={styles.callout}>
              <div className={styles.calloutTitle}>
                <span>📋</span> Private Member Portal Terms
              </div>
              <p className={styles.calloutText}>
                Spotter is a private web application created solely for registered gym members.
                By entering your activation code, configuring your 4-digit PIN, or checking into
                the gym using Spotter, you agree to these Terms of Service and your primary gym
                membership agreement under the laws of the Federal Republic of Nigeria.
              </p>
            </div>

            <div className={styles.content}>
              {/* Section 1 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Eligibility and Access</h2>
                <p className={styles.paragraph}>
                  Spotter is not a public social network or open directory. Access is strictly
                  restricted to verified members of participating gyms. You may only activate
                  Spotter if you have been registered by authorized gym staff and issued a valid
                  one-time activation code.
                </p>
              </section>

              {/* Section 2 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  2. Single-Device Binding and Account Security
                </h2>
                <p className={styles.paragraph}>
                  Spotter enforces a strict <strong>&quot;one member, one device&quot;</strong>{' '}
                  security architecture:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Device Association:</strong> Your account is cryptographically bound
                    to the specific mobile or desktop browser used during initial PIN setup.
                  </li>
                  <li className={styles.listItem}>
                    <strong>No Account Sharing:</strong> You must not permit any other individual
                    to use your active device or session to enter the gym or query records.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Device Replacement (Force-Unlink):</strong> If you change or lose your
                    phone, you cannot register a new device independently. You must request a
                    physical identity verification and force-unlink from front desk staff.
                  </li>
                  <li className={styles.listItem}>
                    <strong>PIN Confidentiality:</strong> You are solely responsible for keeping
                    your 4-digit PIN confidential.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  3. Daily Desk Check-in & Suppression Window
                </h2>
                <p className={styles.paragraph}>
                  Member attendance is self-recorded through Spotter using daily whiteboard codes:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Daily Whiteboard Code:</strong> Each calendar day, gym staff updates
                    a 4-digit code on the gym whiteboard. You must physically be present at the
                    facility to enter this code.
                  </li>
                  <li className={styles.listItem}>
                    <strong>4-Hour Window Suppression:</strong> Spotter automatically limits
                    check-ins to a maximum of one check-in per four-hour window per member ID.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Prohibited Conduct:</strong> Broadcasting or texting daily whiteboard
                    codes to individuals off-premises, or attempting to register fraudulent visits,
                    constitutes a material breach of your gym membership and may result in
                    immediate suspension.
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  4. Membership Renewals and Payment Gateway
                </h2>
                <p className={styles.paragraph}>
                  All fees and balances are displayed in Nigerian Naira (NGN) and calculated in
                  kobo:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Paystack Gateway:</strong> Membership renewals are conducted
                    through Paystack. You agree to comply with Paystack&apos;s customer terms during
                    checkout.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Webhook Idempotency:</strong> Your account balance updates strictly
                    upon cryptographically signed webhook confirmation from the payment processor.
                  </li>
                  <li className={styles.listItem}>
                    <strong>No Automated Refunds or Waivers:</strong> Spotter does not process
                    refunds, chargebacks, fee waivers, or promotional discounts. Any billing
                    disputes or refund requests must be resolved in person with the gym owner or
                    front desk staff.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  5. Automated Information & Safety Refusals
                </h2>
                <p className={styles.paragraph}>
                  Spotter includes an intelligent Q&amp;A tool to query gym hours, class
                  schedules, equipment rules, and facility etiquette:
                </p>
                <div className={styles.highlightCard}>
                  <h3 className={styles.highlightCardTitle}>
                    Strict Safety Refusal Policy
                  </h3>
                  <p className={styles.paragraph}>
                    Spotter grounds answers <strong>exclusively in approved gym records</strong>.
                    The system is intentionally restricted and will refuse to answer questions
                    regarding:
                  </p>
                  <ul className={styles.list}>
                    <li className={styles.listItem}>Other members&apos; identities, balances, or attendance</li>
                    <li className={styles.listItem}>Medical advice, injury diagnostics, or rehabilitation plans</li>
                    <li className={styles.listItem}>Real-time desk or gym crowd occupancy</li>
                    <li className={styles.listItem}>Discounts, refunds, waivers, or cancellations</li>
                    <li className={styles.listItem}>Staff personal conduct or disciplinary matters</li>
                    <li className={styles.listItem}>Binding financial promises on behalf of gym management</li>
                  </ul>
                  <p className={styles.paragraph} style={{ marginTop: 'var(--spacing-2)' }}>
                    For any unanswerable matter, Spotter provides a direct WhatsApp link to desk staff.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>6. Physical Health and Gym Liability</h2>
                <p className={styles.paragraph}>
                  Spotter is an administrative and informational tool only. Nothing displayed in
                  the application constitutes medical, nutritional, or physical training advice.
                  Your physical presence, exercise routines, and equipment usage in the facility
                  remain governed by your signed gym liability waiver and facility safety rules.
                </p>
              </section>

              {/* Section 7 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>7. Intellectual Property</h2>
                <p className={styles.paragraph}>
                  The Spotter brand, software architecture, user interface, and proprietary
                  designs are protected by copyright, trademark, and intellectual property laws.
                  You agree not to reverse engineer, decompile, extract APIs, or build derivative
                  works from the Spotter application.
                </p>
              </section>

              {/* Section 8 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  8. Governing Law and Dispute Resolution
                </h2>
                <p className={styles.paragraph}>
                  These Terms of Service, along with your gym membership relationship, shall be
                  governed by and construed in accordance with the laws of the{' '}
                  <strong>Federal Republic of Nigeria</strong>. Any disputes arising out of or
                  in connection with these terms that cannot be resolved amicably with gym
                  management shall be submitted to the exclusive jurisdiction of the competent
                  courts of the Federal Republic of Nigeria.
                </p>
              </section>

              {/* Section 9 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>9. Modifications to Terms</h2>
                <p className={styles.paragraph}>
                  Gym management may update these Terms from time to time to reflect operational
                  changes or new regulatory guidelines under Nigerian law. Continued use of Spotter
                  following any update constitutes your acceptance of the revised Terms.
                </p>
              </section>

              {/* Section 10 */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>10. Support and Inquiries</h2>
                <p className={styles.paragraph}>
                  For questions regarding these Terms of Service or front-desk operations, please
                  contact gym desk staff in person or via the WhatsApp support link within the
                  application.
                </p>
              </section>
            </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.navLogo} aria-hidden="true">
            <span className={styles.navLogoLetter}>S</span>
          </div>
          <span className={styles.footerCopy}>
            © {currentYear} Spotter. Private member access only.
          </span>
        </div>

        <nav className={styles.footerLinks} aria-label="Legal document switcher">
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => onSwitchView('privacy')}
          >
            Privacy Policy
          </button>
          <span className={styles.footerSeparator} aria-hidden="true">
            •
          </span>
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => onSwitchView('terms')}
          >
            Terms of Service
          </button>
          <span className={styles.footerSeparator} aria-hidden="true">
            •
          </span>
          <button
            type="button"
            className={styles.footerLink}
            onClick={onClose}
          >
            Back to Spotter
          </button>
        </nav>
      </footer>
    </div>
  )
}
