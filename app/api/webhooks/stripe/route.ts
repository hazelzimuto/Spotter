import { NextResponse, type NextRequest } from 'next/server'
import { confirmSubscriptionPayment } from '@/lib/payments/stripe'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

/**
 * Stripe Webhook Handler for UK Subscription Renewals.
 * Receives asynchronous webhook events directly from Stripe.
 *
 * Implements transaction reference idempotency and authoritative
 * database updates strictly on webhook confirmation.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    let event: Stripe.Event

    if (webhookSecret && signature && stripeSecretKey) {
      try {
        const StripeModule = (await import('stripe')).default
        const stripe = new StripeModule(stripeSecretKey)
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
      } catch (err) {
        console.warn('Stripe webhook signature validation failed:', err)
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
      }
    } else {
      event = JSON.parse(rawBody) as Stripe.Event
    }

    // Handle completed checkout session
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const reference = session.client_reference_id
      const memberId = session.metadata?.memberId
      const planId = session.metadata?.planId

      if (reference && memberId) {
        await confirmSubscriptionPayment({
          reference,
          memberId,
          planId,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Error handling Stripe webhook:', err)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }
}
