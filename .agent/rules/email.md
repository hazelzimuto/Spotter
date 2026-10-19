---
trigger: glob
globs: lib/email/**, app/**
---

# Email Rules

## Job
Define email delivery standards, transport configuration, and transactional template guidelines for Spotter.

## Rules and Reasons

### Rule 1
All outgoing email communications must route exclusively through `nodemailer` via `lib/email/mailer.ts`.
**Reason**: Consolidates mail transport logic, credentials parsing, and fallback handling in a single auditable module, preventing fragmented third-party SDK dependencies.

### Rule 2
Email sending must be executed asynchronously without blocking synchronous Next.js Server Action redirects or HTTP responses.
**Reason**: Network delays or SMTP latency must never freeze the UI or degrade the member's sign-up or check-in experience.

### Rule 3
Transactional email templates must render responsive HTML with a fallback plain-text version, consuming Spotter brand styling and Aurora design tokens.
**Reason**: Guarantees consistent typography and accessibility across varied email clients (desktop, mobile, text-only readers).

### Rule 4
In development or when SMTP credentials are unset, the mailer must log outgoing message payloads cleanly to the console rather than throwing uncaught exceptions.
**Reason**: Prevents developer friction and local development breakages when developers work offline or without SMTP credentials configured.
