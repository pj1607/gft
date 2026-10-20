# Cash and static UPI QR payments

Gym Fee Tracker uses the gym owner's own UPI ID. No Razorpay account, API keys, webhook, or payment gateway integration is required for this workflow.

## 1. Configure gym UPI and fee plans

1. Start the backend and frontend and sign in as the gym owner.
2. Open **Profile Settings**.
3. Enter the gym's UPI ID and optional gym name if you want to collect UPI payments.
4. Under **Gym Membership Fee Plans**, add a 1-month plan and any packages you offer. Example: `1 Month / 1 month / ₹600`, `3 Months / 3 months / ₹2,000`.
5. Select **Save UPI & Fee Plans**. Edit the details and save again whenever your prices or UPI ID change.

A 1-month plan is required as the base fee. Each plan must have a unique duration. You can define up to 12 plans, from 1 to 36 months.

## 2. Collect a fee

1. Open the member's fee collection modal.
2. Enter only the **Amount to collect**. GFT calculates the months automatically:
   - If the amount exactly matches a saved package, it uses that package's duration (e.g. ₹2,000 = 3 months).
   - Otherwise, it checks whether the amount is a whole-number multiple of the 1-month plan (e.g. ₹1,200 = 2 months).
   - Repeated package amounts are also supported when they cover a whole number of months (e.g. ₹4,000 = two 3-month packages).
3. Choose **Cash** or **UPI QR**.
4. For UPI, ask the member to scan the amount-prefilled QR and complete payment.
5. Verify the actual credit in the gym's bank account or UPI app. Do not rely on a screenshot or the member's claim.
6. Only after verifying receipt, click **Confirm UPI Payment Received**. GFT then updates the member's status and payment history.

Payments must map to a saved plan or a whole-number multiple of a plan and can cover 1–36 months. Partial months are not supported.

## 3. Important notes

- Static UPI QR payments are **not automatically verified**. GFT cannot know whether a transfer actually succeeded.
- UPI apps may handle amount-prefilled payment requests differently. The member should check the recipient and amount before authorizing payment.
- QR images are rendered through the QR Server image endpoint. The encoded UPI payment URI, including the UPI ID and prefilled amount for a payment QR, is sent to that service to render the image. For stronger privacy, replace this with a QR-generation library that runs locally in the frontend.
- Direct UPI transfers typically avoid payment-gateway processing fees, but the owner's bank or UPI provider terms still apply.
- Never store real payment credentials in source control. This workflow does not require Razorpay credentials.
