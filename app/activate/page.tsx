import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * Legacy activation route.
 * Redirects to the unified auth page with the activation view active.
 */
export default function LegacyActivatePage() {
  redirect('/auth?view=activate')
}
