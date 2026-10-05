## 1. Product Summary

Spotter is a private web application that gym members use to retrieve their own attendance, membership balance, and the gym's rules without waiting at the front desk. It serves members directly while keeping staff out of the app entirely. It refuses to answer questions about other members, medical conditions, or financial commitments on behalf of the gym. Unlike a general chatbot, Spotter never searches the internet and grounds every answer exclusively in the gym's own approved records.

## 2. Problem

Amara pays her 15,000 naira membership renewal in cash on a Wednesday afternoon. The staff officer writes it in a ledger and hands Amara a handwritten receipt. On Saturday morning, Amara arrives early for the 7am class. A different staff officer is at the desk and cannot find the Wednesday ledger entry. He tells Amara her access card is blocked. Amara shows him the handwritten receipt, but he cannot verify it. Amara argues for four minutes in front of other members. Trust is lost, and Amara does not renew the following month.

## 3. Goals

- Reduce front desk interruptions for routine questions by 80 percent within the first month.
- Ensure 100 percent of active members check in through the app to generate a digital attendance log.
- Shift 30 percent of monthly membership renewals from cash to in-app payments within three months.

### Non Goals

- Do not replace the gym management system for accounting or staff payroll.
- Do not build a social network or community forum for members.
- Do not provide automated push notifications or proactive reminders in version one.

## 4. Users and Personas

The member is the only user of the app. Staff never open the member app.

**Member Persona: Chisom (The User)**
Chisom is 28 and works as an accountant in Lagos. She uses an inexpensive Tecno Spark Android phone. She buys mobile data in small bundles and often has an unreliable power supply. She opens the app 16 times a month. The physical act of arriving at the gym triggers nine of those opens because she must check in. She opens it at other times to check the Saturday class schedule or to see if her membership is due for renewal. She wants answers in three seconds.

**Owner (Record Supplier, Not User)**
The gym owner uses a secure web interface on a laptop. The owner approves all shared cards drafted by staff, sets member tiers, records opening balances, and reviews the weekly log of wrong answers.

**Staff (Record Supplier, Not User)**
The desk staff use a secure web interface. They draft shared cards for the owner to approve, generate activation codes for new members, log manual cash payments, and set the daily check in code on the physical whiteboard. Staff appear to members only as a fallback name when the app cannot answer a question.

## 5. Scope

### In Scope for Version One

- **Feature 1:** Ask about the gym. Lookup shared cards like timetable and rules.
- **Feature 2:** My records. Lookup private attendance and balance history.
- **Feature 3:** Check in. Record a visit using the daily desk code.
- **Feature 4:** Pay. Renew membership via a Nigerian payment gateway.
- **Feature 5:** Ask the desk. Fallback to WhatsApp for unanswerable questions.

### Out of Scope

- **Guest registration.** Desk registration prevents fraud until the gym trusts the app.
- **Written training plans and trainer guidance.** The gym has not written these yet.
- **SMS one time codes.** These cost money per message.
- **Push notifications and automated reminders.** Version one focuses purely on data collection and member lookup.

### Deferred to Version Two

- **Automated renewal reminders.** Version one must collect check in timestamps, expiry dates, and login times to calculate the correct moment to send a reminder.
- **Content gap analysis.** Version one must collect the text of every unanswered question and wrong answer report.
- **Churn prediction.** Version one must collect payment attempt failures and the gap in days between expiry and renewal.

## 6. Functional Requirements

### FR-1: Ask About the Gym
**User Story:** A member types a question about the gym schedule so she can plan her visit.
**Trigger:** The member taps "Ask a question" on the home screen and submits text.
**Flow:** 
1. The app receives the text.
2. The app embeds the text and performs a semantic search against approved shared cards allowed by the member's tier.
3. The app generates a one or two line answer.
4. The app displays the answer, the text of the source card, and the card's last confirmed date.
**Inputs:** Plain text question.
**Outputs:** Text answer, source card text, last confirmed date.
**Empty State:** None. The home screen always shows common tappable questions.
**Error State:** If the network fails, display "Network error. Try again or check the desk."
**Acceptance Criteria:** 
- The answer must cite a shared card explicitly.
- A Basic tier member must not receive answers from Premium tier cards.
- The date the card was last confirmed must be visible.

### FR-2: My Records
**User Story:** A member asks about her attendance or balance to verify her status.
**Trigger:** The member taps a suggested private question or types a private question.
**Flow:**
1. The app identifies the intent as a private record request.
2. The app bypasses the vector search entirely.
3. The app queries the PostgreSQL database filtering strictly by the active member ID.
4. The app returns the raw data.
5. The language model formats the raw data into an answer.
**Inputs:** Member ID (from auth session), intent identifier.
**Outputs:** Formatted private data, date of last confirmation.
**Empty State:** "Your history will appear after your first check in."
**Error State:** "Could not load your records. Check your connection."
**Acceptance Criteria:**
- The app must never search across other members' records.
- Balance answers must state what was paid and when.
- Balance answers must include: "Correct as of [Date]."
- Balance answers must not state "You owe [Amount]." They must state "Our records show [Amount] outstanding."

### FR-3: Check In
**User Story:** A member checks in at the gym to log her attendance.
**Trigger:** The member taps "Check In" and sees a number pad.
**Flow:**
1. The member reads a four digit code from the whiteboard at the desk.
2. The member types the four digit code into the app.
3. The app verifies the code matches the current active daily code.
4. The app writes an attendance record for the member.
5. The app updates the member's cached home screen state.
**Inputs:** Four digit code.
**Outputs:** Success message with total days trained this month.
**Empty State:** Number pad waiting for input.
**Error State:** "Wrong code. Check the whiteboard."
**Acceptance Criteria:**
- The check in must fail if the code does not match the daily code.
- The success screen must show the new total count of visits for the month.
- The system must prevent duplicate check ins within a four hour window. (ASSUMPTION: A member does not train twice within four hours).

### FR-4: Pay
**User Story:** A member pays her renewal fee in the app to avoid the desk queue.
**Trigger:** The member taps "Pay" on the home screen.
**Flow:**
1. The app fetches the member's outstanding balance or renewal fee.
2. The app opens the Paystack checkout modal.
3. The member enters card details and confirms.
4. The app marks the payment attempt as pending in the database.
5. Paystack processes the payment and hits the webhook endpoint on the server.
6. The webhook confirms the payment and updates the member's expiry date and balance.
7. The app polls the database and shows a success receipt when the webhook confirms.
**Inputs:** Payment amount, member email.
**Outputs:** Receipt with reference number and new expiry date.
**Empty State:** "You have no outstanding balances."
**Error State:** "Payment failed. Try again or pay at the desk."
**Acceptance Criteria:**
- The app must never store card details or wallet balances.
- The payment record must only update when the webhook fires. The client response from Paystack must not update the database.
- The system must use the Paystack transaction reference for idempotency to prevent double counting.
- If the member loses network mid payment, the webhook must still update the database and the member must see the receipt on her next login.
- A pending payment must grant a 24 hour grace period before tier expiry.

### FR-5: Ask the Desk
**User Story:** A member asks a question the app cannot answer so she can reach staff directly.
**Trigger:** The semantic search yields no cards above the confidence threshold, or the question hits a refusal rule.
**Flow:**
1. The app halts generation.
2. The app prints: "I do not have that in the gym's records. Please contact [Fallback Staff Name] on [Fallback Staff Phone]."
3. The app displays a "Message [Name] on WhatsApp" button.
4. Tapping the button opens WhatsApp with the question pre filled.
**Inputs:** Unanswerable question text.
**Outputs:** Refusal message, fallback staff name, WhatsApp deep link.
**Empty State:** N/A.
**Error State:** N/A.
**Acceptance Criteria:**
- The app must never invent an answer.
- The app must name the staff member currently set as the fallback in the owner settings.
- The app must refuse outright on: other members, medical advice, real-time door status, refunds, waivers, discounts, cancellations, and staff conduct.

### FR-6: Member Auth and Identity
**User Story:** A member authenticates her device to ensure her private records remain secure.
**Trigger:** The member opens the web app URL for the first time.
**Flow:**
1. The app asks for an activation code.
2. The desk staff generates a one time activation code and hands it to the member.
3. The member types the code.
4. The app asks the member to set a four digit PIN.
5. The app sets a persistent secure cookie linking the device to the member ID.
**Inputs:** Activation code, new PIN.
**Outputs:** Authenticated session.
**Acceptance Criteria:**
- Only one device may be linked to a member at a time.
- Re linking to a new phone requires a new activation code from the desk.
- A session remains active indefinitely until unlinked or logged out.

### FR-7: Owner Screens
**User Story:** The owner manages the system to ensure records are accurate.
**Requirements:**
- A screen to approve or reject drafted shared cards.
- A screen to maintain the member list, including setting tier, expiry date, and opening balance.
- A screen to enter cash and transfer payments manually.
- A screen to view a weekly review page of wrong answer reports and unanswered questions.
- A settings page to update the fallback staff name and phone number.

### FR-8: Staff Screens
**User Story:** Staff maintain daily operations and draft updates.
**Requirements:**
- A screen to draft and edit shared cards for owner approval.
- A screen to set the daily four digit check in code.
- A screen to generate one time activation codes.
- A screen to record a manual check in for a member.

### FR-9: Caching and Offline Behaviour
**Requirements:**
- The app must cache the member's current tier, expiry date, days trained this month, and balance in local storage.
- The app must cache all shared cards allowed by the member's tier in local storage.
- On launch, the app must immediately render the home screen using cached data.
- If the device is offline, the app must display a banner stating "Offline: Showing data from [Date]."
- Private record queries must fail gracefully with a network error when offline.

### Tier Access Table

| Tier | Access Rules | On Expiry (After 3 day grace) |
| :--- | :--- | :--- |
| Basic | Timetable, prices, rules, access hours, guest policy, private records, check in, pay | Loses check in. Keeps prices, timetable, private history, receipts, pay button. |
| Premium | Everything in Basic, plus written training plans and trainer guidance (v2) | Loses Premium cards. Drops to Expired Basic state. |

## 7. AI and AI Related Tools and Solutions

**Language Model:** Google Gemini 1.5 Flash.
**Free Limits:** 15 requests per minute, 1 million tokens per minute, 1500 requests per day. This handles 400 members asking an average of two questions per day easily.
**Embedding Model:** Supabase embedding using `gte-small` via Edge Functions, or OpenAI `text-embedding-3-small` if run externally. (ASSUMPTION: We will use OpenAI `text-embedding-3-small` for simplicity).
**Free Limits (OpenAI):** Not free, but costs $0.02 per 1 million tokens. At 400 members asking 2 questions daily, monthly embedding cost is less than 50 naira. This effectively acts as free.

**Retrieval Flow (Shared Card Question):**
1. User submits question.
2. App generates embedding vector for the question using the embedding model.
3. App queries the Supabase vector store for the top 3 most similar approved cards.
4. App filters the vector results by the user's active tier (Basic or Premium).
5. App passes the retrieved cards to the language model.
6. The language model generates the answer.

**Retrieval Flow (Private Record Question):**
1. User submits question.
2. A lightweight intent router (regex or fast LLM call) determines the question asks for private data (e.g., "my balance", "my attendance").
3. The app skips the embedding and vector search entirely.
4. The app queries the PostgreSQL database for the `Payment` or `Attendance` tables where `memberId` exactly matches the authenticated session ID.
5. The app passes the raw database rows to the language model.
6. The language model generates the answer.

**System Prompt:**
```text
You are Spotter, a gym assistant. You answer questions strictly using the provided context. You never search the internet. You never use general knowledge.

Context rules:
- If the context contains shared cards, answer the question in one or two short sentences based only on those cards. Do not add external facts.
- If the context contains private database records (attendance or balance), summarize them exactly.
- If the context is empty, or does not contain the answer, output exactly: "REFUSE: No record."

Refusal rules:
You must output exactly "REFUSE: Rule violation" if the user asks about:
- Another member by name or description.
- Credit card numbers or bank account details.
- Medical advice, pain, injuries, diets, or supplements.
- Refunds, waivers, discounts, or cancellations.
- Staff conduct.
- Real-time status (e.g. "is the gym busy right now?").

Formatting rules:
- Plain English. Active voice. Short sentences.
- When summarizing balance, you must write "Our records show [Amount] outstanding." You must never write "You owe [Amount]."
- Do not apologize. Do not say "I am an AI." 
```

**Grounding Rules:**
Every successful answer based on a shared card must append the exact text of the source card in a distinct UI block below the answer, along with the `lastConfirmedAt` date of that card. 

**Fallback Behaviour:**
When the model outputs "REFUSE: No record" or "REFUSE: Rule violation", the app catches this exact string, discards it, and renders the hardcoded fallback message: "I do not have that in the gym's records. Please contact [FallbackName] on [FallbackPhone]." followed by the WhatsApp button.

**Token Cost Estimate:**
Average question length: 20 tokens.
Average retrieved context: 200 tokens.
Average answer: 40 tokens.
Total per turn: 260 tokens.
At 400 members * 3 questions a week * 4 weeks = 4,800 questions.
Monthly token volume: ~1.2 million tokens.
Cost on Gemini 1.5 Flash (Free tier): $0.

## 8. Technical Architecture with a Prisma Data Model

**System Diagram:**
Browser (Web App saved to home screen) -> Next.js App Router (Server Actions) -> Prisma ORM -> PostgreSQL (Supabase).
Auth is handled via a secure, HttpOnly cookie set after activation code verification.
Local Storage caches shared cards and the member's current status payload.

**Prisma Schema:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Tier {
  BASIC
  PREMIUM
}

enum PaymentMethod {
  CASH
  TRANSFER
  PAYSTACK
}

enum PaymentStatus {
  PENDING
  CONFIRMED
  FAILED
}

model Member {
  id             String    @id @default(uuid())
  fullName       String
  tier           Tier      @default(BASIC)
  expiryDate     DateTime
  openingBalance Int       @default(0) // Stored in kobo
  activationCode String?   @unique
  pinHash        String?
  deviceId       String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Private models - Fetched by memberId strictly
  attendances      Attendance[]
  payments         Payment[]
  paymentAttempts  PaymentAttempt[]
  questions        QuestionLog[]
}

// PRIVATE MODEL: Fetched by memberId only
model Attendance {
  id        String   @id @default(uuid())
  memberId  String
  member    Member   @relation(fields: [memberId], references: [id])
  checkInAt DateTime @default(now())
  isManual  Boolean  @default(false)
  staffId   String?  // If manual, who recorded it
}

// PRIVATE MODEL: Fetched by memberId only
model Payment {
  id        String        @id @default(uuid())
  memberId  String
  member    Member        @relation(fields: [memberId], references: [id])
  amount    Int           // Stored in kobo
  method    PaymentMethod
  reference String        @unique
  staffId   String?       // If cash/transfer, who recorded it
  createdAt DateTime      @default(now())
}

// PRIVATE MODEL: Fetched by memberId only
model PaymentAttempt {
  id        String        @id @default(uuid())
  memberId  String
  member    Member        @relation(fields: [memberId], references: [id])
  amount    Int
  reference String        @unique
  status    PaymentStatus @default(PENDING)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

// PRIVATE MODEL: Fetched by memberId only
model QuestionLog {
  id           String   @id @default(uuid())
  memberId     String
  member       Member   @relation(fields: [memberId], references: [id])
  question     String
  tierAtTime   Tier
  wasAnswered  Boolean
  cardId       String?  // The card that answered it, if any
  isWrong      Boolean  @default(false) // Flagged by user report
  createdAt    DateTime @default(now())
}

model Card {
  id              String        @id @default(uuid())
  title           String
  requiredTier    Tier          @default(BASIC)
  isApproved      Boolean       @default(false)
  lastConfirmedAt DateTime
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  versions        CardVersion[]
}

model CardVersion {
  id        String   @id @default(uuid())
  cardId    String
  card      Card     @relation(fields: [cardId], references: [id])
  content   String
  authorId  String
  createdAt DateTime @default(now())
}

model CheckInCode {
  id        String   @id @default(uuid())
  code      String
  date      DateTime @unique
  authorId  String
  createdAt DateTime @default(now())
}

model Staff {
  id       String  @id @default(uuid())
  fullName String
  phone    String
  role     String  @default("STAFF") // OWNER or STAFF
  isFallback Boolean @default(false)
}
```

**Row Level Access Rules:**
Because PostgreSQL RLS is difficult to type-safely integrate with Prisma without extensive raw queries, row level access is enforced at the application layer inside Next.js Server Actions. Every function fetching `Attendance`, `Payment`, `PaymentAttempt`, or `QuestionLog` must take the `memberId` from the verified auth cookie and pass it as a `where: { memberId: session.memberId }` clause in the Prisma query. 

## 9. Vector Database Architecture and Design

**Vector Store:** PostgreSQL with the `pgvector` extension.
**Justification:** Using `pgvector` keeps the architecture simple and free. It runs in the same Supabase database as the relational data, requiring no external paid vector service (like Pinecone) and avoiding network latency between databases.

**What is embedded:** Only the `content` of `CardVersion` rows where the parent `Card` has `isApproved = true`.
**What is never embedded:** Attendance logs, payment histories, member names, check in codes, and question logs. No private record ever enters this index.

**Chunking Strategy:** None. Shared cards are written as short, typed paragraphs. The entire card content is passed to the embedding model as a single chunk.

**Tier Filtering Strategy:** Filtering happens before the similarity search (Pre-filtering). When a Basic member asks a question, the vector query includes a hard `WHERE requiredTier = 'BASIC'` clause before computing cosine distance. This ensures Premium cards are mathematically excluded from the search space, preventing accidental data leakage.

**Reindexing Strategy:** When a staff member drafts a new card version, it has no vector. When the owner taps "Approve", the server action triggers an API call to the embedding model, generates the vector, and saves it alongside the approved card version. If approval is revoked, the `isApproved` boolean flips to false, instantly removing it from pre-filtered queries.

**Similarity Threshold:** Cosine similarity threshold is set to 0.75. If the nearest card is below this threshold, the query returns zero cards, triggering the "Ask the Desk" refusal flow.

## 10. Vector Database Model

The vector store is identical to the relational database. `pgvector` adds a vector column to the `CardVersion` table. Prisma supports `pgvector` natively as an unsupported type that can be queried via raw SQL, or via Prisma extensions.

**Vector Schema Update (Conceptual Prisma mapping):**
```prisma
model CardVersion {
  id          String   @id @default(uuid())
  cardId      String
  card        Card     @relation(fields: [cardId], references: [id])
  content     String
  authorId    String
  createdAt   DateTime @default(now())
  // embedding Unsupported("vector(1536)")
}
```

**Index Type:** HNSW (Hierarchical Navigable Small World) index on the embedding column using cosine distance (`vector_cosine_ops`), created via raw SQL migration.

**Example Insert (Raw SQL inside Server Action):**
```sql
UPDATE "CardVersion" 
SET embedding = '[0.12, 0.45, ...]'::vector 
WHERE id = 'card-version-uuid';
```

**Example Query with Tier Filter:**
```sql
SELECT cv.content, cv.cardId, c.lastConfirmedAt
FROM "CardVersion" cv
JOIN "Card" c ON cv.cardId = c.id
WHERE c.isApproved = true
  AND c.requiredTier IN ('BASIC', $1) 
ORDER BY cv.embedding <=> $2::vector
LIMIT 3;
```
*(Where $1 is the member's actual tier, allowing Premium members to search Basic and Premium, and Basic members to search only Basic).*

## 11. Business Model

**Who Pays and How Much:**
The gym owner pays a monthly subscription fee for the software (outside the scope of this build's cost). The member pays nothing for the app. The member pays their standard membership renewal fee inside the app.

**Gateway Fee:**
Paystack charges 1.5% + 100 naira per local transaction.
On a 15,000 naira renewal, the fee is 325 naira.
**Decision:** The gym absorbs this fee. (ASSUMPTION: Gyms prefer to absorb the 325 naira fee to guarantee cash hits their account without desk shrinkage or argument, rather than raising the price for digital buyers).

**Monthly Running Cost at 400 Members:**
- **Database (Supabase):** Free tier (500MB is enough for millions of text rows).
- **Hosting (Vercel):** Free tier.
- **LLM (Gemini):** Free tier.
- **Embedding (OpenAI):** ~$0.05 / month.
- **Total Monthly Tech Cost:** ~$0.05. Break even requires exactly zero revenue.

## 12. Success Metrics

| Metric | Definition | Measurement | Baseline | Target |
| :--- | :--- | :--- | :--- | :--- |
| **Desk Interruption Rate** | The percentage of questions that result in an "Ask the Desk" WhatsApp handoff. | Count of WhatsApp button taps / Total questions asked. | 100% (all questions go to desk). | < 20% |
| **Digital Check In Rate** | Percentage of active members checking in via the app. | Unique members logging an attendance / Total active members. | 0% | 100% |
| **In-App Renewal Rate** | Percentage of renewals processed via Paystack. | Successful Paystack attempts / Total payments logged. | 0% | > 30% |
| **Wrong Answer Rate** | The rate at which members report an answer is incorrect. | Count of "This looks wrong" reports / Total questions answered. | N/A | < 2% |
| **Kill Metric: Zero Search Usage** | The percentage of members who open the app but never ask a question in a 30 day window. | Distinct users querying / Distinct users logging in. | N/A | Stop building if > 70% |

## 13. Risks

| Risk | Consequence | Early Warning Signal | Built-in Mitigation |
| :--- | :--- | :--- | :--- |
| **Wrong balance record** | Member disputes balance publicly at desk, trust in app is destroyed. | User taps "This looks wrong" on a balance query. | App states "Correct as of [Date]" and defers final authority to desk staff. |
| **Silent check in failure** | Member thinks they checked in, attendance history is wrong, member distrusts the data. | Server logs show 500 errors on check in endpoint. | App displays clear success screen with visit count. Hard error message on failure. |
| **Delayed payment update** | Member pays but is still marked expired, arguments at the desk. | Gateway logs show webhook delivery delays. | Success screen shows "Payment received, update in progress" with a reference number if webhook is slow. |
| **Hallucination on shared cards** | App invents a rule or time, member misses a class. | Owner sees high volume of "This looks wrong" reports. | Strict system prompt grounding. App displays the exact source card underneath the answer. |
| **Device sharing abuse** | One member gives their PIN to a friend to check in. | Multiple check ins for the same member ID from different device IP addresses. | One device linked per member. Re linking requires a desk visit to get a new code. |

## 14. Open Questions

1. **Migration of opening balances:**
   *Question:* Who types in the initial opening balances for the 400 members before launch?
   *Why it blocks work:* Without an opening balance, the payment logic fails to calculate what is owed.
   *Assumption made:* The owner will manually enter opening balances into the owner screen before distributing activation codes.

2. **Geofencing vs. Trust Check In:**
   *Question:* Can a member check in from home by calling a friend to read the whiteboard code?
   *Why it blocks work:* If this is a problem, the check in flow requires browser geolocation APIs.
   *Assumption made:* The gym relies on the daily changing physical code and trusts that members will not coordinate daily fraud. No GPS geofencing is built.

## All assumptions in this document

- ASSUMPTION: A member does not train twice within four hours.
- ASSUMPTION: We will use OpenAI `text-embedding-3-small` for simplicity.
- ASSUMPTION: Gyms prefer to absorb the 325 naira Paystack fee to guarantee cash hits their account without desk shrinkage or argument.
- ASSUMPTION: The owner will manually enter opening balances into the owner screen before distributing activation codes.
- ASSUMPTION: The gym relies on the daily changing physical code and trusts that members will not coordinate daily fraud. No GPS geofencing is built.
