'use client'

/**
 * LandingClient — islands of interactivity for the landing page.
 *
 * Keeps the parent page.tsx as a Server Component by isolating
 * all client-side state (modal open/closed, active tab) here.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { LegalView, type LegalViewType } from '@/components/landing/legal-view'
import styles from '@/app/landing.module.css'

export function NavActions() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  function openSignIn() { setTab('signin'); setOpen(true) }
  function openSignUp() { setTab('signup'); setOpen(true) }

  return (
    <>
      <nav className={styles.navActions} aria-label="Authentication actions">
        <button id="nav-sign-in-btn" className={styles.navSignIn} onClick={openSignIn}>
          Sign in
        </button>
        <button id="nav-sign-up-btn" className={styles.navSignUp} onClick={openSignUp}>
          Get started
        </button>
      </nav>

      {open && (
        <SignInModal
          initialTab={tab}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

export function HeroActions() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  function openSignUp() { setTab('signup'); setOpen(true) }
  function openSignIn() { setTab('signin'); setOpen(true) }

  return (
    <>
      <div className={styles.heroActions}>
        <button id="hero-get-started-btn" className={styles.heroCta} onClick={openSignUp}>
          Get started — it's free
        </button>
        <button id="hero-sign-in-btn" className={styles.heroSecondary} onClick={openSignIn}>
          Sign in
        </button>
      </div>

      {open && (
        <SignInModal
          initialTab={tab}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

export function CtaActions() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  function openSignUp() { setTab('signup'); setOpen(true) }
  function openSignIn() { setTab('signin'); setOpen(true) }

  return (
    <>
      <div className={styles.ctaActions}>
        <button id="cta-get-started-btn" className={styles.ctaButton} onClick={openSignUp}>
          Get started
        </button>
        <button id="cta-sign-in-btn" className={styles.ctaSignIn} onClick={openSignIn}>
          Already a member? Sign in
        </button>
      </div>

      {open && (
        <SignInModal
          initialTab={tab}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

export function FooterLegal() {
  const [legalView, setLegalView] = useState<LegalViewType | null>(null)

  useEffect(() => {
    function checkUrl() {
      if (typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      const viewParam = params.get('view')
      const hash = window.location.hash.replace('#', '')

      if (viewParam === 'privacy' || hash === 'privacy') {
        setLegalView('privacy')
      } else if (viewParam === 'terms' || hash === 'terms') {
        setLegalView('terms')
      } else {
        setLegalView(null)
      }
    }

    checkUrl()
    window.addEventListener('popstate', checkUrl)
    return () => window.removeEventListener('popstate', checkUrl)
  }, [])

  function openView(view: LegalViewType) {
    setLegalView(view)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', view)
      window.history.pushState(null, '', url.toString())
    }
  }

  function closeView() {
    setLegalView(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('view')
      const nextUrl = url.pathname + (url.search ? url.search : '')
      window.history.pushState(null, '', nextUrl)
    }
  }

  return (
    <>
      <nav className={styles.footerLinks} aria-label="Legal links">
        <button
          type="button"
          id="footer-privacy-btn"
          className={styles.footerLink}
          onClick={() => openView('privacy')}
        >
          Privacy Policy
        </button>
        <span className={styles.footerSeparator} aria-hidden="true">
          •
        </span>
        <button
          type="button"
          id="footer-terms-btn"
          className={styles.footerLink}
          onClick={() => openView('terms')}
        >
          Terms of Service
        </button>
      </nav>

      {legalView && (
        <LegalView
          activeView={legalView}
          onSwitchView={(v) => openView(v)}
          onClose={closeView}
        />
      )}
    </>
  )
}

