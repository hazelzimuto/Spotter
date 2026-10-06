import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import {
  NavActions,
  HeroActions,
  CtaActions,
} from '@/components/landing/landing-client'
import styles from './landing.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Spotter — Your gym, at your fingertips',
  description:
    'Check your attendance, membership balance, and gym rules in seconds — without waiting at the front desk.',
  keywords: [
    'gym member portal',
    'gym attendance',
    'gym check-in',
    'membership renewal',
    'gym schedule',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Spotter — Your gym, at your fingertips',
    description:
      'Check your attendance, membership balance, and gym rules in seconds — without waiting at the front desk.',
    type: 'website',
    url: '/',
    siteName: 'Spotter',
    locale: 'en_US',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Spotter Gym Member Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spotter — Your gym, at your fingertips',
    description:
      'Check your attendance, membership balance, and gym rules in seconds — without waiting at the front desk.',
    images: ['/hero-bg.jpg'],
  },
}

const FEATURES = [
  {
    icon: '📋',
    title: 'Class & timetable lookup',
    desc: "Instantly find when your next class starts. Spotter searches the gym's approved timetable cards and surfaces the exact time, date last confirmed, and class type.",
  },
  {
    icon: '🔒',
    title: 'My private records',
    desc: 'Check your own attendance log and membership balance. Your data is fetched by your member ID only — never shared with or visible to other members.',
  },
  {
    icon: '✅',
    title: 'Digital check-in',
    desc: 'Scan the daily desk code to record your visit. Spotter enforces one check-in per four-hour window and builds a timestamped log you can review any time.',
  },
  {
    icon: '💳',
    title: 'Membership renewal',
    desc: 'Renew your membership with a single tap through a secure Nigerian payment gateway. Every successful payment generates a verifiable reference code.',
  },
  {
    icon: '🤖',
    title: 'Ask the gym',
    desc: 'Type any question about rules, policies, or schedules. Spotter retrieves answers exclusively from approved gym cards — it never invents or searches the web.',
  },
  {
    icon: '💬',
    title: 'Ask the desk',
    desc: "If Spotter can't answer, it opens a direct WhatsApp link to front desk staff — so you always have a fast fallback path.",
  },
]

const HOW_STEPS = [
  {
    num: '01',
    title: 'Get your activation code',
    desc: 'Ask any staff member at the front desk. They generate a one-time code tied to your membership.',
  },
  {
    num: '02',
    title: 'Link this device',
    desc: 'Enter the code on this phone. Set a 4-digit PIN. Your device is now the single trusted entry point to your records.',
  },
  {
    num: '03',
    title: 'Use it every visit',
    desc: 'Check in with the daily desk code, check your balance, ask about the schedule — all without waiting.',
  },
]

/**
 * Root landing page (Phase 1).
 *
 * Signed-in members are redirected to /member immediately.
 * Unauthenticated visitors see the marketing landing page with
 * sign-in / sign-up entry points surfacing the modal.
 *
 * All database access is server-side only (getSession reads a
 * signed HTTP-only cookie). No client components touch the database.
 */
export default async function LandingPage() {
  // Redirect existing sessions away from the marketing page.
  if (await getSession()) redirect('/member')

  const year = new Date().getFullYear()

  return (
    <>
      {/* ── Navigation ── */}
      <header>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="/" className={styles.navBrand} aria-label="Spotter home">
            <div className={styles.navLogo} aria-hidden="true">
              <span className={styles.navLogoLetter}>S</span>
            </div>
            <span className={styles.navBrandName}>Spotter</span>
          </a>
          {/* Client island: sign-in / sign-up buttons + modal */}
          <NavActions />
        </nav>
      </header>

      <main id="main-content" className={styles.main}>
        {/* ── Full-page animated striped abstract background ── */}
        <div className={styles.pageStripesContainer} aria-hidden="true">
          <div className={styles.pageStripesBg} />
          <div className={styles.pageStripesLightBeams} />
          <div className={styles.pageStripesOverlay} />
        </div>

        {/* ── Hero ── */}
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroBg} aria-hidden="true" />
          <div className={styles.heroOverlay} aria-hidden="true" />

          <div className={styles.heroContent}>
            <div className={styles.heroBadge} aria-hidden="true">
              <span className={styles.heroBadgeDot} />
              Private member access
            </div>

            <h1 id="hero-heading" className={styles.heroTitle}>
              Your gym,{' '}
              <span className={styles.heroTitleAccent}>
                at your fingertips
              </span>
            </h1>

            <p className={styles.heroSubtitle}>
              Check your attendance, membership balance, and gym rules in
              seconds — without waiting at the front desk.
            </p>

            {/* Client island: hero CTA + modal */}
            <HeroActions />
          </div>

          <div className={styles.heroScroll} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M4 9l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Scroll
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className={styles.stats} aria-label="Key metrics">
          <div className={styles.statsInner}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>80%</span>
              <span className={styles.statLabel}>
                fewer front desk interruptions targeted in month one
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>3s</span>
              <span className={styles.statLabel}>
                target answer time for any member question
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>
                answers grounded in approved gym records — no invention
              </span>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section
          className={styles.features}
          aria-labelledby="features-heading"
        >
          <div className={styles.featuresInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>What you can do</span>
              <h2 id="features-heading" className={styles.sectionTitle}>
                Everything you need, nothing you don't
              </h2>
              <p className={styles.sectionSubtitle}>
                Spotter is focused. It answers your questions, records your
                visits, and keeps your membership current.
              </p>
            </div>

            <ul className={styles.featureGrid} aria-label="Feature list">
              {FEATURES.map((f) => (
                <li key={f.title} className={styles.featureCard}>
                  <div
                    className={styles.featureIconWrap}
                    aria-hidden="true"
                  >
                    {f.icon}
                  </div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className={styles.how} aria-labelledby="how-heading">
          <div className={styles.howInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Getting started</span>
              <h2 id="how-heading" className={styles.sectionTitle}>
                Three steps to your first check-in
              </h2>
            </div>

            <ol className={styles.howSteps} aria-label="Onboarding steps">
              {HOW_STEPS.map((step) => (
                <li key={step.num} className={styles.howStep}>
                  <div className={styles.howNumber} aria-hidden="true">
                    {step.num}
                  </div>
                  <h3 className={styles.howStepTitle}>{step.title}</h3>
                  <p className={styles.howStepDesc}>{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CTA band ── */}
        <section className={styles.cta} aria-labelledby="cta-heading">
          <h2 id="cta-heading" className={styles.ctaTitle}>
            Ready to skip the queue?
          </h2>
          <p className={styles.ctaSubtitle}>
            Ask any staff member for your activation code and link your device
            in under two minutes.
          </p>
          {/* Client island: CTA buttons + modal */}
          <CtaActions />
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.navLogo} aria-hidden="true">
            <span className={styles.navLogoLetter}>S</span>
          </div>
          <span className={styles.footerCopy}>
            © {year} Spotter. Private member access only.
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
    </>
  )
}
