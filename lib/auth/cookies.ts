/**
 * Cookie names and lifetimes for the FR-6 auth flow.
 *
 * Server-only module: every export here must stay out of client bundles.
 * (The `server-only` guard package would enforce this but is not installed.)
 *
 * .agent/rules/environment.md rule 3: server credentials must never be
 * prefixed NEXT_PUBLIC_. None of these are exposed to the client.
 */

export const SESSION_COOKIE = 'spotter_session'

/**
 * Identifies the browser instance so a member stays linked to exactly one
 * device (FR-6: "Only one device may be linked to a member at a time").
 */
export const DEVICE_COOKIE = 'spotter_device'

/**
 * Carries the memberId between the activation code step and the PIN step so
 * the PIN screen can never be reached without a validated code.
 */
export const PENDING_ACTIVATION_COOKIE = 'spotter_pending_activation'

/**
 * FR-6: "A session remains active indefinitely until unlinked or logged out."
 * The PRD sets no expiry, so the cookie is given the maximum practical
 * lifetime and the server session row carries no expiresAt.
 */
export const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10

/** The activation code only needs to survive the hop to the PIN screen. */
export const PENDING_ACTIVATION_SECONDS = 60 * 10

export function isSecureInProduction() {
  return process.env.NODE_ENV === 'production'
}
