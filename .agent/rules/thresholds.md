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
