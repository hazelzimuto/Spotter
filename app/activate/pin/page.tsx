import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { PinForm } from '@/components/auth/pin-form'
import { getSession } from '@/lib/auth/session'
import { getPendingActivation } from '@/lib/auth/pending-activation'
import styles from '@/components/auth/auth.module.css'

// Reads the session cookie, so this route is per-request rather than static.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Set Your PIN',
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * FR-6, step 4: "The app asks the member to set a four digit PIN."
 *
 * Reachable only after a validated activation code (carried in the pending
 * activation cookie), so navigating here directly bounces back to step 1.
 */
export default async function SetPinPage() {
  if (await getSession()) redirect('/')
  if (!(await getPendingActivation())) redirect('/activate')

  return (
    <AuthShell
      title="Choose your PIN"
      description="Pick a 4-digit PIN for this device. Staff can unlink it if you ever need to switch phones."
      footnote={<span className={styles.badge}>Step 2 of 2</span>}
    >
      <PinForm />
    </AuthShell>
  )
}
