import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession, destroySession } from '@/lib/auth/session'
import { db, hasDatabaseUrl } from '@/lib/db'
import { findDevMemberById } from '@/lib/auth/dev-store'
import { MemberDashboard } from '@/components/member/member-dashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Spotter Member Portal | UK Subscriptions',
  description: 'Manage gym membership, renew subscriptions via Stripe, and track attendance records.',
  robots: {
    index: false,
    follow: false,
  },
}

interface MemberPageProps {
  searchParams: Promise<{
    payment?: string
    ref?: string
    plan?: string
  }>
}

export default async function MemberPage({ searchParams }: MemberPageProps) {
  const session = await getSession()
  if (!session) {
    redirect('/api/auth/clear-session')
  }

  const params = await searchParams
  const paymentStatus = params.payment
  const paymentRef = params.ref
  const planId = params.plan

  // Authoritative confirmation when returning from successful Stripe Checkout
  if (paymentStatus === 'success' && paymentRef) {
    const { confirmSubscriptionPayment } = await import('@/lib/payments/stripe')
    await confirmSubscriptionPayment({
      reference: paymentRef,
      memberId: session.memberId,
      planId,
    })
  }

  async function handleSignOut() {
    'use server'
    await destroySession()
    redirect('/')
  }

  let memberData = {
    id: session.memberId,
    fullName: session.fullName,
    email: session.email,
    memberNumber: null as string | null,
    tier: session.tier,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    currentBalance: 0,
    openingBalance: 0,
  }

  let payments: Array<{
    id: string
    amount: number
    reference: string
    createdAt: string
    method: string
  }> = []

  let recentVisitsCount = 0

  const isDevMember = session.memberId.startsWith('dev-mem-')

  if (hasDatabaseUrl && !isDevMember) {
    try {
      const dbMember = await db.member.findUnique({
        where: { id: session.memberId },
        include: {
          payments: { orderBy: { createdAt: 'desc' }, take: 10 },
          attendances: { take: 50 },
        },
      })

      if (dbMember) {
        memberData = {
          id: dbMember.id,
          fullName: dbMember.fullName,
          email: dbMember.email,
          memberNumber: dbMember.memberNumber,
          tier: dbMember.tier,
          expiryDate: dbMember.expiryDate.toISOString(),
          currentBalance: dbMember.currentBalance,
          openingBalance: dbMember.openingBalance,
        }

        payments = dbMember.payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          reference: p.reference,
          createdAt: p.createdAt.toISOString(),
          method: p.method,
        }))

        recentVisitsCount = dbMember.attendances.length
      }
    } catch (err) {
      console.warn('Database member read failed, falling back to session:', err)
    }
  } else {
    const devMember = findDevMemberById(session.memberId)
    if (devMember) {
      memberData = {
        id: devMember.id,
        fullName: devMember.fullName,
        email: devMember.email || null,
        memberNumber: devMember.memberNumber || null,
        tier: devMember.tier,
        expiryDate: devMember.expiryDate.toISOString(),
        currentBalance: 0,
        openingBalance: 0,
      }
    }
  }

  return (
    <main>
      <MemberDashboard
        member={memberData}
        payments={payments}
        recentVisitsCount={recentVisitsCount}
        onSignOut={handleSignOut}
        initialPaymentSuccessRef={paymentStatus === 'success' ? paymentRef : null}
        initialPaymentCancelled={paymentStatus === 'cancelled'}
      />
    </main>
  )
}
