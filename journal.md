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

### Phase 11: Real-Time Empty Field Validation (`onBlur`)
- **Focus & Blur Validation Behavior**:
  - Implemented `onBlur` listeners across all authentication form fields (`pin`, `activationCode`, `confirmPin`).
  - When a user focuses a field and leaves without entering content, an accessible inline error message dynamically displays: *"This field must not be empty"*.
  - Styled with `.fieldError` and `.modalFieldError` consuming `--color-error` tokens.
  - Bound inputs with `aria-invalid={true}` and `aria-describedby` linking to error IDs with `role="alert"`.
  - Form submission blocks execution and triggers field-level error messages if fields remain blank.

### Phase 12: Self-Serve Member Sign-Up Integration
- **Direct Sign-Up Workflow**:
  - Replaced the mandatory desk-code onboarding prerequisite with a direct self-serve sign-up form (`SignUpView` in `components/auth/unified-auth-card.tsx`).
  - Added fields: Full Name (`fullName`), Phone Number (`phone`), 4-Digit PIN (`pin`), and Confirm PIN (`confirmPin`).
  - Applied real-time `onBlur` empty field validation (*"This field must not be empty"*).
  - Maintained the optional desk activation code flow as a secondary path (`/auth?view=activate`).
- **Server Action & Database Attribution**:
  - Implemented `submitSignUp` in `app/auth/actions.ts`:
    1. Validates non-empty names and phone numbers.
    2. Enforces matching 4-digit PINs.
    3. Hashes PIN via `bcrypt` and mints long-lived `deviceId` cookie.
    4. Automatically provisions a `BASIC` member with a 30-day initial access window.
    5. Issues an HTTP-only authenticated session and redirects directly to `/member`.
  - Added `phone String?` to `Member` in `prisma/schema.prisma` and regenerated Prisma Client.
  - Updated landing page sign-up calls to route directly to `/auth?view=signup`.

### Phase 13: Error Outline & Caution Icon for Inline Validation
- **Input Error Outline**:
  - Configured inputs in `.field` and `.modalField` to outline with `--color-error` via `[aria-invalid='true']`, `.inputError`, and `.modalInputError`.
  - Maintained `--border-width-medium` solid `--color-error` on `:focus` to clearly reflect invalid states instead of reverting to default focus styles.
- **Caution Icon Beside Inline Messages**:
  - Created reusable `CautionIcon` component (`components/auth/caution-icon.tsx`) rendering an accessible SVG warning triangle with rounded corners.
  - Placed `<CautionIcon />` beside all inline *"This field must not be empty"* error messages across `UnifiedAuthCard`, `SignInModal`, `PinForm`, and `ActivationCodeForm`.
  - Configured `currentColor` inheritance to consume `--color-error` automatically, with `aria-hidden="true"` so screen readers read only the descriptive error text.

### Phase 14: Full Name Multi-Word & Minimum Length Validation
- **Validation Constraints**:
  - Enforced a minimum length of 2 characters (`minLength={2}`).
  - Validated that full name contains at least 2 words / names separated by whitespace (e.g. *"First Last"*).
- **Inline Error Feedback**:
  - If field is empty on blur: displays *"This field must not be empty"*.
  - If length < 2: displays *"Full name must be at least 2 characters"*.
  - If fewer than 2 names: displays *"Please enter at least 2 names separated with a space"*.
  - Inline error is paired with `<CautionIcon />` and input error outline.
- **Server Action Validation**:
  - Mirrored length and multi-word checks in `submitSignUp` (`app/auth/actions.ts`) to ensure secure server-side enforcement.

### Phase 15: Email Address Field & Real-Time Format Validation
- **Schema & Persistence**:
  - Added optional `email String?` field to `Member` in `prisma/schema.prisma` and generated Prisma Client types.
  - Stored email on `Member` creation in `submitSignUp` server action.
- **Real-Time Dynamic Validation**:
  - As soon as the user starts typing (`trimmed.length > 0`), real-time regex format validation checks whether the input forms a valid email (`^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`).
  - Displays inline error *"Enter a valid email address"* with `<CautionIcon />` and error color outline while format is invalid.
  - Instantly disappears the moment a valid email format is entered.
  - Displays *"This field must not be empty"* if focused and left blank.

### Phase 16: Member Number Field with 6-Digit Numeric Enforcement
- **Replaced Phone Number with Member Number**:
  - Swapped out phone number in `SignUpView` for a dedicated Member Number field (`type="text"`, `inputMode="numeric"`, `maxLength={6}`).
  - Added `memberNumber String?` to `Member` in `prisma/schema.prisma` and regenerated Prisma Client.
- **Numbers-Only Input Filtering & Validation**:
  - Filtered input in real time using `e.target.value.replace(/\D/g, '').slice(0, 6)` ensuring only numbers can be entered.
  - Enforced that exactly 6 digits must be entered (`trimmed.length === 6`).
  - Displays inline error *"Member number must be 6 numbers"* with `<CautionIcon />` and error outline if fewer than 6 numbers are entered upon blur/submit.
  - Displays *"This field must not be empty"* if left blank.
  - Mirrored exact 6-digit check (`/^\d{6}$/`) in `submitSignUp` (`app/auth/actions.ts`).

### Phase 17: Password Field with Show/Hide View Toggle
- **Swapped PIN for Password & Removed Confirmation Field**:
  - Replaced the 4-digit PIN setup in `SignUpView` with a flexible Password field (`name="password"`).
  - Completely eliminated the Confirm Password input to streamline the onboarding experience.
  - Added `passwordHash String?` to `Member` in `prisma/schema.prisma` and regenerated Prisma Client.
- **Inline Visibility Toggle**:
  - Added an interactive eye / eye-off toggle button (`showPassword` state) positioned inside the password input field.
  - Toggles the input type between `"password"` and `"text"` so members can see their password as they type or inspect it afterwards.
  - Fully accessible with dynamic `aria-label` (`"Show password"` / `"Hide password"`).
- **Validation**:
  - Enforced a minimum password length of 6 characters (`password.length >= 6`).
  - Displays *"Password must be at least 6 characters"* and *"This field must not be empty"* with `<CautionIcon />` and error outline when invalid.
  - Securely hashed with bcrypt and persisted in `submitSignUp`.

### Phase 18: Dynamic Password Hint on Typing
- **Hidden by Default**:
  - The password requirement hint (*"Must be at least 6 characters."*) is hidden when the sign-up form initially loads (`password === ''`).
- **Interactive Inline Appearance**:
  - Dynamically renders as inline text under the password field the moment the user types their first character (`password.length > 0`).
  - If the user leaves the field without meeting requirements, transitions cleanly into the appropriate inline error message (*"This field must not be empty"* or *"Password must be at least 6 characters"*) with `<CautionIcon />` and error outline.

### Phase 19: Removal of Member Number Field Hint
- **Cleaned Field Layout**:
  - Removed the static helper hint text (*"6-digit member number from the gym."*) beneath the Member number field in `SignUpView`.
  - The space below the input now remains clean unless an inline validation error is triggered.

### Phase 20: Create Account Button Renaming & Conditional Disabling
- **Button Label Rename**:
  - Renamed the submit button in `SignUpView` from *"Create account & enter"* to *"Create Account"*.
- **Conditional Disabled State**:
  - Added `disabled?: boolean` support to the shared `SubmitButton` component.
  - Computed `isFormComplete` requiring all fields to be valid and error-free:
    - Full Name: >= 2 chars and >= 2 names separated by space.
    - Email: valid RFC-compliant format.
    - Member Number: exactly 6 numeric digits.
    - Password: >= 6 characters.
    - Zero active field errors (`!nameError && !emailError && !memberNumberError && !passwordError`).
  - Disabled the button by default until all criteria are met, utilizing `--state-disabled-opacity` and `cursor: not-allowed`.

### Phase 21: Terms Consent Checkbox & Interactive Terms and Conditions Dialog
- **Agree to Terms Consent Checkbox**:
  - Inserted an accessible checkbox (`id="signup-agree-terms"`, `name="agreeTerms"`, `value="true"`) directly preceding the "Create Account" button in `SignUpView`.
  - Styled with Aurora design system tokens (`accent-color: var(--color-primary)`, custom focus-visible ring, flex alignment).
  - Wired into `isFormComplete` so the "Create Account" button remains disabled until the user explicitly checks the consent box.
  - Mirrored consent validation in `submitSignUp` (`app/auth/actions.ts`) to enforce agreement on the server side as well.
- **Interactive & Clickable Spotter Terms and Conditions**:
  - Embedded an interactive button link for *"Spotter Terms and Conditions"* within the consent label.
  - Uses `e.stopPropagation()` so clicking the terms link opens the full terms document without inadvertently toggling the checkbox.
  - Dynamically renders the comprehensive, NDPA 2023-compliant `LegalView` modal dialog overlay (`activeView="terms"`) on top of the view.
  - Preserves all entered sign-up inputs in state when the user closes the legal overlay and returns to the form.

### Phase 22: Development Auth Store & Graceful Database URL Fallback
- **Database Connection Guard**:
  - Exported `hasDatabaseUrl = Boolean(process.env.DATABASE_URL)` in `lib/db.ts` and guarded `PrismaClient` initialization so missing environment variables never cause premature initialization crashes.
- **In-Memory Development Store**:
  - Implemented `lib/auth/dev-store.ts` using `globalThis` maps to safely persist newly created members and active sessions across hot reloads during development when `DATABASE_URL` is unset.
- **Seamless Local Sign-Up Flow**:
  - Updated `submitSignUp`, `submitSignIn`, `submitActivationCode`, and `submitPin` in `app/auth/actions.ts` to branch seamlessly: saving to `dev-store` when local database environment variables are missing, and utilizing Prisma ORM whenever `DATABASE_URL` is present.
  - Updated `createSession`, `getSession`, and `destroySession` in `lib/auth/session.ts` to maintain identical cookie and device linkage logic across both modes.
  - Fixes the `PrismaClientInitializationError: Environment variable not found: DATABASE_URL` runtime error, allowing sign-ups to immediately establish member sessions and load the `/member` dashboard.

### Phase 23: Environment Configuration (.env) & Database Connection Resilience
- **Environment Secrets Setup (`.env`)**:
  - Initialized `.env` in the project root following `.agent/rules/environment.md` rules with proper server vs. public prefixing.
  - Configured PostgreSQL `DATABASE_URL` with connection guidelines for local dev and hosted providers (Supabase / Neon).
  - Configured secret placeholders for Paystack (`PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`) and AI models (`GEMINI_API_KEY`, `OPENAI_API_KEY`).
  - Confirmed `.env` is safely ignored by Git via `.gitignore`.
- **Database Connection Error Resilience**:
  - Wrapped Prisma database writes in `app/auth/actions.ts` and `lib/auth/session.ts` with structured error handling so if a configured database is unreachable or offline, the application logs a warning and seamlessly falls back to the development store without blocking user sign-ups or breaking navigation to `/member`.

### Phase 24: Modern Sign-In with Member Number & Password
- **Swapped 4-Digit PIN for Member Number & Password**:
  - Replaced the legacy 4-digit PIN input across both the dedicated auth card (`SignInView` in `components/auth/unified-auth-card.tsx`) and the landing page modal (`SignInForm` in `components/auth/sign-in-modal.tsx`).
  - Added a 6-digit numeric **Member number** field with real-time numeric filtering, `maxLength={6}`, and `inputMode="numeric"`.
  - Added a **Password** field complete with an accessible visibility view toggle button (eye/eye-off SVG icons with `aria-label` and `aria-hidden` attributes).
- **Interactive Validation & Dynamic Disabling**:
  - Integrated real-time blur and submit validation displaying inline error messages (*"This field must not be empty"*, *"Member number must be 6 numbers"*, *"Password must be at least 6 characters"*) accompanied by `<CautionIcon />` and input error outlines.
  - Disabled the "Sign in" button until both Member number and Password are valid and error-free.
- **Server Action & Authentication Updates**:
  - Updated `submitSignIn` in `app/auth/actions.ts` to validate the 6-digit member number and password, check password hashes using `verifyPin`, and update device binding upon successful login.
  - Added `findDevMemberByMemberNumber` to `lib/auth/dev-store.ts` for in-memory dev store authentication parity.

### Phase 25: Database Model Design Enhancements & Integrity Constraints
- **Member Model Uniqueness & Indexing**:
  - Added `@unique` constraints to `Member.email` and `Member.memberNumber` in `prisma/schema.prisma` to guarantee that no duplicate accounts can be created with the same credentials.
  - Added index `@@index([deviceId])` to optimize single-device lookup and session binding.
- **Relational Integrity & Cascade Deletes**:
  - Configured `onDelete: Cascade` across all member-owned child relations: `Attendance`, `Payment`, `PaymentAttempt`, `QuestionLog`, and `Session`. Deleting or managing test members in Prisma Studio now cleanly cleans up all associated records without foreign key constraint violations.
  - Configured `onDelete: Cascade` on `CardVersion` linked to `Card`.
  - Added explicit foreign key index lookups (`@@index([memberId])`, `@@index([cardId])`) across all child tables to accelerate relational queries.
- **P2002 Constraint Handling in Auth Actions**:
  - Updated `submitSignUp` in `app/auth/actions.ts` to detect Prisma code `P2002` violations and surface specific, user-friendly error messages (*"An account with this member number already exists"* or *"An account with this email address already exists"*) directly in the UI.
- **Prisma Client Regeneration**:
  - Regenerated Prisma Client bindings via `npx prisma generate` and verified clean compilation across the TypeScript project.

### Phase 26: Nodemailer Email Service & Welcome Email Notification
- **Nodemailer Setup**:
  - Installed `nodemailer` and `@types/nodemailer`.
  - Configured SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) in `.env` and `.env.example`.
- **Mailer Module (`lib/email/mailer.ts`)**:
  - Built a resilient transporter creator (`getMailTransporter`) and generic `sendEmail` sender that logs cleanly to console in dev mode when SMTP is unset, avoiding crashes.
  - Implemented branded HTML/text `sendWelcomeEmail` template delivering the member's 6-digit Member Number and portal access instructions.
- **Sign-Up Integration**:
  - Wired `sendWelcomeEmail` into `submitSignUp` (`app/auth/actions.ts`) to asynchronously dispatch the welcome notification without blocking the client redirect to `/member`.

### Phase 27: Nodemailer Architectural Enforcement & Formal Rules
- **Stack & Folder Map Modernization**:
  - Added Nodemailer to Spotter's official technology stack in `AGENTS.md`.
  - Registered `lib/email/mailer.ts` in the folder map and established the mandatory rule: *"Always use Nodemailer via lib/email/mailer.ts to send emails; do not introduce alternative mail libraries."*
- **Rules Documentation (`.agent/rules/email.md`)**:
  - Created `.agent/rules/email.md` defining strict constraints:
    1. All outgoing emails must exclusively route through `nodemailer` via `lib/email/mailer.ts`.
    2. Email dispatching must execute asynchronously to prevent blocking Server Action responses.
    3. All transactional templates must provide responsive HTML and fallback plain-text using brand tokens.
    4. Safe fallback logging when credentials are unset in local development environments.

### Phase 28: Human Tone & Punctuation Cleanup
- **Removed Em-Dashes & AI-like Punctuation**:
  - Replaced all em-dashes (`—`) across email templates (`lib/email/mailer.ts`), the landing page (`app/page.tsx`), and client interactive islands (`components/landing/landing-client.tsx`, `components/auth/sign-in-modal.tsx`).
  - Rewrote copy with natural, human phrasing (e.g. *"Spotter: Your gym, at your fingertips"*, *"Get started for free"*, *"answers grounded in approved gym records with no guesswork"*).
  - Cleaned email sign-off to natural closing (*"The Spotter Gym Team"*).
- **Parity in Auth Modal**:
  - Updated helper footnote in `components/auth/sign-in-modal.tsx` to reference password entry matching the modern auth layout.

### Phase 29: Email Input Normalization to Lowercase
- **Client-Side Real-Time Normalization**:
  - Updated the email input field in `SignUpView` (`components/auth/unified-auth-card.tsx`) to immediately transform any uppercase input into lowercase via `setEmail(e.target.value.toLowerCase())` as the user types.
- **Server-Side Normalization**:
  - Added `.toLowerCase()` to `formData.get('email')` extraction in `submitSignUp` (`app/auth/actions.ts`), guaranteeing all email records in the Supabase PostgreSQL database and Nodemailer recipient headers are permanently lowercase.

### Phase 30: Universal Email Normalization Across All Forms & Handlers
- **Validation Utility (`lib/auth/validation.ts`)**:
  - Added centralized `normaliseEmail(raw)` and `validateEmail(raw)` helper functions that trim whitespace and convert all email addresses to lowercase.
- **Client Form Input & Blur (`components/auth/unified-auth-card.tsx`)**:
  - Enhanced email input handling to guarantee instant lowercase normalization during typing and complete whitespace trimming and lowercasing on blur.
- **Server Action & Validation (`app/auth/actions.ts`)**:
  - Refactored `submitSignUp` to use centralized `validateEmail`, ensuring all incoming form submissions are consistently normalized before database persistence.
- **Development Store Normalization (`lib/auth/dev-store.ts`)**:
  - Normalized email storage in `saveDevMember` and added `findDevMemberByEmail` using case-insensitive matching.
- **Nodemailer Dispatch Normalization (`lib/email/mailer.ts`)**:
  - Sanitized recipient email addresses in `sendEmail` and `sendWelcomeEmail` with `.toLowerCase().trim()` to prevent SMTP casing discrepancies.

### Phase 31: Zod Server-Side Form Validation Across All Actions
- **Zod Installation & Core Schemas (`lib/validation/auth.ts`)**:
  - Installed `zod` and established declarative schemas grounded in PRD thresholds:
    1. `signUpSchema`: Validates 2+ names, normalized lowercase email, 6-digit member number, 6+ character password, and terms agreement.
    2. `signInSchema`: Validates 6-digit member number and 6+ character password.
    3. `activationCodeSchema`: Validates 4-20 alphanumeric characters, normalized to uppercase.
    4. `pinSetupSchema`: Validates exactly 4-digit numeric PIN with matching confirmation.
- **Unified Validation Helper (`validateWithZod`)**:
  - Built generic `validateWithZod` parser that cleanly converts Next.js `FormData` to typed values, formats first-issue error messages, and generates structured field-level errors.
- **Server Action Refactoring (`app/auth/actions.ts`)**:
  - Replaced imperative manual validation with declarative `validateWithZod` calls across `submitSignUp`, `submitSignIn`, `submitActivationCode`, and `submitPin`.
- **Backward Compatibility (`lib/auth/validation.ts`)**:
  - Re-exported all Zod schemas, types, and helpers from `lib/validation/auth.ts` while preserving legacy utility signatures.

### Phase 32: Password & PIN Field Trimming Across All Forms
- **Zod Schema Trimming (`lib/validation/auth.ts`)**:
  - Added `.transform((val) => val.trim())` to `password` in both `signUpSchema` and `signInSchema`, guaranteeing all passwords submitted to server actions have leading/trailing whitespace automatically stripped.
- **Client Form Input & Blur (`components/auth/unified-auth-card.tsx`)**:
  - In `SignInView`: Updated `onBlur` to automatically trim password state, updated `isPasswordValid` check and validation error handler to evaluate trimmed length.
  - In `SignUpView`: Added whitespace trimming on blur for password input, updated minimum length validation and hint checks against trimmed values.
  - In `PinSetupView`: Added whitespace trimming on blur for both PIN and confirm PIN inputs.
- **Sign-In Modal Form (`components/auth/sign-in-modal.tsx`)**:
  - Added password trimming on blur and updated error checking to evaluate trimmed values.
- **Legacy PIN Setup Form (`components/auth/pin-form.tsx`)**:
  - Added whitespace trimming on blur for both PIN and confirm PIN inputs.

### Phase 33: Server-Side IP Rate Limiting Across All Forms
- **Rate Limiter Module (`lib/rate-limit.ts`)**:
  - Implemented an in-memory sliding window rate limiter keyed by client IP address.
  - Added header resolution support for reverse proxy environments (`x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`) with local development fallback (`127.0.0.1`).
  - Added automatic store pruning to prevent memory growth under high traffic.
- **Form Action Integration (`app/auth/actions.ts`)**:
  - Attached rate limit checks at the very beginning of all server actions:
    1. `submitSignUp`: 5 attempts per 10 minutes per IP.
    2. `submitSignIn`: 5 attempts per 5 minutes per IP.
    3. `submitActivationCode`: 5 attempts per 10 minutes per IP.
    4. `submitPin`: 5 attempts per 5 minutes per IP.
  - Rate limiting executes before database queries and CPU-intensive bcrypt hashing to prevent resource exhaustion attacks.
- **Threshold Rules (`.agent/rules/thresholds.md`)**:
  - Added Rule 6 defining operational limits and windows for form submissions.

### Phase 34: Breached Password Protection with HaveIBeenPwned API
- **HIBP k-Anonymity Service (`lib/validation/pwned.ts`)**:
  - Implemented `isPasswordBreached(password)` querying Troy Hunt's official HIBP Pwned Passwords Range API.
  - **k-Anonymity Privacy Guarantee**: Computes SHA-1 hash locally, sends only the 5-character prefix to the API, and evaluates matching suffixes locally. The candidate password never leaves the server.
  - Added `Add-Padding: true` header to prevent response-length analysis.
  - Configured 2.5s timeout with graceful fallback (`fail open`) on network timeouts/errors to ensure registration is never disrupted if the external API experiences outages.
- **Sign-Up Integration (`app/auth/actions.ts`)**:
  - Connected `isPasswordBreached` into `submitSignUp` right after schema validation.
  - If the password exists in known data breaches, registration stops and returns: *"This password has appeared in a data breach. Please choose a more secure password."*

### Phase 35: Email Verification System (randomBytes & Dashboard Banner)
- **Database & Dev Store Synchronization**:
  - Added `emailVerified Boolean @default(false)`, `verificationCode String?`, and `verificationCodeExpiresAt DateTime?` to `Member` in `prisma/schema.prisma`.
  - Pushed schema changes to PostgreSQL via `npx prisma db push` and regenerated Prisma Client.
  - Mirrored fields and helpers (`updateDevMemberEmailVerification`, `setDevMemberVerificationCode`, `findDevMemberById`) in `lib/auth/dev-store.ts`.
- **Cryptographic Code Generation (`lib/auth/email-verification.ts`)**:
  - Implemented `generateEmailVerificationCode()` using `node:crypto`'s `randomBytes(4)`.
  - Uses rejection sampling against `0xFFFFFFFF - (0xFFFFFFFF % 900000)` to completely eliminate modulo bias, generating uniform 6-digit numeric codes between `100000` and `999999`.
  - Established a 24-hour expiration window (`VERIFICATION_CODE_EXPIRY_MS`).
- **Nodemailer Branded Template (`lib/email/mailer.ts`)**:
  - Implemented `sendVerificationEmail({ to, fullName, code })` with a branded Aurora-themed responsive email template displaying the 6-digit code in a high-contrast card with letter-spacing.
  - Followed AGENTS.md rule requiring Nodemailer via `lib/email/mailer.ts` exclusively.
- **Auto-Login & Code Dispatch on Sign Up (`app/auth/actions.ts`)**:
  - Updated `submitSignUp` to generate the 6-digit code, persist it with expiration, automatically log the user in via session cookies, redirect directly to `/member`, and dispatch the verification email in the background.
- **Server Actions for Verification & Resend (`app/member/actions.ts`)**:
  - Created `submitEmailVerification`: Protected by IP rate limiting (`RATE_LIMITS.VERIFY_EMAIL`), validates candidate 6-digit code against the stored code and expiration, marks `emailVerified: true`, clears code fields, and revalidates `/member`.
  - Created `resendEmailVerification`: Protected by IP rate limiting (`RATE_LIMITS.RESEND_VERIFICATION`), generates a fresh code, updates storage, dispatches a new email, and provides client cooldown.
- **Dashboard Banner Component (`components/member/email-verification-banner.tsx`)**:
  - Client component rendered conditionally on `/member` when `!session.emailVerified && session.email`.
  - Features 6-digit numeric input with monospace letter-spaced styling, inline validation feedback, "Verify Email" action, and "Resend code" action with a 60-second cooldown timer.
  - Transitions into a confirmed state upon successful verification.

### Phase 36: Platform Education Onboarding Flow
- **Strategic Goal (Education for the Platform)**:
  - Positioned an interactive onboarding flow directly between account creation and the member dashboard (`/onboarding`).
  - Chosen specifically to educate new members on Spotter's self-service model, preventing front desk queues upon their first gym visit.
- **Three Step Educational Walkthrough (`components/onboarding/onboarding-flow.tsx`)**:
  - **Step 1 (Daily Whiteboard Check-In)**: Explains the daily 4-digit code located on the gym entrance whiteboard and highlights the 4-hour suppression window. Features a simulated whiteboard badge mockup.
  - **Step 2 (Ask Spotter)**: Explains grounded AI retrieval for gym hours, rules, and equipment, noting that medical advice and billing disputes route directly to WhatsApp front desk staff. Features a verified Q&A mockup.
  - **Step 3 (Records & Renewals)**: Explains self-service attendance tracking, active day countdowns, single-device binding security, and direct Paystack renewals. Features a membership pass mockup.
- **Interactive UI & Aurora Theming (`components/onboarding/onboarding.module.css`)**:
  - Dark mode glassmorphism card with ambient glow, dynamic step badge, progress bar tracker, responsive buttons ("Next", "Back", "Enter Member Portal"), and a "Skip to Dashboard" bypass link.
  - Personalized with member's first name loaded from session.
- **Route Gating & Integration**:
  - Created Server Component at `app/onboarding/page.tsx` verifying session before rendering.
  - Updated `submitSignUp` in `app/auth/actions.ts` to redirect directly to `/onboarding`.

### Phase 37: Complete Aurora Design System & Light/Dark Mode Unification
- **Comprehensive Token Audit & Elimination of Ad-Hoc Styles**:
  - Audited all user-facing surfaces across landing (`app/page.tsx`, `app/landing.module.css`), authentication screens & modals (`components/auth/auth.module.css`, `components/auth/sign-in-modal.tsx`), onboarding (`app/onboarding/`, `components/onboarding/onboarding.module.css`), member dashboard (`app/member/page.tsx`, `app/member/member.module.css`), and email verification banners (`components/member/email-verification-banner.module.css`).
  - Completely purged hardcoded pixel font sizes, custom line heights, raw rem measurements (`1.125rem`, `0.5rem`), and legacy gray palettes (`#111827`, `#1f2937`, `#374151`).
  - Switched all typography to official Aurora quintets (`--typography-<role>-font-family`, `--typography-<role>-font-size`, `--typography-<role>-font-weight`, `--typography-<role>-line-height`, `--typography-<role>-letter-spacing`).
- **Semantic Color Roles & On-Color Enforcement**:
  - Enforced exact on-color pairings across both Light Mode (`:root`) and Dark Mode (`[data-theme="dark"]`, `@media (prefers-color-scheme: dark)`):
    - `--color-primary` paired strictly with `--color-on-primary` (Light: `#FFFFFF` on `#4F46E5`; Dark: `#211A64` deep violet on `#C0BCF9` lavender).
    - `--color-primary-container` paired strictly with `--color-on-primary-container` (Light: `#0D0A3D` on `#DEDBFC`; Dark: `#DEDBFC` on `#352C82`).
    - `--color-warning-container` paired strictly with `--color-on-warning-container` (Light: `#634407` on `#FFE7B0`; Dark: `#FFE7B0` on `#8A600A`).
    - `--color-success-container` paired strictly with `--color-on-success-container` (Light: `#15492B` on `#C8ECD3`; Dark: `#C8ECD3` on `#1B6139`).
    - `--color-error-container` paired strictly with `--color-on-error-container` (Light: `#591310` on `#F7C9C6`; Dark: `#F7C9C6` on `#7F1D19`).
- **Transactional Email Dark/Light Theme Integration (`lib/email/mailer.ts`)**:
  - Completely re-engineered `sendWelcomeEmail` and `sendVerificationEmail` HTML templates.
  - Declared `<meta name="color-scheme" content="light dark">` and embedded `@media (prefers-color-scheme: dark)` styles with exact Aurora token hex values for mail clients supporting dark mode.
  - In light mode: clean `#FCFCFF` background, `#FFFFFF` card, `#4F46E5` header, `#DEDBFC` badge with `#0D0A3D` numbers.
  - In dark mode: `#1B1B1F` background, `#303034` card, `#352C82` header with `#DEDBFC` text, `#352C82` badge with `#DEDBFC` numbers.
  - Maintained zero em-dashes across all email templates and user-facing copy.

### Phase 38: GSAP Outline Motion Illustrations for Onboarding Flow
- **Package Installation**:
  - Received user consent and installed `gsap` (GreenSock Animation Platform) in compliance with the AGENTS.md package addition rule.
- **Pure Outline Motion Components (`components/onboarding/onboarding-illustrations.tsx`)**:
  - Engineered three dedicated, SVG outline-only motion illustration components (`fill="none"`, consistent `strokeWidth`, smooth corner radii):
    - **`StepOneIllustration` (Check In with Daily Whiteboard Code)**: Features an outline whiteboard on a tripod easel, an animated dry-erase marker handwriting the 4-digit code sequentially (`4`, `8`, `2`, `1`), an outline member smartphone emitting communication wave arcs, a checkmark validation pulse, and a rotating 4-hour suppression window clock indicator.
    - **`StepTwoIllustration` (Ask Spotter About Gym Rules & Hours)**: Features a central pulsing AI search orb with concentric outline ripples, surrounded by floating outline gym badges (dumbbell for equipment etiquette, clock for peak schedules, steam waves for sauna/amenities, and a verified policy shield), with floating question/answer dialogue bubbles and animated stroke-dash rays.
    - **`StepThreeIllustration` (Track Records & Online Renewals)**: Features an outline Spotter digital membership pass with holographic chip and dynamic active-meter arc, a 9-day attendance calendar with sequentially illuminating streak points, contactless Paystack renewal signal waves, and a single-device security padlock that snaps locked.
- **GSAP Lifecycle & Clean Teardown**:
  - Built using scoped `gsap.context(..., containerRef)` inside React `useEffect` for clean cleanup and no memory leaks across step transitions.
  - Built-in `prefers-reduced-motion` detection that gracefully renders crisp static vector illustrations if reduced motion is requested.
  - Strict consumption of Aurora theme tokens (`var(--color-primary)`, `var(--color-on-surface)`, `var(--color-outline)`, `var(--color-surface-container)`), automatically harmonizing across Light and Dark mode.
- **Onboarding Integration (`components/onboarding/onboarding-flow.tsx`, `components/onboarding/onboarding.module.css`)**:
  - Replaced static preview boxes with `.illustrationWrapper` hosting each step's motion illustration.

---

### Phase 39: Front Desk Receptionist Dashboard & Secure Member Number Generation
- **Perimeter & Role Boundary Separation (`proxy.ts`, `lib/auth/cookies.ts`, `lib/auth/staff-session.ts`)**:
  - Gated the `/staff` route hierarchy exclusively to authenticated staff sessions via `spotter_staff_session` HTTP-only cookies, separating front desk staff privileges completely from member cookies (`spotter_session`).
  - Added dedicated 8-hour shift lifetime (`STAFF_SESSION_SECONDS = 8 * 60 * 60`).
  - Implemented cryptographic HMAC-SHA256 session token signatures coupled with authoritative database checks (`isActive: true` and `role in ['STAFF', 'OWNER']`) on every request to ensure immediate session termination upon staff revocation.
- **Cryptographic Member Number Generation (`lib/member/generate-number.ts`)**:
  - Implemented rejection sampling with Node.js `crypto.randomBytes(4)` without modulo bias to uniformly generate 6-digit member numbers between `100000` and `999999`.
  - Added collision prevention loop with uniqueness checks against Prisma database and fallback dev store.
  - Implemented human-readable activation codes (`SPT-XXXX`) avoiding ambiguous characters (`0`, `1`, `I`, `O`).
- **Security & Unlinked Credential Guarantees (`createIntendingMember`)**:
  - Followed zero-trust member privacy principles: new intending member records initialize with `deviceId: null`, `pinHash: null`, and `passwordHash: null`.
  - Staff never see or set member PINs. The intending member binds their own personal device and sets their private PIN at `/activate`.
  - Opening balance stored strictly as integer kobo.
- **Rate Limiting & Abuse Prevention (`lib/rate-limit.ts`, `app/staff/actions.ts`)**:
  - Added `STAFF_LOGIN` (5 attempts / 15 minutes per IP) to prevent credential stuffing.
  - Added `STAFF_GENERATE_MEMBER` (30 member creations / hour per staff ID) to prevent automated flooding.
- **Aurora-Compliant Front Desk UI (`components/staff/`, `app/staff/`)**:
  - `components/staff/staff.module.css`: Styled 100% with Aurora tokens (`--color-*`, `--spacing-*`, `--radius-*`, `--typography-*`) with complete Light and Dark mode adaptability. Zero em-dashes across all text and UI elements.
  - `components/staff/staff-login-form.tsx`: Desk sign-in form with security advisory notice, field validation, and dev-seed helper for initial setup.
  - `components/staff/receptionist-dashboard.tsx`: Front desk dashboard featuring:
    - Receptionist identity header and role badge.
    - New Member Details form with Tier toggle, duration selector, and kobo balance tracking.
    - Assigned Member Number success display with 1-click clipboard copy and receptionist handover protocol.
    - Security perimeter guardrails panel detailing cryptographic sampling and device binding rules.
    - Real-time recent desk registrations table monitoring device activation status (`Pending Setup` vs `Active`).
  - `app/staff/page.tsx` & `app/staff/login/page.tsx`: Route entry points enforcing session gates.

---

### Phase 40: Application-Level Role-Based Access Control (RBAC)
- **Granular Permission Matrix (`lib/auth/rbac.ts`)**:
  - Implemented an authoritative permission catalog covering Member (`member:*`), Staff (`staff:*`), and Owner (`owner:*`) capabilities.
  - Defined explicit least-privilege mappings in `ROLE_PERMISSIONS`:
    - `MEMBER`: Access personal profile, attendance history, balance, check in with whiteboard code, ask AI questions, and pay renewals. Barred from administrative actions.
    - `STAFF`: Generate member numbers, set daily whiteboard check-in codes, log manual check-ins and payments, look up member status, force-unlink devices, and draft shared cards. Barred from owner approvals and member private records.
    - `OWNER`: Inherits all front-desk operational permissions plus card approvals with vector embeddings, tier assignment, balance adjustments, fee absorption toggles, and wrong answer reviews.
- **Permission Assertion Guards**:
  - `hasPermission(role, permission)`: Deterministic boolean capability check.
  - `assertPermission(role, permission)`: Typed `AuthorizationError` trigger.
  - `getAuthorizedStaff(requiredPermission)` & `getAuthorizedMember(requiredPermission)`: Validates active authenticated session and executes permission assertion before allowing Server Action mutations.
- **Server Action & Route Gating Integration**:
  - Updated `app/staff/actions.ts` (`generateMemberNumberAction`) to assert `PERMISSIONS.STAFF_GENERATE_MEMBER` prior to record creation.
  - Updated `app/staff/page.tsx` to assert `PERMISSIONS.STAFF_GENERATE_MEMBER` on page render.

---

## 💡 Key Architectural Decisions & Rationale

1. **Why `proxy.ts` instead of complex database middleware?**
   - Hitting PostgreSQL/Prisma on every request (including client prefetches) adds latency and exhausts connection pools. `proxy.ts` performs lightweight cookie presence checks, leaving authoritative database authorization to Server Actions and protected queries.

2. **Why Client Islands on the Landing Page?**
   - The landing page needs static marketing performance and instant SEO indexing, but the interactive sign-in modal requires React state (`useState`). Isolating button triggers into small client islands preserves `page.tsx` as a pure Server Component.

3. **Why Restrict Indexing to Marketing Only?**
   - Spotter is a private member application. Indexing member check-in portals or activation flows invites web crawlers to sensitive routes. Explicitly declaring `robots: noindex, nofollow` on non-marketing pages ensures strict perimeter isolation.
