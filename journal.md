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

### Phase 6: Legal Foundation, Privacy Policy (NDPA 2023) & Terms of Service
- **Footer Modernization**:
  - Replaced the static footer disclaimer (*"Answers are grounded exclusively in approved gym records."*) with accessible, navigable links to `/privacy` and `/terms`.
  - Added modern interactive styling (`.footerLinks`, `.footerLink`, `.footerSeparator`) consuming Aurora design tokens.
- **Privacy Policy (`app/privacy/page.tsx`)**:
  - Grounded directly in Spotter's PRD and architecture (single-device binding, 4-digit PIN cryptographic hashing, whiteboard 4-hour check-in window, Paystack tokenized payments, and tier-filtered grounded AI assistant).
  - Explicitly referenced the **Nigeria Data Protection Act, 2023 (NDPA)** and the **Nigeria Data Protection Commission (NDPC)**.
  - Specified principles under Section 24, lawful bases under Section 25, and member data subject rights under Section 34 (access, rectification, erasure, restriction, and complaint mechanisms).
- **Terms of Service (`app/terms/page.tsx`)**:
  - Outlined member rules, single-device policy, whiteboard check-in requirements, suppression windows, and Paystack renewal procedures.
  - Formulated the strict safety refusal policy (no medical advice, no third-party member data, no financial commitments, WhatsApp desk fallback).
  - Established jurisdiction under the laws of the **Federal Republic of Nigeria**.
- **Route Gate & 404 Prevention**:
  - Registered `/privacy` and `/terms` in `proxy.ts` under `PUBLIC_LEGAL_PATHS` to ensure both unauthenticated visitors and logged-in members can access legal documentation without redirection loops or 404 errors.

---

### Phase 7: Transition Privacy & Terms from Pages to In-Page Conditional Views
- **Removed Standalone Pages**:
  - Removed `app/privacy/page.tsx` and `app/terms/page.tsx` routes so `/privacy` and `/terms` do not exist as independent web pages.
- **In-Page Conditional Legal Views (`components/landing/legal-view.tsx`)**:
  - Created a dedicated `LegalView` client island component that renders either the Privacy Policy or Terms of Service as an overlay view directly on the home page.
  - Included a header with "← Back to Spotter", interactive document tabs to toggle between Privacy and Terms, the full NDPA 2023 Nigerian law content, Escape key listener, and scroll lock on `body`.
- **Footer Legal Client Island (`components/landing/landing-client.tsx`)**:
  - Introduced `FooterLegal` island on the marketing footer in `app/page.tsx`.
  - Replaced router `<Link>` elements with `<button>` elements that maintain identical font size and styling to `.footerCopy` (`Private member access only.`).
  - Implemented popstate and query-param sync (`/?view=privacy` / `/?view=terms`) so bookmarked or shared links automatically open the corresponding view on the home page.
- **Proxy Middleware Routing Safeguard (`proxy.ts`)**:
  - Configured `proxy.ts` to redirect incoming requests for legacy `/privacy` and `/terms` paths to `/?view=privacy` and `/?view=terms`, completely preventing 404 errors.

---

### Phase 8: Mobile Hamburger Navigation & Slide-in Drawer
- **Responsive Mobile Navigation**:
  - In mobile view (`max-width: 768px`), hid the top-bar `navSignUp` ("Get started") button and rendered a clean, accessible hamburger menu icon on the right side of the header.
- **Full-Screen Slide-in Drawer (`.mobileSlider`)**:
  - Implemented a full-screen drawer that smoothly slides in from the right (`transform: translateX(100%)` ➜ `transform: translateX(0)`) upon tapping the hamburger icon.
  - Positioned an "X" close button at the top-right of the slider header.
  - Embedded the primary **Get started** action (and "Already a member? Sign in" option) inside the centered drawer body.
  - Added background scroll lock on `document.body` and keyboard `Escape` shortcut listener to dismiss the drawer.
  - Included fallback transitions in `@media (prefers-reduced-motion: reduce)`.

### Phase 9: Accessibility (A11y) & ARIA Standardization
- **Landmarks & Skip Navigation**:
  - Added off-screen `.skipLink` targeting `#main-content`, revealed on `:focus-visible` with Aurora tokens.
  - Added explicit semantic landmarks: `header role="banner"`, `main id="main-content" tabIndex={-1}`, and `footer role="contentinfo" aria-label="Site footer"`.
- **Navigation & Mobile Drawer ARIA Roles**:
  - Added `aria-label="Open navigation menu"`, `aria-expanded={menuOpen}`, `aria-controls="mobile-nav-slider"`, and `aria-haspopup="dialog"` to the mobile hamburger toggle button.
  - Formatted the slide-in menu drawer with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="mobile-nav-title"`, and `aria-label="Close navigation menu"` on the close button.
  - Added `aria-haspopup="dialog"` on all buttons that open modals or dialogs.
- **Content Lists, Metrics & Legal Views**:
  - Added descriptive `aria-label`s and `role="group"` on the stat metrics strip.
  - Labeled `aria-label="Feature list"` and `aria-label="Onboarding steps"` for screen reader clarity.
  - Configured full WAI-ARIA tab pattern (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`) for in-place Privacy Policy and Terms of Service views.

### Phase 10: Unified Auth Page & Conditional Views (`/auth`)
- **Single Collapsed Authentication Screen**:
  - Created `/auth` (`app/auth/page.tsx`), consolidating all member authentication forms onto a single page instead of disjoint routes.
  - Implemented `UnifiedAuthCard` (`components/auth/unified-auth-card.tsx`) with conditional rendering for:
    1. `signin`: 4-digit PIN entry for existing linked devices.
    2. `activate`: Staff one-time activation code entry (Step 1 of onboarding).
    3. `pin`: PIN creation and confirmation (Step 2 of onboarding).
  - Built integrated tab switcher (`Sign in` vs `Link device`) allowing seamless toggling between forms without page reloads.
  - Synchronized view state with URL parameters (`?view=signin`, `?view=activate`, `?view=pin`) and browser history for back/forward navigation.
- **Server Actions & Route Unification**:
  - Created `app/auth/actions.ts` exposing `submitSignIn`, `submitActivationCode`, and `submitPin`.
  - Wired `SignInForm` in `components/auth/sign-in-modal.tsx` to `submitSignIn` with inline validation alerts.
  - Updated `proxy.ts` to route-gate `/auth` and redirect legacy `/activate` and `/activate/pin` routes to `/auth?view=activate` and `/auth?view=pin`.
  - Updated pending activation cookie path to root (`/`) to preserve multi-screen state transitions.

---

## 💡 Key Architectural Decisions & Rationale

1. **Why `proxy.ts` instead of complex database middleware?**
   - Hitting PostgreSQL/Prisma on every request (including client prefetches) adds latency and exhausts connection pools. `proxy.ts` performs lightweight cookie presence checks, leaving authoritative database authorization to Server Actions and protected queries.

2. **Why Client Islands on the Landing Page?**
   - The landing page needs static marketing performance and instant SEO indexing, but the interactive sign-in modal requires React state (`useState`). Isolating button triggers into small client islands preserves `page.tsx` as a pure Server Component.

3. **Why Restrict Indexing to Marketing Only?**
   - Spotter is a private member application. Indexing member check-in portals or activation flows invites web crawlers to sensitive routes. Explicitly declaring `robots: noindex, nofollow` on non-marketing pages ensures strict perimeter isolation.
