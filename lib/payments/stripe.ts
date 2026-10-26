import fs from 'node:fs'
import path from 'node:path'
import { db, hasDatabaseUrl } from '@/lib/db'
import {
  findDevMemberById,
  saveDevMember,
} from '@/lib/auth/dev-store'

/** Reads STRIPE_SECRET_KEY from memory or directly from .env if server has not reloaded. */
export function getStripeSecretKey(): string | undefined {
  if (process.env.STRIPE_SECRET_KEY) {
    return process.env.STRIPE_SECRET_KEY
  }

  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const match = content.match(/STRIPE_SECRET_KEY=["']?([^"'\r\n]+)["']?/)
      if (match && match[1]) {
        process.env.STRIPE_SECRET_KEY = match[1].trim()
        return process.env.STRIPE_SECRET_KEY
      }
    }
  } catch (err) {
    console.warn('Could not read .env for STRIPE_SECRET_KEY:', err)
  }

  return undefined
}

/** Reads STRIPE_WEBHOOK_SECRET from memory or directly from .env if server has not reloaded. */
export function getStripeWebhookSecret(): string | undefined {
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    return process.env.STRIPE_WEBHOOK_SECRET
  }

  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const match = content.match(/STRIPE_WEBHOOK_SECRET=["']?([^"'\r\n]+)["']?/)
      if (match && match[1]) {
        process.env.STRIPE_WEBHOOK_SECRET = match[1].trim()
        return process.env.STRIPE_WEBHOOK_SECRET
      }
    }
  } catch (err) {
    console.warn('Could not read .env for STRIPE_WEBHOOK_SECRET:', err)
  }

  return undefined
}

export {
  UK_SUBSCRIPTION_PLANS,
  formatGbp,
  calculateUkVat,
  type SubscriptionPlan,
} from './plans'
import { UK_SUBSCRIPTION_PLANS } from './plans'

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
  const stripeSecretKey = getStripeSecretKey()

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

  // 2. If Stripe Secret Key is available, create native Stripe Checkout Session via official SDK
  if (stripeSecretKey) {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(stripeSecretKey)

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        client_reference_id: reference,
        customer_email: email || undefined,
        success_url: `${origin}/member?payment=success&ref=${reference}&plan=${plan.id}`,
        cancel_url: `${origin}/member?payment=cancelled`,
        metadata: {
          memberId,
          planId: plan.id,
          tier: plan.tier,
          interval: plan.interval,
        },
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              unit_amount: plan.pricePence,
              product_data: {
                name: `Spotter ${plan.name}`,
                description: plan.description,
              },
            },
            quantity: 1,
          },
        ],
      })

      if (!session.url) {
        return {
          success: false,
          reference,
          error: 'Stripe did not return a valid checkout session URL.',
        }
      }

      return {
        success: true,
        url: session.url,
        reference,
      }
    } catch (err: unknown) {
      console.error('Stripe SDK checkout call failed:', err)
      const message = err instanceof Error ? err.message : 'Stripe checkout initialization failed.'
      return {
        success: false,
        reference,
        error: message,
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
