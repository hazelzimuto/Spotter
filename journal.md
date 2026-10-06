# Spotter Development Journal 📓

This journal tracks engineering decisions, architectural milestones, and implementation history for the **Spotter** web application.

---

## 📅 Chronological Milestones

### Phase 0: Foundations & Architecture Baseline
- **Vision & Scope Alignment**: Defined the single-purpose private member tool. Spotter serves members directly without front-desk queue delays, while strictly refusing inquiries about other members, medical advice, real-time desk status, or refund negotiations.
- **Design Tokens & Aurora System**: Built `tokens.json` and `build-tokens.js` script to compile raw design variables into CSS custom properties (`tokens.css`). Configured Inter font family and Aurora color palettes.
- **Data Modeling (Prisma & PGVector)**: Structured the initial Prisma schema (`prisma/schema.prisma`) covering `Member`, `Device`, `Session`, `Attendance`, `SharedCard`, `CardEmbedding`, and `Transaction` models.

---

### Phase 1: Member Authentication & Device Binding (FR-6)
- **Single-Device Security Policy**: Implemented one-device-per-member constraint to prevent credential sharing and unauthorized access.
- **Activation Flow**:
  - Staff generates an activation code on the gym desk dashboard.
  - Member navigates to `/activate`, validates their one-time code.
  - Member sets a 4-digit PIN at `/activate/pin`.
  - Cryptographic PIN hashing using PBKDF2/SHA-256 (`lib/auth/pin.ts`).
  - Device identifier minted and bound in an HTTP-only secure cookie (`spotter_session`).
- **Route Gate**: Created `proxy.ts` middleware for optimistic path-based gating.

---

### Phase 2: Public Marketing Landing Page & Routing Evolution
- **Product Direction Update**: Shifted the root route (`/`) from a hard redirect to `/activate` to a public marketing landing page.
- **Server/Client Island Architecture**:
  - `app/page.tsx`: Remains a fast, SEO-friendly React Server Component.
  - `components/landing/landing-client.tsx`: Isolated client islands (`NavActions`, `HeroActions`, `CtaActions`) managing sign-in/sign-up modal state.
  - `components/auth/sign-in-modal.tsx`: Interactive modal with PIN entry tab for existing members and link to `/activate` for new members.
- **Proxy Middleware Alignment**:
  - Resolved `307 Temporary Redirect` loop by registering `/` as a public path in `proxy.ts`.
  - Configured unauthenticated visitors to view the marketing page, while authenticated members bypass it directly to `/member`.

---

### Phase 3: Brand Assets, Metadata & SEO Standardization
- **Dynamic `<head>` Configuration**:
  - Implemented dynamic title templating in `app/layout.tsx` (`%s | Spotter`).
  - Added the exact 4-word app description: `"Private gym member portal"`.
  - Embedded dynamic route titles for `/` (*"Spotter — Your gym, at your fingertips"*), `/activate` (*"Link Your Device | Spotter"*), `/activate/pin` (*"Set Your PIN | Spotter"*), and `/member` (*"Member Portal | Spotter"*).
- **SEO & Search Indexing Rules**:
  - Configured full OpenGraph, Twitter cards, keywords, and canonical tags exclusively on the marketing home page (`app/page.tsx`).
  - Set `robots: { index: false, follow: false }` across all internal routes (`/activate`, `/activate/pin`, `/member`).
- **Brand Favicon & Icon Suite**:
  - Designed an SVG favicon matching `.navLogo` (135° linear gradient from `#4F46E5` to `#665666` with bold white "S").
  - Generated PNG fallbacks (`favicon-32x32.png`, `icon-192.png`, `icon-512.png`, `favicon.ico`) using Sharp for PWA and legacy browser support.
- **Button Sizing & Ergonomics**:
  - Standardized horizontal and vertical button padding to **`1.125rem`** (18px / 16).
  - Standardized corner radius to **`0.5rem`** (8px / 16).
  - Overrode design system tokens in `:root` and removed restrictive fixed heights in CSS modules to allow natural vertical rhythm.

---

### Phase 4: Version Control & GitHub Repository Setup
- **Git Initialization**: Initialized clean local git repository on branch `main`.
- **Ignore Rules**: Enhanced `.gitignore` to prevent committing `.DS_Store`, `tsconfig.tsbuildinfo`, `.vscode`, and environment variables.
- **Remote Synchronization**:
  - Linked origin to `https://github.com/hazelzimuto/Spotter.git`.
  - Pushed initial commit (`7a19f1d`) and published repository to GitHub.

---

### Phase 5: Animated Striped Abstract Background & Design Polish
- **Full-Page Striped Visual**: Added a custom generated abstract striped background graphic (`/abstract-stripes.jpg`) cutting diagonally across the entire marketing page with Aurora-aligned luminous indigo (`#4F46E5`) and violet (`#7C3AED` / `#665666`) ribbons.
- **Performant CSS Animation**:
  - `stripeDrift`: Multi-axis slow floating and rotation (28s duration).
  - `stripeBeamSweep`: Ambient repeating diagonal light beam sweep with `screen` blend mode (22s duration).
  - Hardware accelerated via `will-change: transform` and `translate3d`.
  - Full support for `prefers-reduced-motion: reduce`.
- **Translucent Section Blending**: Updated `.hero`, `.stats`, `.features`, `.how`, `.cta`, and `.footer` to use layered translucent backgrounds with `backdrop-filter: blur(20px)` so the animated stripes continuously cut across all sections.
- **Proxy Middleware Static Route Fix**: Updated `proxy.ts` matcher regex to include `.jpg` and `.jpeg` so static marketing imagery is exempt from auth redirection gates.

---

## 💡 Key Architectural Decisions & Rationale

1. **Why `proxy.ts` instead of complex database middleware?**
   - Hitting PostgreSQL/Prisma on every request (including client prefetches) adds latency and exhausts connection pools. `proxy.ts` performs lightweight cookie presence checks, leaving authoritative database authorization to Server Actions and protected queries.

2. **Why Client Islands on the Landing Page?**
   - The landing page needs static marketing performance and instant SEO indexing, but the interactive sign-in modal requires React state (`useState`). Isolating button triggers into small client islands preserves `page.tsx` as a pure Server Component.

3. **Why Restrict Indexing to Marketing Only?**
   - Spotter is a private member application. Indexing member check-in portals or activation flows invites web crawlers to sensitive routes. Explicitly declaring `robots: noindex, nofollow` on non-marketing pages ensures strict perimeter isolation.
