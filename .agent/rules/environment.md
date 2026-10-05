---
trigger: glob
globs: .env, .env.example
---

# Environment Rules

## Job
Define environment variable names, secret access rules, and startup key validation.

## Rules and Reasons

### Rule 1
Server credentials `DATABASE_URL`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`, `GEMINI_API_KEY`, and `OPENAI_API_KEY` must never be prefixed with `NEXT_PUBLIC_`.
**Reason**: Exposing server credentials to the browser allows unauthorized access to database infrastructure and third party APIs.

### Rule 2
Client credential `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` must be prefixed with `NEXT_PUBLIC_`.
**Reason**: Next JS requires this prefix to make the key accessible to browser client components opening the checkout modal.

### Rule 3
Server Actions must validate that all required environment variables exist during startup execution.
**Reason**: Missing API keys cause silent runtime failures during payment handling or vector search operations.
