import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getPendingActivation } from '@/lib/auth/pending-activation'
import { UnifiedAuthCard, type AuthView } from '@/components/auth/unified-auth-card'
import styles from '@/components/auth/auth.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Member Access | Spotter',
  description: 'Sign in to Spotter or link your mobile device using your activation code.',
  robots: {
    index: false,
    follow: false,
  },
}

interface AuthPageProps {
  searchParams: Promise<{ view?: string }>
}

/**
 * Unified Member Authentication Page.
 *
 * Collapses all auth forms (Sign-in PIN, Activation Code, PIN Setup) into
 * a single accessible page with conditional view rendering.
 */
export default async function AuthPage({ searchParams }: AuthPageProps) {
  // Redirect authenticated members straight to the member portal
  if (await getSession()) {
    redirect('/member')
  }

  const params = await searchParams
  const pendingMemberId = await getPendingActivation()

  let initialView: AuthView = 'signin'

  if (params.view === 'signup') {
    initialView = 'signup'
  } else if (params.view === 'activate') {
    initialView = 'activate'
  } else if (params.view === 'pin' && pendingMemberId) {
    initialView = 'pin'
  } else if (params.view === 'signin') {
    initialView = 'signin'
  } else if (pendingMemberId) {
    // If mid-activation flow, resume at PIN step
    initialView = 'pin'
  }

  return (
    <main className={styles.screen}>
      <UnifiedAuthCard initialView={initialView} />
    </main>
  )
}
