import { db, hasDatabaseUrl } from '@/lib/db'
import {
  findDevMemberById,
  saveDevMember,
} from '@/lib/auth/dev-store'

export interface SubscriptionPlan {
  id: string
  name: string
  tier: 'BASIC' | 'PREMIUM'
  pricePounds: number
  pricePence: number
  interval: 'month' | 'year'
  badge?: string
  description: string
  features: string[]
}

/**
 * UK Gym Subscription Plans (GBP / Pence)
 * Inclusive of standard UK 20% VAT.
 */
export const UK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic Monthly',
    tier: 'BASIC',
    pricePounds: 35,
    pricePence: 3500,
    interval: 'month',
    description: 'Full access to gym floor, cardio equipment, and standard locker facilities.',
    features: [
      'Full gym floor & free weights access',
      'Cardio suite & functional turf area',
      'Locker rooms & shower facilities',
      'Spotter digital check-in & attendance tracking',
      'Standard opening hours (6am – 10pm)',
    ],
  },
  {
    id: 'premium-monthly',
    name: 'Premium All-Access',
    tier: 'PREMIUM',
    pricePounds: 55,
    pricePence: 5500,
    interval: 'month',
    badge: 'MOST POPULAR',
    description: 'Unlimited 24/7 access, boutique studio classes, Finnish sauna & guest passes.',
    features: [
      'Everything in Basic included',
      '24/7 keyless digital door entry',
      'Unlimited boutique classes (HIIT, Yoga, Spin)',
      'Finnish sauna & recovery lounge access',
      '1 complimentary monthly guest pass',
      'Priority access to approved gym cards & records',
    ],
  },
  {
    id: 'premium-annual',
    name: 'Annual VIP Pass',
    tier: 'PREMIUM',
    pricePounds: 550,
    pricePence: 55000,
    interval: 'year',
    badge: 'SAVE £110',
    description: 'Commit to your year of fitness with 2 months free and complimentary gym kit.',
    features: [
      'All Premium All-Access features for 12 months',
      'Pay for 10 months, get 2 months completely free',
      'Complimentary Spotter premium shaker & towel',
      'Dedicated locker reservation option',
    ],
  },
]

/** Formats an integer amount in British pence into a localized £ GBP currency string. */
export function formatGbp(pence: number): string {
  const pounds = (pence || 0) / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pounds)
}

/** Calculates 20% UK VAT portion included in the gross price. */
export function calculateUkVat(totalPence: number): { netPence: number; vatPence: number } {
  // UK VAT is 20%: gross = net * 1.2 => net = gross / 1.2
  const netPence = Math.round(totalPence / 1.2)
  const vatPence = totalPence - netPence
  return { netPence, vatPence }
}

export type InitiatePaymentResult = {
  success: boolean
  url?: string
  reference: string
  demoMode?: boolean
  message?: string
  error?: string
}

/**
 * Initiates a Stripe payment attempt for a gym subscription in GBP.
 * If STRIPE_SECRET_KEY is configured in the environment, creates an authoritative
 * Stripe Checkout session and returns its redirect URL.
 * Otherwise, records a pending attempt and supports simulation for developer testing.
 */
export async function initiateSubscriptionCheckout({
  memberId,
  email,
  fullName,
  planId,
  origin,
}: {
  memberId: string
  email?: string | null
  fullName: string
  planId: string
  origin: string
}): Promise<InitiatePaymentResult> {
  const plan = UK_SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) {
    return { success: false, reference: '', error: 'Invalid subscription plan selected.' }
  }

  const reference = `sp_stripe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  const isDevMember = memberId.startsWith('dev-mem-')

  // 1. Record pending attempt in PostgreSQL or Dev Store
  if (hasDatabaseUrl && !isDevMember) {
    try {
      await db.paymentAttempt.create({
        data: {
          memberId,
          amount: plan.pricePence,
          reference,
          status: 'PENDING',
        },
      })
    } catch (err) {
      console.warn('Failed to persist payment attempt to DB:', err)
    }
  }

  // 2. If Stripe Secret Key is available, create native Stripe Checkout Session
  if (stripeSecretKey) {
    try {
      const params = new URLSearchParams()
      params.append('payment_method_types[0]', 'card')
      params.append('mode', 'payment')
      params.append('client_reference_id', reference)
      if (email) {
        params.append('customer_email', email)
      }
      params.append('success_url', `${origin}/member?payment=success&ref=${reference}&plan=${plan.id}`)
      params.append('cancel_url', `${origin}/member?payment=cancelled`)

      params.append('metadata[memberId]', memberId)
      params.append('metadata[planId]', plan.id)
      params.append('metadata[tier]', plan.tier)
      params.append('metadata[interval]', plan.interval)

      params.append('line_items[0][price_data][currency]', 'gbp')
      params.append('line_items[0][price_data][unit_amount]', String(plan.pricePence))
      params.append('line_items[0][price_data][product_data][name]', `Spotter ${plan.name}`)
      params.append('line_items[0][price_data][product_data][description]', plan.description)
      params.append('line_items[0][quantity]', '1')

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Stripe API error:', data)
        return {
          success: false,
          reference,
          error: data.error?.message || 'Unable to initialize Stripe checkout session.',
        }
      }

      return {
        success: true,
        url: data.url,
        reference,
      }
    } catch (err) {
      console.error('Stripe checkout call failed:', err)
      return {
        success: false,
        reference,
        error: 'Network failure communicating with Stripe gateway.',
      }
    }
  }

  // 3. Demo / Sandbox Fallback when STRIPE_SECRET_KEY is not yet in .env
  return {
    success: true,
    reference,
    demoMode: true,
    message: 'Stripe Sandbox Ready: Add STRIPE_SECRET_KEY to your environment to enable live Stripe redirects.',
  }
}

/**
 * Transactionally confirms a subscription renewal and updates expiry date & tier.
 * Idempotent: safe against duplicate webhook deliveries or retried receipts.
 */
export async function confirmSubscriptionPayment({
  reference,
  memberId,
  planId,
}: {
  reference: string
  memberId: string
  planId?: string
}): Promise<{ success: boolean; error?: string; newExpiryDate?: Date }> {
  const plan = UK_SUBSCRIPTION_PLANS.find((p) => p.id === planId) || UK_SUBSCRIPTION_PLANS[0]
  const isDevMember = memberId.startsWith('dev-mem-')

  const daysToAdd = plan.interval === 'year' ? 365 : 30

  if (hasDatabaseUrl && !isDevMember) {
    try {
      const attempt = await db.paymentAttempt.findUnique({
        where: { reference },
      })

      if (attempt?.status === 'CONFIRMED') {
        const member = await db.member.findUnique({ where: { id: memberId }, select: { expiryDate: true } })
        return { success: true, newExpiryDate: member?.expiryDate }
      }

      const member = await db.member.findUnique({
        where: { id: memberId },
        select: { expiryDate: true, currentBalance: true },
      })

      if (!member) {
        return { success: false, error: 'Member not found.' }
      }

      // Calculate new expiry date
      const baseDate = member.expiryDate && member.expiryDate > new Date() ? member.expiryDate : new Date()
      const newExpiryDate = new Date(baseDate)
      newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd)

      // Transactionally record payment and update member
      await db.$transaction([
        db.paymentAttempt.upsert({
          where: { reference },
          update: { status: 'CONFIRMED' },
          create: {
            memberId,
            amount: plan.pricePence,
            reference,
            status: 'CONFIRMED',
          },
        }),
        db.payment.create({
          data: {
            memberId,
            amount: plan.pricePence,
            reference,
            method: 'TRANSFER', // Mapped to transfer/card
          },
        }),
        db.member.update({
          where: { id: memberId },
          data: {
            expiryDate: newExpiryDate,
            tier: plan.tier,
            currentBalance: 0,
          },
        }),
      ])

      return { success: true, newExpiryDate }
    } catch (err) {
      console.error('Database transaction failed while confirming payment:', err)
      return { success: false, error: 'Database error confirming payment renewal.' }
    }
  }

  // Dev store fallback
  const devMember = findDevMemberById(memberId)
  if (!devMember) {
    return { success: false, error: 'Dev member not found.' }
  }

  const baseDate = devMember.expiryDate && devMember.expiryDate > new Date() ? devMember.expiryDate : new Date()
  const newExpiryDate = new Date(baseDate)
  newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd)

  devMember.expiryDate = newExpiryDate
  devMember.tier = plan.tier

  return { success: true, newExpiryDate }
}
