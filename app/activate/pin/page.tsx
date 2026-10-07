import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * Legacy PIN route.
 * Redirects to the unified auth page with the PIN setup view active.
 */
export default function LegacySetPinPage() {
  redirect('/auth?view=pin')
}
