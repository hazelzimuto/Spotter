---
trigger: glob
---

# Architecture Rules

## Job
Define application layer boundaries and application layer data isolation rules.

## Rules and Reasons

### Rule 1
Client UI components must trigger Server Actions for all data fetches and data mutations.
**Reason**: Direct client database calls risk exposing database credentials and bypassing server authentication routines.

### Rule 2
Every Server Action querying private models (`Attendance`, `Payment`, `PaymentAttempt`, `QuestionLog`) must extract `memberId` from the verified session cookie and append `where: { memberId: session.memberId }`.
**Reason**: Application layer filtering prevents members from viewing or altering another member's private data.

### Rule 3
All database reads and writes must pass through Prisma ORM within Next JS Server Actions.
**Reason**: Bypassing the ORM creates untracked schema drift and unhandled SQL injection vulnerabilities.
