# Spotter 🏋️‍♂️

> **Your gym, at your fingertips.**  
> *Private gym member portal*

Spotter is a private web application that gym members use to retrieve their own attendance, membership balance, and gym rules in seconds — without waiting in line at the front desk.

---

## ⚡ Core Highlights

- **Marketing & Member Portal**: Public landing page with features overview, onboarding guide, and instant sign-in / sign-up modal.
- **Single-Device Authentication (FR-6)**: One-time staff activation code bound to a single device with a 4-digit PIN and secure HTTP-only cookies.
- **Digital Whiteboard Check-In**: Record visits via the daily 4-digit front-desk whiteboard code, enforcing a 4-hour suppression window.
- **Private Member Records**: Direct database queries for attendance logs and balance history strictly isolated by member ID.
- **Grounded Q&A (Vector Search)**: Answers gym rules, timetables, and policies grounded exclusively in approved shared cards using PGVector — never hallucinates or searches the web.
- **Front-Desk WhatsApp Fallback**: Instant escalation to front-desk staff when inquiries require human assistance or violate safety policies.
- **Membership Renewals**: Paystack integration with idempotent webhook processing.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database & ORM** | PostgreSQL with [Prisma ORM](https://www.prisma.io/) |
| **Vector Search** | PGVector |
| **AI / Embeddings** | Google Gemini (Free Tier) |
| **Payments** | [Paystack](https://paystack.com/) |
| **Styling & Tokens** | Aurora Design System (Vanilla CSS Modules, Design Tokens) |

---

## 📂 Project Structure

```text
├── app/
│   ├── activate/         # FR-6 device activation flow (code entry → PIN setup)
│   ├── member/           # Member portal (attendance, balance, check-in, search)
│   ├── owner/            # Gym owner interface (approvals, tier management)
│   ├── staff/            # Desk staff interface (daily codes, activation tokens)
│   ├── globals.css       # Global styles & design token imports
│   ├── landing.module.css# Landing page CSS modules
│   ├── layout.tsx        # Root layout with dynamic title template & meta
│   ├── page.tsx          # Public marketing landing page
│   └── icon.svg          # Dynamic SVG brand favicon
├── components/
│   ├── auth/             # Sign-in modal, activation forms, auth shell
│   └── landing/          # Client islands for modal & interactive elements
├── design tokens/        # Source tokens (tokens.json)
├── Docs/                 # Product Requirement Documents (PRD) & specs
├── lib/
│   ├── auth/             # Cookie, PIN hashing, session validation utilities
│   ├── db.ts             # Prisma client singleton
│   └── payments/         # Payment verification and webhooks
├── prisma/
│   └── schema.prisma     # Database models and relations
├── public/               # Static assets, hero background, favicons, manifest
└── proxy.ts              # Optimistic Next.js route gate middleware
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.17+ or v20+)
- [PostgreSQL](https://www.postgresql.org/) with `pgvector` extension

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/hazelzimuto/Spotter.git
cd Spotter
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your database and API credentials:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL`: PostgreSQL connection string (with pgvector support)
- `GEMINI_API_KEY`: Google Gemini API key for embeddings
- `PAYSTACK_SECRET_KEY`: Paystack secret key for payment processing
- `SESSION_SECRET`: Secret key for signing auth cookies

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

## 🔒 Security & Architecture Rules

1. **One change at a time**: Systematic incremental development with strict type checks (`npx tsc --noEmit`).
2. **Grounded AI Answers**: Gym Q&A is strictly grounded in owner-approved shared cards; queries never reach external web search.
3. **No Raw SQL Migrations**: Database access occurs exclusively through Prisma ORM in Server Actions.
4. **Single-Device Isolation**: Only one physical device can be bound per member; switching devices requires staff force-unlinking.

---

## 📄 License

Private & proprietary gym management application. All rights reserved.
