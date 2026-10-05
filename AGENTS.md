# spotter

## Description
Spotter is a private web application that gym members use to retrieve their own attendance, membership balance, and the gym's rules without waiting at the front desk. It serves members directly while keeping staff out of the app entirely. It refuses to answer questions about other members, medical advice, real-time status, refunds, waivers, discounts, cancellations, staff conduct, or financial commitments on behalf of the gym, overriding any retrieved records.

## Who uses it
- Member: The member is the only user of the app.
- Owner: The gym owner is a record supplier who uses a web interface to approve shared cards, set member tiers, record opening balances, toggle payment fee absorption, and review wrong answers.
- Staff: Desk staff are record suppliers who use a web interface to draft shared cards, generate activation codes, log manual payments, look up member statuses, and set the daily check in code.

## One thing that the agent must do well
Ground every answer exclusively in approved records and enforce safety refusal rules without inventing answers or searching the internet.

## Defined Scope for the MVP
- Landing page: Public marketing page at the root route (/). Unauthenticated visitors see feature highlights, a sign-in modal (PIN entry), and a sign-up path that routes to /activate. Authenticated members are immediately redirected to /member.
- Ask about the gym: Retrieve approved shared cards for general gym questions using vector search pre-filtered strictly by member tier.
- My records: Retrieve private attendance and balance history by direct database query filtering strictly by member identifier, bypassing vector search completely.
- Check in: Record attendance using the daily desk code, enforcing a maximum of one check-in per four-hour window.
- Pay: Process membership renewals through the payment gateway where database updates occur strictly via verified webhook endpoints using transaction reference idempotency.
- Ask the desk: Provide a WhatsApp fallback link for unanswerable questions or rule violations.
- Member auth and identity: Support single device activation via staff activation code and PIN setup, requiring staff force-unlink to register a new device.
- Owner screens: Web interface for card approvals with transactional vector rollback on embedding failure, member tier and balance management, log reviews, manual payment reference verification, and fallback settings.
- Staff screens: Web interface for drafting cards, setting daily check in codes, generating activation codes, logging manual check-ins, recording cash/transfer/POS payments, looking up member status, and force-unlinking devices.
- Caching and offline behavior: Cache member status and shared cards locally to display cached data when offline.

## Not in scope items for the MVP
- Replacing the gym management system for accounting or staff payroll.
- Social network or community forum features.
- Automated push notifications and proactive reminders.
- Guest registration.
- Written training plans and trainer guidance.
- SMS one time codes.
- Content gap analysis.
- Churn prediction.

## Stack
- Next JS
- Typescript
- Prisma
- PostgreSQL
- Paystack for payments
- PGVector for vector data
- Gemini Free tier

## Folder map
- app/: Next JS App Router pages and Server Actions for member, owner, and staff interfaces.
  - app/page.tsx: Public landing page. Redirects authenticated sessions to /member. Imports client islands from components/landing/.
  - app/landing.module.css: Styles for the landing page. Consumes Aurora design system tokens only.
  - app/page.module.css: Archived Phase 0 placeholder styles. Retained for reference only.
  - app/activate/: FR-6 device activation flow (activation code entry → PIN setup).
  - app/member/: Member home and sub-routes (ask, records, check-in, pay).
  - app/owner/: Owner web interface routes.
  - app/staff/: Staff web interface routes.
- components/auth/: Shared auth shell, activation code form, PIN form, and sign-in modal.
  - components/auth/sign-in-modal.tsx: Client component. Sign-in tab (PIN entry stub) and sign-up tab (routes to /activate).
  - components/auth/auth-shell.tsx: Full-height centered shell used by /activate and /activate/pin.
- components/landing/: Client islands for the landing page.
  - components/landing/landing-client.tsx: Three client islands (NavActions, HeroActions, CtaActions) that own modal open state so page.tsx stays a Server Component.
- prisma/: Prisma ORM schema definition file.
- rules/: External documentation holding schema details, SQL queries, thresholds, dimensions, pricing, and environment configurations.
- public/: Static assets and media files.
  - public/hero-bg.jpg: Landing page hero background image.

## How to work in this codebase
- Make one change at a time.
- Ask before adding packages.
- Never execute raw SQL commands or schema migrations directly; access data exclusively through Prisma ORM within Next JS Server Actions.
- List assumptions at the end of every response.
- Stop and ask when the PRD is silent about anything.

## Where the detailed rules live
- rules/schema.md: Holds database models, fields, types, and relations.
- rules/sql.md: Holds raw SQL queries, database extensions, and index definitions.
- rules/thresholds.md: Holds similarity thresholds, rates, limits, and time windows.
- rules/dimensions.md: Holds vector embedding dimensions and model vector configurations.
- rules/pricing.md: Holds membership costs, payment gateway fee options, and running cost estimates.
- rules/environment.md: Holds environment variable names and API key configurations.

## Definitions
- Tier: A member classification level that determines access rights to shared cards and features.
- Record: Confidential database data (attendance/balance) linked strictly to a member ID, distinct from an approved Shared Card.
- Chunk: A single unit of text passed to the embedding model, defined in Spotter as the full content of an approved card without splitting.
- Shared Card: An approved gym document containing general information accessible to members based on tier.
- Private Record: Confidential data containing member specific attendance or payment balances.
- Activation Code: A one time credential generated by staff to link a member device to a member identifier.
- Daily Code: A four digit number set by staff on the gym whiteboard for member check in validation.
- Landing Page: The public marketing page at the root route (/). It is visible only to unauthenticated visitors. It describes Spotter's features and provides sign-in and sign-up entry points. It does not display any member data.
- Client Island: A small React client component embedded inside a Server Component page that isolates client-side state (e.g., modal open/close). Used on the landing page to avoid making the whole page a client component.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
