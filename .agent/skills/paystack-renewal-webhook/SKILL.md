---
name: paystack-renewal-webhook
description: Step by step procedure for generating membership payment payloads, verifying Paystack webhook signatures, checking reference idempotency, and executing balance updates.
---

# Paystack Renewal Webhook Procedure

Execute this procedure when implementing or modifying payment checkout generation, webhook verification, and membership balance updates.

## Step 1: Calculate Fee and Checkout Total
Fetch the member renewal fee or outstanding balance. Follow `rules/pricing.md` for fee calculation formulas and fee absorption toggles.

## Step 2: Create Pending Attempt Record
Insert a row into `PaymentAttempt` table with status `PENDING` and a unique reference string. Follow `rules/schema.md` for table fields.

## Step 3: Launch Gateway Checkout Modal
Pass the total amount in kobo, member email, and reference to the client component to initialize Paystack inline checkout. Follow `rules/environment.md` for public key access.

## Step 4: Receive Webhook Event
Listen for POST requests at `/api/webhooks/paystack`.

## Step 5: Verify Webhook Signature
Extract `x-paystack-signature` header from request. Compute HMAC SHA512 signature using request body. Follow `rules/environment.md` for secret key references. Reject request if signature fails verification.

## Step 6: Check Reference Idempotency
Query `PaymentAttempt` using event payload reference. If status is already `CONFIRMED`, return HTTP 200 immediately to prevent duplicate processing.

## Step 7: Execute Transactional Balance Updates
Execute a Prisma database transaction. Update `Member.expiryDate`, update `Member.currentBalance`, insert a `Payment` record, and set `PaymentAttempt.status` to `CONFIRMED`.

## Step 8: Return Client Receipt
Client component polls database or receives status notification to render payment receipt with reference and updated expiry date.
