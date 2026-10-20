import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession, destroySession } from '@/lib/auth/session'
import { EmailVerificationBanner } from '@/components/member/email-verification-banner'
import styles from './member.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Member Portal',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function MemberPage() {
  const session = await getSession()
  if (!session) {
    redirect('/api/auth/clear-session')
  }

  async function handleSignOut() {
    'use server'
    await destroySession()
    redirect('/')
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.heading}>
          Spotter Member Portal
        </h1>
        <form action={handleSignOut}>
          <button type="submit" className={styles.signOutBtn}>
            Sign Out
          </button>
        </form>
      </header>

      {session.email && !session.emailVerified && (
        <EmailVerificationBanner
          email={session.email}
          initialVerified={session.emailVerified}
        />
      )}

      <section className={styles.statusCard}>
        <p className={styles.cardSubtext}>
          Logged in as
        </p>
        <p className={styles.memberName}>
          {session.fullName}
        </p>
        <span className={styles.tierBadge}>
          {session.tier} Member
        </span>
      </section>
    </main>
  )
}
