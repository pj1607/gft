# Cash and static UPI QR payments

Gym Fee Tracker uses the gym owner's own UPI ID. No Razorpay account, API keys, webhook, or payment gateway integration is required for this workflow.

## 1. Set up the gym UPI ID

1. Start the backend and frontend and sign in as the gym owner.
2. Open **Profile Settings**.
3. Enter the gym's UPI ID (for example, `gymname@upi`) and an optional gym name.
4. Select **Save UPI & Update QR**. GFT saves these details to the owner's profile and displays a reusable QR preview.
5. To change the UPI ID later, edit it in the same section and save again. The QR preview updates to the new details.

The saved profile QR is reusable. When collecting a specific member's fee, GFT creates a UPI payment URI with that payment's amount prefilled.

## 2. Collect a fee

1. Open the member's fee collection modal and enter the monthly fee and total amount.
2. Choose **UPI QR**, then select **Show Prefilled UPI QR**.
3. Ask the member to scan the QR and complete the payment in their UPI app.
4. Verify the actual credit in the gym's bank account or UPI app. Do not rely on a screenshot or the member's claim.
5. Only after verifying receipt, click **Confirm UPI Payment Received**. GFT then updates the member's status and payment history.

The amount must be an exact multiple of the member's monthly fee and can cover 1–36 complete months. Partial-month payments are not supported in this version.

## 3. Important notes

- This is a **static/manual confirmation** workflow, not automatic payment verification. GFT cannot know whether a transfer actually succeeded.
- UPI apps may handle amount-prefilled payment requests differently. The member should check the recipient and amount before authorizing payment.
- QR images are rendered through the QR Server image endpoint. The encoded UPI payment URI, including the UPI ID and prefilled amount for a payment QR, is sent to that service to render the image. Do not use this approach if that third-party exposure is unacceptable; use a QR-generation library that runs locally in the frontend instead.
- Direct UPI transfers typically avoid payment-gateway processing fees, but the owner's bank or UPI provider terms still apply.
- Never store real payment credentials in source control. This workflow does not require Razorpay credentials.
