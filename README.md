# Spotter 🏋️‍♂️

> **Your gym, at your fingertips.**  
> *Private, mobile-first gym member web application.*

Spotter is a private web application that gym members use to independently retrieve their own attendance records, membership balances, and gym policies in seconds — eliminating queues at the front desk. It serves members directly while keeping staff out of the member portal entirely.

---

## 📖 Table of Contents

- [Problem & Purpose](#-problem--purpose)
- [Who Uses Spotter (Personas)](#-who-uses-spotter-personas)
- [System Architecture & Data Flows](#-system-architecture--data-flows)
- [How Spotter Works (Core Mechanics)](#-how-spotter-works-core-mechanics)
  - [1. Single-Device Authentication & Hardware Pinning](#1-single-device-authentication--hardware-pinning)
  - [2. Grounded Q&A with Strict Safety Refusals](#2-grounded-qa-with-strict-safety-refusals)
  - [3. Private Member Ledgers (Zero AI Exposure)](#3-private-member-ledgers-zero-ai-exposure)
  - [4. Daily Whiteboard Check-In (4-Hour Window)](#4-daily-whiteboard-check-in-4-hour-window)
  - [5. Membership Renewals (Paystack Webhooks)](#5-membership-renewals-paystack-webhooks)
  - [6. Offline Readiness & Local Caching](#6-offline-readiness--local-caching)
- [MVP Scope vs. Non-Goals](#-mvp-scope-vs-non-goals)
- [Technology Stack](#️-technology-stack)
- [Project Directory Map](#-project-directory-map)
- [Getting Started](#-getting-started)
- [Engineering & Security Principles](#-engineering--security-principles)
- [License](#-license)

---

## 🎯 Problem & Purpose

At busy gyms, front desks are bottlenecks. Members wait in line just to ask simple questions:
* *"When does yoga start today?"*
* *"How many sessions do I have left this month?"*
* *"What is the daily check-in code?"*
* *"Can I renew my membership right now?"*

**Spotter solves this by putting the answers directly on the member's phone.**  
Crucially, Spotter is **not** an open public social network or an all-in-one ERP. It is an ultra-focused, privacy-first interface built to ground every answer exclusively in approved records and enforce strict safety boundaries.

---

## 👥 Who Uses Spotter (Personas)

Spotter cleanly separates the person asking questions from the people managing the facility:

| Persona | Role in Spotter | Key Capabilities |
| :--- | :--- | :--- |
| **Member** | **Sole Consumer** | The only user of the member application. Checks in via daily code, inspects personal attendance/balance, searches gym rules, renews dues, and escalates to desk WhatsApp. |
| **Desk Staff** | **Record Supplier** | Operates dedicated staff screens. Drafts shared informational cards, sets the whiteboard daily check-in code, generates one-time activation codes, logs manual cash/POS payments, and performs in-person device unlinks. |
| **Gym Owner** | **Record Approver & Admin** | Operates owner screens. Reviews and approves shared cards (triggering vector embeddings), manages member tiers and opening balances, toggles payment fee absorption, and audits rejected/escalated queries. |

---

## 🏛️ System Architecture & Data Flows

Spotter strictly segregates **confidential member data** from **public gym knowledge** to guarantee privacy and eliminate hallucination risks.

```
                              ┌──────────────────────────┐
                              │      Spotter Client      │
                              │  (Mobile-First Web App)  │
                              └─────────────┬────────────┘
                                            │
                     ┌──────────────────────┼──────────────────────┐
                     │                      │                      │
                     ▼                      ▼                      ▼
           [ Private Records ]     [ Facility Q&A ]       [ Desk Check-In ]
                     │                      │                      │
             Direct SQL Query        PGVector Search       Whiteboard Code
             via Prisma ORM         Filtered by Tier      4-Hour Suppression
                     │                      │                      │
                     ▼                      ▼                      ▼
           ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
           │ PostgreSQL DB    │   │ Approved Cards   │   │ Attendance Log   │
           │ (Member ID Only) │   │ (Embeddings via  │   │ & Visit Counter  │
           │ *Zero AI Exposure│   │  Gemini Free)    │   └──────────────────┘
           └──────────────────┘   └─────────┬────────┘
                                            │
                                  ┌─────────▼────────┐
                                  │ Unanswerable or  │
                                  │ Prohibited Topic │
                                  └─────────┬────────┘
                                            ▼
                                  ┌──────────────────┐
                                  │ WhatsApp Desk    │
                                  │ Fallback Link    │
                                  └──────────────────┘
```

---

## ⚙️ How Spotter Works (Core Mechanics)

### 1. Single-Device Authentication & Hardware Pinning
To prevent pass-sharing and credential abuse without requiring SMS OTP gateways:
* **One-Time Activation Code**: Staff generate an in-person, single-use activation code from their dashboard.
* **Device Binding**: The member visits `/activate` on their phone, inputs the code, and creates a secure 4-digit PIN.
* **Cryptographic Session**: The session is bound to that device via an HTTP-only, secure cookie with salted PIN hashing.
* **Force-Unlink Policy**: If a member loses or replaces their device, they **cannot** self-service re-register. They must request an in-person identity verification and **force-unlink** at the front desk before a new device can be bound.

### 2. Grounded Q&A with Strict Safety Refusals
* **Grounded in Approved Records Only**: Member questions regarding gym rules, class timetables, equipment guidelines, and hours are answered using vector similarity search (`pgvector`) against owner-approved cards. Spotter **never** searches the internet or makes up facts.
* **Tier-Based Pre-Filtering**: Knowledge cards are strictly filtered by member tier before vector ranking, ensuring members only see info relevant to their pass.
* **Strict Safety Refusals**: Spotter is hardcoded to refuse questions outside approved facility rules, immediately stopping queries about:
  - Other members' personal details, attendance, or balances
  - Medical advice, injury diagnostics, or physical therapy regimens
  - Real-time desk crowd or occupancy status
  - Fee waivers, refunds, discounts, or cancellations
  - Staff personal conduct or disciplinary actions
  - Binding financial promises on behalf of the gym
* **WhatsApp Desk Fallback**: Whenever a question falls outside approved records or triggers a refusal policy, Spotter provides an instant fallback link to message desk staff on WhatsApp.

### 3. Private Member Ledgers (Zero AI Exposure)
* When a member clicks **My Records** to view past attendance timestamps or their remaining membership balance:
* The query executes **directly against PostgreSQL** using Prisma ORM, filtering strictly by the authenticated `memberId`.
* **Private data is never sent to Gemini or any embedding model**, keeping personal financial and attendance histories confidential.

### 4. Daily Whiteboard Check-In (4-Hour Window)
* **Whiteboard Code**: Each morning, front-desk staff update a 4-digit numeric code on the physical gym whiteboard.
* **Self Check-In**: Members type the code into Spotter upon arrival.
* **Suppression Window**: Spotter enforces a strict **maximum of one check-in per four-hour window** per member ID, preventing accidental double-taps or rapid duplicate check-ins.

### 5. Membership Renewals (Paystack Webhooks)
* **Nigerian Naira (NGN/kobo)**: Membership dues and balances are calculated and stored in kobo.
* **Paystack Gateway**: Payments are processed through Paystack checkout.
* **Webhook Idempotency**: Member ledgers update **exclusively** upon receipt of verified, cryptographically signed Paystack webhooks using idempotent transaction references to prevent double-crediting.

### 6. Offline Readiness & Local Caching
* Spotter caches the member's current status and approved shared cards in local browser storage.
* If a member enters the gym basement with poor cellular connectivity, they can still view their active membership pass and cached gym cards offline.

---

## 🚫 MVP Scope vs. Non-Goals

To maintain high software reliability and speed, Spotter explicitly defines what is **in scope** and **out of scope**:

### In Scope (MVP)
- Public landing page (`/`) with Aurora design system tokens and accessible ARIA navigation.
- In-place accessible legal policy views (NDPA 2023-compliant Privacy Policy & Terms of Service).
- Member activation flow (`/activate`) and PIN management.
- Member portal (`/member`): attendance history, balance, check-in, search, pay.
- Owner interface (`/owner`): card approvals, vector rollbacks, tier setup.
- Staff interface (`/staff`): card drafting, daily codes, activation codes, force-unlinks.
- PGVector semantic search pre-filtered by member tier.
- Paystack renewal checkout and signed webhook processing.

### Out of Scope (Explicit Non-Goals)
- Replacing the primary gym management ERP, payroll, or accounting system.
- Social feeds, leaderboards, workout sharing, or member chat.
- Automated push notifications or SMS one-time passwords (OTP).
- Guest passes or visitor registration.
- Custom written workout plans or personal trainer scheduling.
- Automated churn prediction algorithms.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server Actions) | Server Components for performance, Server Actions for secure database operations. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety across database models and client interfaces. |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/) | Relational integrity for member balances, attendance logs, and sessions. |
| **Vector Storage** | [PGVector](https://github.com/pgvector/pgvector) | Native PostgreSQL vector embeddings for fast, tier-filtered cosine retrieval. |
| **Embeddings & LLM**| Google Gemini (Free Tier) | Generates vector embeddings for approved knowledge cards and answers member queries. |
| **Payments** | [Paystack](https://paystack.com/) | Secure payment gateway for Nigerian Naira transactions (kobo denomination). |
| **Styling & Tokens** | Aurora Design System (Vanilla CSS Modules) | Clean, zero-runtime tokens (`--color-*`, `--spacing-*`) with complete responsive accessibility. |

---

## 📂 Project Directory Map

```text
├── app/
│   ├── activate/         # FR-6 device activation flow (code entry → PIN setup)
│   ├── member/           # Member portal (attendance, balance, check-in, search, pay)
│   ├── owner/            # Gym owner interface (card approvals, tier management)
│   ├── staff/            # Desk staff interface (daily codes, activation codes, unlinks)
│   ├── globals.css       # Global styles & Aurora token definitions
│   ├── landing.module.css# Landing page CSS modules consuming Aurora tokens
│   ├── layout.tsx        # Root layout with dynamic title template & metadata
│   ├── page.tsx          # Public marketing landing page (Server Component)
│   └── icon.svg          # Dynamic SVG brand favicon
├── components/
│   ├── auth/             # Sign-in modal, PIN entry stub, activation forms, auth shell
│   └── landing/          # Client islands for modal state & in-place legal views
├── design tokens/        # Source design tokens (tokens.json)
├── Docs/                 # Product Requirement Documents (PRD) & feature specs
├── lib/
│   ├── auth/             # Cookie issuance, salted PIN hashing, session validation
│   ├── db.ts             # Prisma client singleton
│   └── payments/         # Paystack transaction verification and webhook utilities
├── prisma/
│   └── schema.prisma     # Prisma schema (Members, Attendance, Cards, Ledgers)
├── rules/                # Operational rules, SQL indexes, thresholds, and pricing
├── public/               # Static assets, hero background, web manifest
├── journal.md            # Chronological engineering decisions and implementation log
├── AGENTS.md             # Core product rules, scope boundaries, and guidelines
└── proxy.ts              # Optimistic Next.js route gate middleware
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.17+ or v20+)
- [PostgreSQL](https://www.postgresql.org/) with `pgvector` extension enabled

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/hazelzimuto/Spotter.git
cd Spotter
npm install
```

### 3. Environment Setup

Create your `.env` configuration file:

```bash
cp .env.example .env
```

Configure the following environment keys:
- `DATABASE_URL`: PostgreSQL connection string (with pgvector support)
- `GEMINI_API_KEY`: Google Gemini API key for embeddings and Q&A
- `PAYSTACK_SECRET_KEY`: Paystack secret key for NGN payment processing
- `SESSION_SECRET`: Cryptographic secret for signing HTTP-only cookies

### 4. Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Running Locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied) in your browser.

---

## 🔒 Engineering & Security Principles

1. **One change at a time**: Incremental development verified with strict type checking (`npx tsc --noEmit`).
2. **Exclusively Grounded Q&A**: Every answer is grounded in owner-approved gym cards; queries never hit external web search.
3. **No Direct SQL Executions**: Database access occurs exclusively through Prisma ORM within Next.js Server Actions.
4. **Zero AI Exposure for Private Records**: Member attendance and balances are queried via deterministic database Lookups, never passed to LLMs.
5. **Strict Single-Device Binding**: One physical device per member; switching devices requires in-person staff intervention.
6. **Token-Only Styling**: No arbitrary magic values in CSS; all styles consume Aurora design tokens.

---

## 📄 License

Private & proprietary gym management application. All rights reserved.
