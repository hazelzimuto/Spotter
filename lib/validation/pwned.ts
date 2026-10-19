import { createHash } from 'node:crypto'

/**
 * HAVE I BEEN PWNED (HIBP) BREACHED PASSWORD CHECKER
 *
 * Implements the k-Anonymity model by Troy Hunt:
 * 1. Computes the SHA-1 hash of the password.
 * 2. Sends ONLY the first 5 hexadecimal characters (prefix) to HIBP Range API.
 * 3. HIBP returns a list of matching hash suffixes without ever seeing the user's password.
 * 4. Compares the remaining 35 characters (suffix) locally.
 *
 * Includes timeout and fallback handling so registration is never blocked
 * if HIBP is temporarily degraded or offline.
 */

export interface BreachedPasswordCheckResult {
  breached: boolean
  count: number
  error?: string
}

const HIBP_API_URL = 'https://api.pwnedpasswords.com/range'
const TIMEOUT_MS = 2500

/**
 * Checks whether candidate password has appeared in known public data breaches.
 */
export async function isPasswordBreached(password: string): Promise<BreachedPasswordCheckResult> {
  if (!password || typeof password !== 'string') {
    return { breached: false, count: 0 }
  }

  try {
    // 1. Calculate SHA-1 digest (hex, uppercase)
    const sha1Hash = createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = sha1Hash.slice(0, 5)
    const suffix = sha1Hash.slice(5)

    // 2. Query HIBP range API with 5-character prefix
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(`${HIBP_API_URL}/${prefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Spotter-Gym-App',
        'Add-Padding': 'true', // Prevents response size side-channel analysis
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`[PwnedPasswords] HIBP API returned HTTP ${response.status}. Skipping check.`)
      return { breached: false, count: 0, error: `HTTP ${response.status}` }
    }

    // 3. Scan returned hash suffixes
    const body = await response.text()
    const lines = body.split(/\r?\n/)

    for (const line of lines) {
      const [lineSuffix, countStr] = line.split(':')
      if (lineSuffix && lineSuffix.trim() === suffix) {
        const count = parseInt(countStr?.trim() || '0', 10)
        return { breached: true, count }
      }
    }

    return { breached: false, count: 0 }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error)
    // Fail open on network errors or timeouts so legitimate user registration is never blocked
    console.warn('[PwnedPasswords] Unable to check breached password list (falling open):', errMessage)
    return { breached: false, count: 0, error: errMessage }
  }
}
