# Spotter: Refined Product Idea

---

## 1. What is it, in one sentence?

Spotter is a private app that gym members use to look up their own attendance, balance, and the gym's timetable and rules without waiting for the desk.

---

## 2. Who is it for, and when do they open it?

Chisom is 28, works as an accountant in Lagos, and joined the gym four months ago. She goes four times a week, more or less, depending on deadlines and traffic. She has a Tecno Spark with 1.5 GB of data left.

She opens Spotter about 16 times a month. Nine of those times she opens it to check in when she walks through the gym door. It takes three taps and she does not think about it. Three times she opens it standing outside the gym at 6pm, wondering whether the 7pm class is still on or whether she misremembered the time. Once she opens it on a Sunday to check whether she already renewed for the month. Once she opens it because her friend asked her when the Saturday morning class starts and she does not want to seem like she does not know.

She does not open it because she is curious about the product. She opens it because it is faster than calling the desk, and the desk closes at eight.

---

## 3. What goes wrong today without it?

Amara pays her 15,000 naira membership renewal in cash on a Wednesday afternoon. The officer writes it in the ledger and hands her a handwritten receipt. Saturday morning she arrives early for the 7am HIIT class. A different officer is at the desk. The Saturday officer cannot find the Wednesday ledger entry. He tells Amara her access card is blocked. Amara shows him the handwritten receipt. He cannot verify it. She is standing in front of three other members. She argues for four minutes. He lets her through to avoid a scene.

Amara never fully trusts the gym again. She does not renew in September.

---

## 4. What can it do?

### Feature 1: Class and timetable lookup

- **Chisom types:** "What time is the Saturday morning class."
- **Spotter answers:** "Saturday: HIIT 7am, Yoga 9am, Spinning 11am. Timetable last confirmed 14 August."
- **Record source:** Shared timetable card, same for all members.

### Feature 2: Rules and policy lookup

- **Chisom types:** "Can I bring a guest."
- **Spotter answers:** "Basic members may bring one guest per month. Guest fee is 1,500 naira, paid at the desk. No restriction on day or time."
- **Record source:** Shared guest policy card. Searched by meaning (the app finds the relevant card even if the exact words do not match the question). Shared records only. Private records are never searched this way.

### Feature 3: Personal attendance history

- **Chisom types:** "How many times did I come in July."
- **Spotter answers:** "You checked in 14 times in July. Dates: 1, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 21, 24, 28."
- **Record source:** Her private check-in log. Fetched by her member ID only. Never searched across members.

### Feature 4: Membership status and balance

- **Chisom types:** "Do I still owe for August" or "When does my membership expire."
- **Spotter answers:** "Your membership is paid up to 31 August 2026, per gym records as of 25 August. If this differs from what you were told at the desk, contact Bisi on 08023456789."
- **Record source:** Her private payment record. Fetched by her member ID only. Never searched across members. The date of last confirmation is always shown.

### Feature 5: In-app payment

- **Chisom sees** her membership expires in three days. She taps Renew. She pays 15,000 naira through the payment gateway. She sees: "Payment confirmed. Membership extended to 30 September 2026. Reference: PSK-0098234." The gym's account receives the money. Spotter never holds the money.
- **Record source:** Payment confirmed by the gateway's server message before the success screen appears.

---

### What was cut and why

**Written training plans and trainer guidance cards** were removed from version one. Most gyms do not have these written down yet. Adding a content type the gym cannot fill makes the app feel empty and wastes build time. Bring it back in version two when the gym has produced the content.

**Guest registration in-app** was cut. The guest policy can be read in the app, but the actual guest visit is logged at the desk in version one. Desk registration is a fraud check that is worth keeping until the gym trusts the app.

---

### Staff and owner screens (input, not features)

**Owner screen:** Add, edit, and approve shared record cards (timetable, prices, rules, access hours, guest policy). Set member tier and expiry date. View the list of members with tier and expiry. View pending and failed payments. View the "this looks wrong" report log. Update the fallback staff name and contact number.

**Staff screen:** None in version one. Staff who need to update records use the owner screen with limited permissions. The owner decides who gets those permissions.

---

## 5. What does it refuse to do?

**When the records are silent:** "I do not have that information. Please contact Bisi on 08023456789." No guessing. No internet search. No inference from other records.

**When a question exists in the records but must not be answered:**

- Any question about another member's data, attendance, or tier.
- Any question about payment instrument details such as card numbers or bank account numbers.
- Any medical or injury judgment, even if a trainer's note mentions a condition.
- Any financial commitment on behalf of the gym ("can I get a refund") — it can show the refund policy text, but it cannot promise a refund.
- Any question that requires real-time knowledge it does not hold ("is the gym busy right now," "is the trainer there today").

> Private records are fetched by exact member ID only. They are never searched across members. This applies to every private record in the system.

---

## 6. Where do the records come from, who approves them, and how do they stay current?

### Shared records

Staff type the timetable, prices, rules, access hours, and guest policy into the owner's web interface as short cards. Each card shows the date it was last confirmed. The owner approves before the card goes live to members. When the Saturday timetable changes, a staff member updates the card and the owner approves the new version. Any card older than 30 days gets a flag visible only in the owner screen: "Confirm this is still current." No flag is visible to members.

### Private records

**Attendance** is generated by the member's own check-in action in the app. No staff input is needed after the first check-in. History starts from the day the app launches. Historical paper sign-in data is not migrated.

**Membership tier and expiry date** are set by the owner or an authorized staff member when a member is enrolled or renews at the desk with cash. They are updated automatically when a member pays through the app and the gateway sends a confirmation.

**Payment history** is updated manually by staff when cash is received at the desk, and automatically when a gateway payment confirms via server message. The server message (called a webhook: a direct notification from the gateway to Spotter's server, independent of the member's phone) arrives even if the member's app closes before the payment finishes.

---

## 7. Why can a normal chatbot not do this?

### Question 1: "What time is the Saturday morning class?"

| | Answer |
|---|---|
| **General chatbot** | "Most gyms in Lagos run Saturday classes between 7am and 12pm. I'd recommend checking with your gym directly for the exact schedule." |
| **Spotter** | "Saturday: HIIT 7am, Yoga 9am, Spinning 11am. Timetable last confirmed 14 August." |

The chatbot has no access to this gym's timetable. The timetable is private, changes monthly, and is not published anywhere on the internet. A wrong time means a member wakes up at 6am for a class that moved to 9am.

---

### Question 2: "Can I bring a guest on a Monday morning?"

| | Answer |
|---|---|
| **General chatbot** | "Guest policies vary by gym. Many allow guests for a day fee. You would need to check your gym's specific rules." |
| **Spotter** | "Basic members may bring one guest per month. Guest fee is 1,500 naira, paid at the desk. No restriction on day or time." |

The policy is specific to this gym and is not published publicly. A general answer sends the member to the desk, which is exactly the problem the app was built to solve.

---

### Question 3: "How many days did I train in July?"

| | Answer |
|---|---|
| **General chatbot** | "I don't have access to your gym records. You would need to ask the staff." |
| **Spotter** | "You checked in 14 times in July." |

This is not a public question. It is a private fact that belongs to one person and lives only in the gym's database. No chatbot with or without internet access can answer it. This is the feature that makes Spotter irreplaceable.

---

## 8. How does paying change what a person can see, and what happens when payment stops?

| State | What the member can see |
|---|---|
| **Basic (active)** | Timetable, prices, rules, access hours, guest policy, personal attendance history, membership status, in-app renewal |
| **Premium (active)** | Everything in Basic, plus written training plans and trainer guidance cards (version two, once content exists) |
| **Expired** | Prices and the payment screen only |

When a membership expires, the home screen is replaced by a single message: "Your membership expired on [date]. Renew below." The member cannot check in, cannot view attendance history, and cannot view membership status. The renewal path stays open inside the app.

The app checks the expiry date at every login. The moment the date passes, the member drops to the expired state. There is no grace period in version one. Grace period logic waits for version two, when check-in and login data can show whether a member is still actively trying to come in.

---

## 9. What must version one collect that version two will need, and what must version one not do yet?

### Collect in version one

| Log | Fields |
|---|---|
| Every check-in | Member ID, timestamp, tier active at that moment |
| Every question | Member ID, raw question text, record type that answered it, whether it fell through to staff, timestamp |
| Every payment event | Member ID, amount, gateway reference, status (pending / confirmed / failed), timestamp |
| Every login | Member ID, expiry date at time of login |

These four logs are the raw material for version two. Check-in timing tells you the right moment to send a renewal reminder. Question logs tell you which shared records are missing or wrong. Payment timing tells you which members are at risk of leaving. Login-to-expiry gaps tell you how many days members wait after expiry before renewing.

### Do not build in version one

- Automated reminder messages or push notifications.
- Follow-up logic of any kind.
- An analytics dashboard. The owner reads the raw logs.
- Guest registration in-app.
- Written training plans and trainer guidance cards.
- Social or community features.

The rule: if version one cannot answer whether a feature is needed, do not build it yet. The logs will answer it.

---

## 10. What could go wrong?

### 1. The balance record is wrong and the member can prove it (highest severity)

If the app says "paid up to 31 August" and the gym says "you are overdue since July," and the member has a screenshot of the app, the gym faces a dispute it will not easily win. The damage is not one unpaid subscription. It is a public argument at the desk that other members witness, and it destroys trust in every financial record the app shows.

**Mitigation:** Every membership status shown must include the date it was last confirmed and the line "if this differs from what you were told at the desk, contact [Name]." The app is never the final authority on money. The desk always wins a dispute.

---

### 2. Check-in fails silently and attendance records are wrong

Attendance is the feature that brings members back 16 times a month. A member who uses Spotter to track her training and finds her July count is wrong has no reason to trust anything else in the app. Silent failures happen when the network drops mid-request and the app shows nothing instead of retrying.

**Mitigation:** Every successful check-in must show a visible confirmation with the updated count: "You are in. 14 visits this month." If the network fails, the app retries once and then tells the member to check in at the desk. It never drops a check-in silently.

---

### 3. The payment goes through but the membership is not updated

This is the Amara scenario again, now with the app as the cause. A member pays 15,000 naira, receives a gateway confirmation on her phone, comes to the gym, and is told she is still expired because the gateway's message to Spotter's server arrived late or failed.

**Mitigation:** The success screen must show the new expiry date pulled from the updated record, not just "payment received." If the server message has not yet arrived, show: "Payment received, membership update in progress. Show this screen at the desk if needed: Reference PSK-0098234." Never show a success screen based on the gateway response alone without confirming the record updated.

---

## Payment gateway costs in naira

**Paystack** (recommended for first-time Nigerian small businesses):
- Free to integrate using test keys. No live transactions, no time limit on testing.
- Live transaction fee: 1.5% per transaction, capped at 2,000 naira. A flat fee of 100 naira applies to transactions below 2,500 naira.
- For a 15,000 naira renewal: 225 naira fee. The gym pays this unless they choose to add it to the member's price.
- Settlement: next business day to the gym's verified bank account.
- Verification requires: CAC registration number, BVN, and a utility bill. Allow one to three weeks.

**Flutterwave:**
- Free test tier.
- Live: 1.4% per local card transaction, capped at 2,000 naira.
- For a 15,000 naira renewal: 210 naira fee.

Either gateway works. Paystack has the cleaner path for a business doing this for the first time.

---

*Analysis produced: August 2026. 19 gaps identified: 7 ASK, 7 ASSUME, 5 RECOMMEND.*
