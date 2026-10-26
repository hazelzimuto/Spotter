export interface SubscriptionPlan {
  id: string
  name: string
  tier: 'BASIC' | 'PREMIUM'
  pricePounds: number
  pricePence: number
  interval: 'month' | 'year'
  badge?: string
  description: string
  features: string[]
}

/**
 * UK Gym Subscription Plans (GBP / Pence)
 * Inclusive of standard UK 20% VAT.
 */
export const UK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic Monthly',
    tier: 'BASIC',
    pricePounds: 35,
    pricePence: 3500,
    interval: 'month',
    description: 'Full access to gym floor, cardio equipment, and standard locker facilities.',
    features: [
      'Full gym floor & free weights access',
      'Cardio suite & functional turf area',
      'Locker rooms & shower facilities',
      'Spotter digital check-in & attendance tracking',
      'Standard opening hours (6am – 10pm)',
    ],
  },
  {
    id: 'premium-monthly',
    name: 'Premium All-Access',
    tier: 'PREMIUM',
    pricePounds: 55,
    pricePence: 5500,
    interval: 'month',
    badge: 'MOST POPULAR',
    description: 'Unlimited 24/7 access, boutique studio classes, Finnish sauna & guest passes.',
    features: [
      'Everything in Basic included',
      '24/7 keyless digital door entry',
      'Unlimited boutique classes (HIIT, Yoga, Spin)',
      'Finnish sauna & recovery lounge access',
      '1 complimentary monthly guest pass',
      'Priority access to approved gym cards & records',
    ],
  },
  {
    id: 'premium-annual',
    name: 'Annual VIP Pass',
    tier: 'PREMIUM',
    pricePounds: 550,
    pricePence: 55000,
    interval: 'year',
    badge: 'SAVE £110',
    description: 'Commit to your year of fitness with 2 months free and complimentary gym kit.',
    features: [
      'All Premium All-Access features for 12 months',
      'Pay for 10 months, get 2 months completely free',
      'Complimentary Spotter premium shaker & towel',
      'Dedicated locker reservation option',
    ],
  },
]

/** Formats an integer amount in British pence into a localized £ GBP currency string. */
export function formatGbp(pence: number): string {
  const pounds = (pence || 0) / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pounds)
}

/** Calculates 20% UK VAT portion included in the gross price. */
export function calculateUkVat(totalPence: number): { netPence: number; vatPence: number } {
  const netPence = Math.round(totalPence / 1.2)
  const vatPence = totalPence - netPence
  return { netPence, vatPence }
}
