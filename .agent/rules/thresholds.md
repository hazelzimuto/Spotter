# Thresholds Rules

## Job
Define numerical operational cutoffs, frequency windows, grace periods, code formats, and quota limits.

## Rules and Reasons

### Rule 1
Vector search cosine distance cutoff is set to `0.25` (minimum cosine similarity `0.75`).
**Reason**: Distance results above 0.25 indicate low semantic relevance and must trigger fallback to prevent hallucinations.

### Rule 2
Check in suppression window is set to a maximum of 1 check in per `4 hours`.
**Reason**: Prevents members from submitting duplicate check ins during a single workout session.

### Rule 3
Pending payment grace period is set to `48 hours`.
**Reason**: Grants temporary access while delayed gateway webhooks confirm payment status.

### Rule 4
Daily whiteboard check in code and authentication PIN must be exactly `4 digits`.
**Reason**: Uniform four digit numeric codes ensure fast input on mobile keypads.

### Rule 5
Gemini free tier requests must not exceed `15 requests per minute`.
**Reason**: Exceeding Gemini rate limits returns HTTP 429 errors and halts application responses.

### Rule 6
Form submission rate limit is set to a maximum of `5 requests` per client IP address across a `5 to 10 minute` sliding window.
**Reason**: Protects authentication endpoints, database resources, and computationally expensive bcrypt hashing against automated brute-force attacks and denial-of-service attempts.

### Rule 7
Email verification code must be exactly `6 digits` generated using cryptographically secure `randomBytes`, valid for `24 hours`. Code verification attempts are limited to `5 attempts per 10 minutes` and resends to `3 per 10 minutes` with a `60-second` client cooldown.
**Reason**: Provides a uniform, zero-bias numeric token for quick member entry while preventing brute-force code enumeration and email dispatch abuse.

