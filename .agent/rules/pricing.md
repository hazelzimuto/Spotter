# Pricing Rules

## Job
Define payment gateway fee formulas, fee absorption settings, and currency unit conversions.

## Rules and Reasons

### Rule 1
Local Paystack transaction fee formula is `1.5% + 100 Naira`, capped at `2000 Naira` for transactions above `126666.67 Naira`.
**Reason**: Accurately calculates gateway processing charges for membership payments.

### Rule 2
`isFeeAbsorbed` setting determines whether transaction fees are added to member checkout totals or paid by the gym owner.
**Reason**: Allows the gym owner to configure payment collection policies dynamically.

### Rule 3
All monetary amounts must be converted from Naira to kobo using `Amount_in_Kobo = Math.round(Amount_in_Naira * 100)`.
**Reason**: Integer conversion prevents fractional currency rounding errors in database ledgers.
