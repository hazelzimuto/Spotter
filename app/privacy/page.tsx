import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '@/app/legal.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Spotter Privacy Policy. Learn how member data, attendance records, device bindings, and payment tokens are handled in compliance with the Nigeria Data Protection Act 2023 (NDPA).',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPolicyPage() {
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

          <nav className={styles.docTabs} aria-label="Legal documents">
            <span className={`${styles.docTab} ${styles.docTabActive}`}>
              Privacy Policy
            </span>
            <Link href="/terms" className={styles.docTab}>
              Terms of Service
            </Link>
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
