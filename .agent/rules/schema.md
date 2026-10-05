---
trigger: glob
globs: prisma/**
---

# Schema Rules

## Job
Define Prisma ORM data models, field types, default values, and relational structures.

## Rules and Reasons

### Rule 1
`Member` model stores `openingBalance` and `currentBalance` as integer values in kobo units.
**Reason**: Floating point numbers introduce rounding errors in financial transactions and balance tracking.

### Rule 2
`Member` model fields `activationCode`, `pinHash`, and `deviceId` must be nullable.
**Reason**: Unactivated members created by staff do not possess device credentials until initial setup.

### Rule 3
`Attendance` model links strictly to `memberId` with a mandatory `checkInAt` timestamp.
**Reason**: Attendance history requires explicit member attribution and chronological sorting.

### Rule 4
`Payment` model mandates a unique string `reference` field.
**Reason**: Unique references prevent processing duplicate payment ledger records.

### Rule 5
`PaymentAttempt` model tracks `status` using `PaymentStatus` enum (`PENDING`, `CONFIRMED`, `FAILED`).
**Reason**: Payment status must follow a strict finite state machine during gateway webhooks.

### Rule 6
`Card` model contains boolean `isApproved` and `requiredTier` enum (`BASIC`, `PREMIUM`).
**Reason**: Drafted cards must remain hidden from search queries until approved by the owner for a tier.

### Rule 7
`CardVersion` model includes an optional `embedding` column defined as `Unsupported("vector(1536)")?`.
**Reason**: Vector embeddings are stored per version to preserve historical document revisions.

### Rule 8
`CheckInCode` model mandates a unique `date` timestamp field.
**Reason**: Only one active whiteboard check in code exists per calendar day.

### Rule 9
`Staff` model includes boolean `isFallback`.
**Reason**: Identifies the specific staff member whose contact details appear in WhatsApp fallback links.
