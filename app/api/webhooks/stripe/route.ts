import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { confirmSubscriptionPayment } from '@/lib/payments/stripe'

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

    // Signature verification if webhook secret is configured
    if (webhookSecret && signature) {
      const parts = signature.split(',')
      const timestampPart = parts.find((p) => p.startsWith('t='))
      const signaturePart = parts.find((p) => p.startsWith('v1='))

      if (!timestampPart || !signaturePart) {
        return NextResponse.json({ error: 'Invalid Stripe signature format' }, { status: 400 })
      }

      const timestamp = timestampPart.replace('t=', '')
      const expectedSig = signaturePart.replace('v1=', '')
      const signedPayload = `${timestamp}.${rawBody}`

      const hmac = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex')

      if (hmac !== expectedSig) {
        console.warn('Stripe webhook signature mismatch rejected')
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
      }
    }

    const event = JSON.parse(rawBody)

    // Handle completed checkout session
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
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
