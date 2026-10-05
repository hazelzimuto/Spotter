import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { ActivationCodeForm } from '@/components/auth/activation-code-form'
import { getSession } from '@/lib/auth/session'
import styles from '@/components/auth/auth.module.css'

// Reads the session cookie, so this route is per-request rather than static.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Link Your Device',
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * FR-6, steps 1-3: "The app asks for an activation code."
 *
 * .agent/rules/architecture.md rule 1: the page reads the session server-side
 * and the form posts to a Server Action. No database call from the client.
 */
export default async function ActivatePage() {
  // A member who is already linked should never see the activation code form.
  if (await getSession()) redirect('/')

  return (
    <AuthShell
      title="Link your device"
      description="Enter the activation code from the front desk to connect this phone to your membership."
      footnote={
        <span className={styles.badge}>One member, one device</span>
      }
    >
      <ActivationCodeForm />
    </AuthShell>
  )
}
