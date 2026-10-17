# Dynamic UPI QR payment setup

Gym Fee Tracker uses Razorpay's single-use, fixed-amount UPI QR Code API. The backend creates the QR; the frontend never receives the Razorpay secret. A member is marked paid only after a signed `qr_code.credited` webhook confirms a captured INR payment for the exact expected amount.

## 1. Configure backend environment

Copy `Backend/.env.example` to `Backend/.env` and set:

- `MONGO_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Use Razorpay Test Mode credentials first. Never put the key secret or webhook secret in the frontend environment, and never commit the real values.

## 2. Configure the Razorpay webhook

In the Razorpay Dashboard, open **Account & Settings → Webhooks** (wording may vary), add a webhook URL that points to the backend:

`https://YOUR-BACKEND-DOMAIN/payments/razorpay/webhook`

For local testing, expose your local backend with a trusted HTTPS tunnel and use the tunnel URL. A provider cannot call `localhost` on your computer.

Subscribe to the `qr_code.credited` event and use the same webhook secret in `RAZORPAY_WEBHOOK_SECRET`. Save the webhook. The endpoint verifies the signature against the raw request body.

## 3. Test the workflow

1. Start MongoDB and the backend.
2. Start the frontend and log in as the gym owner.
3. Add or edit a test member and set their monthly fee.
4. Click **Mark as Paid**, enter an amount that is an exact multiple of the monthly fee, and choose **Dynamic UPI QR**.
5. Scan the QR using a UPI app supported by your Razorpay account and complete a test payment.
6. Wait for the signed webhook. The modal polls the backend payment-intent status and should show **Payment confirmed**.
7. Open Payment History and verify the amount, UPI method, reference, and months covered.
8. Test Cash separately and confirm it records only after the owner clicks **Confirm Cash Received**.
9. Test invalid amounts, missing credentials, an expired QR, a duplicate webhook delivery, and an invalid webhook signature.

## Important behavior

- QR codes are single-use, fixed to the amount entered, and expire after 30 minutes.
- The owner must not manually mark a QR payment as paid. Provider webhook confirmation is the source of truth.
- The amount must cover whole months at the member's saved monthly fee. Partial-month payments are not supported in this first version.
- If a webhook reports an unexpected amount or an unresolvable member, the intent becomes `NeedsReview`; check the Razorpay Dashboard before collecting again.
- Razorpay account activation, QR API availability, UPI test behavior, and transaction fees depend on the provider account and current provider terms.
