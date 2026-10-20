import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Welcome to Spotter | Onboarding',
  description: 'Quick guide to using Spotter for check-ins, gym rules, and membership records.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OnboardingPage() {
  const session = await getSession()
  if (!session) {
    redirect('/auth?view=signin')
  }

  const firstName = session.fullName.split(' ')[0] || 'Member'

  return <OnboardingFlow firstName={firstName} />
}
