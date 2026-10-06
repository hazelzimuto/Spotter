import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '@/app/legal.module.css'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Spotter Terms of Service. Member rules, single-device binding, whiteboard check-in policies, Paystack renewals, and governing laws of the Federal Republic of Nigeria.',
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsOfServicePage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.backgroundAmbiance} aria-hidden="true" />

      {/* ── Navigation Header ── */}
      <header className={styles.header}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navBrand} aria-label="Spotter home">
            <div className={styles.navLogo} aria-hidden="true">
              <span className={styles.navLogoLetter}>S</span>
            </div>
            <span className={styles.navBrandName}>Spotter</span>
          </Link>

          <div className={styles.navActions}>
            <Link href="/" className={styles.backLink}>
              <span aria-hidden="true">←</span> Back to Spotter
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Legal Content ── */}
      <main className={styles.mainContainer}>
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

          <nav className={styles.docTabs} aria-label="Legal documents">
            <Link href="/privacy" className={styles.docTab}>
              Privacy Policy
            </Link>
            <span className={`${styles.docTab} ${styles.docTabActive}`}>
              Terms of Service
            </span>
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

        <nav className={styles.footerLinks} aria-label="Legal links">
          <Link href="/privacy" className={styles.footerLink}>
            Privacy Policy
          </Link>
          <span className={styles.footerSeparator} aria-hidden="true">
            •
          </span>
          <Link href="/terms" className={styles.footerLink}>
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  )
}
