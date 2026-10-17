import crypto from 'crypto';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import Member from '../models/memberModel.js';
import PendingPayment from '../models/pendingPaymentModel.js';

const rupeesToPaise = (value) => Math.round(Number(value) * 100);

const validatePaymentInputs = ({ amount, monthlyFee }) => {
  const amountPaise = rupeesToPaise(amount);
  const monthlyFeePaise = rupeesToPaise(monthlyFee);

  if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) {
    return { error: 'Enter a payment amount of at least ₹1.' };
  }
  if (!Number.isSafeInteger(monthlyFeePaise) || monthlyFeePaise < 100) {
    return { error: 'Enter the member monthly fee (at least ₹1).' };
  }
  if (amountPaise % monthlyFeePaise !== 0) {
    return {
      error: 'The amount must cover complete months. Adjust the amount or monthly fee; partial-month payments are not supported yet.',
    };
  }

  const monthsCovered = amountPaise / monthlyFeePaise;
  if (!Number.isSafeInteger(monthsCovered) || monthsCovered < 1 || monthsCovered > 36) {
    return { error: 'A payment can cover between 1 and 36 complete months.' };
  }

  return { amountPaise, monthlyFeePaise, monthsCovered };
};

const findOwnedMember = async (memberId, ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(memberId)) return null;
  return Member.findOne({ _id: memberId, createdBy: ownerId });
};

const getMonthsOverdue = (member, now = dayjs()) => {
  const storedUnpaid = Number(member.unpaidFor) || 0;
  if (storedUnpaid > 0) return storedUnpaid;

  if (member.status === 'Unpaid' && member.lastPaidDate) {
    const lastPaid = dayjs(member.lastPaidDate);
    if (lastPaid.isValid() && lastPaid.isBefore(now, 'month')) {
      return Math.max(
        (now.year() - lastPaid.year()) * 12 + now.month() - lastPaid.month(),
        1
      );
    }
    return 1;
  }

  return 0;
};

const applySuccessfulPayment = async ({
  member,
  amountPaise,
  monthlyFeePaise,
  monthsCovered,
  method,
  paidAt = new Date(),
  providerPaymentId = null,
  reference = null,
}) => {
  if (providerPaymentId) {
    const duplicate = member.paymentHistory.some(
      (payment) => payment.providerPaymentId === providerPaymentId
    );
    if (duplicate) return false;
  }

  member.previousUnpaidMonths = getMonthsOverdue(member, dayjs(paidAt));
  member.previousLastPaidDate = member.lastPaidDate;

  const now = dayjs(paidAt);
  const overdueMonths = getMonthsOverdue(member, now);
  const lastPaid = dayjs(member.lastPaidDate);
  const oldDateIsOverdue = lastPaid.isValid() && lastPaid.isBefore(now, 'month');
  const baseDate = overdueMonths > 0 && oldDateIsOverdue ? lastPaid : now;

  const paidThrough = overdueMonths > 0
    ? baseDate.add(monthsCovered, 'month')
    : now.add(Math.max(monthsCovered - 1, 0), 'month');

  const remainingUnpaid = Math.max(overdueMonths - monthsCovered, 0);
  member.monthlyFee = monthlyFeePaise / 100;
  member.lastPaidDate = paidThrough.toDate();
  member.unpaidFor = remainingUnpaid;
  member.status = remainingUnpaid === 0 ? 'Paid' : 'Unpaid';
  member.paymentHistory.push({
    paidAt,
    amount: amountPaise / 100,
    method,
    monthsCovered,
    providerPaymentId,
    reference,
    status: 'Paid',
  });

  await member.save();
  return true;
};

export const recordCashPayment = async (req, res) => {
  try {
    const member = await findOwnedMember(req.params.id, req.user._id);
    if (!member) {
      return res.status(mongoose.Types.ObjectId.isValid(req.params.id) ? 404 : 400)
        .json({ message: 'Member not found or invalid member ID.' });
    }

    const activeQr = await PendingPayment.findOne({
      memberId: member._id,
      ownerId: req.user._id,
      status: 'Pending',
      expiresAt: { $gt: new Date() },
      qrImageUrl: { $ne: null },
    });
    if (activeQr) {
      return res.status(409).json({
        message: 'A UPI QR is still awaiting payment for this member. Reopen that request or wait for it to expire before recording cash.',
      });
    }

    const reviewRequired = await PendingPayment.findOne({
      memberId: member._id,
      ownerId: req.user._id,
      status: 'NeedsReview',
    });
    if (reviewRequired) {
      return res.status(409).json({
        message: 'A previous UPI payment needs review. Check Razorpay before collecting another payment.',
      });
    }

    const monthlyFee = req.body.monthlyFee ?? member.monthlyFee;
    const details = validatePaymentInputs({ amount: req.body.amount, monthlyFee });
    if (details.error) return res.status(400).json({ message: details.error });

    await applySuccessfulPayment({
      member,
      ...details,
      method: 'Cash',
      reference: typeof req.body.reference === 'string' ? req.body.reference.trim().slice(0, 100) : null,
    });

    return res.status(200).json({ message: 'Cash payment recorded successfully.', member });
  } catch (error) {
    console.error('Record cash payment failed:', error);
    return res.status(500).json({ message: 'Unable to record cash payment.' });
  }
};

export const createDynamicQrPayment = async (req, res) => {
  let paymentIntent;
  try {
    const member = await findOwnedMember(req.params.id, req.user._id);
    if (!member) {
      return res.status(mongoose.Types.ObjectId.isValid(req.params.id) ? 404 : 400)
        .json({ message: 'Member not found or invalid member ID.' });
    }

    const monthlyFee = req.body.monthlyFee ?? member.monthlyFee;
    const details = validatePaymentInputs({ amount: req.body.amount, monthlyFee });
    if (details.error) return res.status(400).json({ message: details.error });

    const reviewRequired = await PendingPayment.findOne({
      memberId: member._id,
      ownerId: req.user._id,
      status: 'NeedsReview',
    });
    if (reviewRequired) {
      return res.status(409).json({
        message: 'A previous UPI payment needs review. Check Razorpay before creating another QR.',
      });
    }

    const existingIntent = await PendingPayment.findOne({
      memberId: member._id,
      ownerId: req.user._id,
      status: 'Pending',
      expiresAt: { $gt: new Date() },
      qrImageUrl: { $ne: null },
    }).sort({ createdAt: -1 });

    if (existingIntent) {
      return res.status(200).json({
        reused: true,
        paymentIntent: {
          id: String(existingIntent._id),
          status: existingIntent.status,
          amount: existingIntent.amountPaise / 100,
          monthlyFee: existingIntent.monthlyFeePaise / 100,
          monthsCovered: existingIntent.monthsCovered,
          qrImageUrl: existingIntent.qrImageUrl,
          expiresAt: existingIntent.expiresAt,
        },
      });
    }

    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        message: 'Dynamic UPI QR is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend environment.',
      });
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    paymentIntent = await PendingPayment.create({
      memberId: member._id,
      ownerId: req.user._id,
      amountPaise: details.amountPaise,
      monthlyFeePaise: details.monthlyFeePaise,
      monthsCovered: details.monthsCovered,
      expiresAt,
    });

    const closeBy = Math.floor(expiresAt.getTime() / 1000);
    const auth = Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64');
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'upi_qr',
        name: 'Gym Fee Tracker',
        usage: 'single_use',
        fixed_amount: true,
        payment_amount: details.amountPaise,
        description: ('Gym fee - ' + member.name).slice(0, 255),
        close_by: closeBy,
        notes: {
          payment_intent_id: String(paymentIntent._id),
          member_id: String(member._id),
          owner_id: String(req.user._id),
          months_covered: String(details.monthsCovered),
        },
      }),
    });

    const providerResult = await razorpayResponse.json().catch(() => ({}));
    if (!razorpayResponse.ok || !providerResult.id || !providerResult.image_url) {
      await PendingPayment.findByIdAndDelete(paymentIntent._id);
      console.error('Razorpay QR creation failed:', providerResult.error?.description || razorpayResponse.status);
      return res.status(502).json({
        message: providerResult.error?.description || 'Payment provider could not create a QR code. Please try again.',
      });
    }

    paymentIntent.qrCodeId = providerResult.id;
    paymentIntent.qrImageUrl = providerResult.image_url;
    await paymentIntent.save();

    return res.status(201).json({
      paymentIntent: {
        id: String(paymentIntent._id),
        status: paymentIntent.status,
        amount: details.amountPaise / 100,
        monthlyFee: details.monthlyFeePaise / 100,
        monthsCovered: details.monthsCovered,
        qrImageUrl: paymentIntent.qrImageUrl,
        expiresAt: paymentIntent.expiresAt,
      },
    });
  } catch (error) {
    if (paymentIntent?._id) {
      await PendingPayment.findByIdAndDelete(paymentIntent._id).catch(() => {});
    }
    console.error('Create dynamic QR failed:', error);
    return res.status(500).json({ message: 'Unable to create a UPI QR code.' });
  }
};

export const getPaymentIntentStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid payment intent ID.' });
    }

    const paymentIntent = await PendingPayment.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!paymentIntent) {
      return res.status(404).json({ message: 'Payment request not found.' });
    }

    if (paymentIntent.status === 'Pending' && paymentIntent.expiresAt <= new Date()) {
      paymentIntent.status = 'Expired';
      await paymentIntent.save();
    }

    return res.status(200).json({
      id: String(paymentIntent._id),
      status: paymentIntent.status,
      amount: paymentIntent.amountPaise / 100,
      monthsCovered: paymentIntent.monthsCovered,
      paidAt: paymentIntent.paidAt,
      reference: paymentIntent.providerReference,
    });
  } catch (error) {
    console.error('Get payment status failed:', error);
    return res.status(500).json({ message: 'Unable to check payment status.' });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!webhookSecret || !signature || !Buffer.isBuffer(req.body)) {
      return res.status(400).send('Webhook signature configuration or raw body missing.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');
    const supplied = Buffer.from(String(signature), 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');

    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return res.status(400).send('Invalid webhook signature.');
    }

    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event !== 'qr_code.credited') {
      return res.status(200).json({ received: true, ignored: true });
    }

    const payment = event.payload?.payment?.entity;
    const qrCode = event.payload?.qr_code?.entity;
    if (!payment?.id || !qrCode?.id) {
      return res.status(400).send('QR payment payload is incomplete.');
    }

    const paymentIntent = await PendingPayment.findOne({ qrCodeId: qrCode.id });
    if (!paymentIntent) {
      return res.status(200).json({ received: true, ignored: true });
    }
    if (paymentIntent.status === 'Paid') {
      return res.status(200).json({ received: true, duplicate: true });
    }

    if (
      payment.status !== 'captured' ||
      payment.currency !== 'INR' ||
      payment.amount !== paymentIntent.amountPaise
    ) {
      paymentIntent.status = 'NeedsReview';
      paymentIntent.providerPaymentId = payment.id;
      await paymentIntent.save();
      return res.status(200).json({ received: true, needsReview: true });
    }

    const member = await Member.findOne({
      _id: paymentIntent.memberId,
      createdBy: paymentIntent.ownerId,
    });
    if (!member) {
      paymentIntent.status = 'NeedsReview';
      paymentIntent.providerPaymentId = payment.id;
      await paymentIntent.save();
      return res.status(200).json({ received: true, needsReview: true });
    }

    const duplicate = member.paymentHistory.some(
      (record) => record.providerPaymentId === payment.id
    );

    if (!duplicate) {
      await applySuccessfulPayment({
        member,
        amountPaise: paymentIntent.amountPaise,
        monthlyFeePaise: paymentIntent.monthlyFeePaise,
        monthsCovered: paymentIntent.monthsCovered,
        method: 'UPI',
        paidAt: payment.created_at ? new Date(payment.created_at * 1000) : new Date(),
        providerPaymentId: payment.id,
        reference: payment.acquirer_data?.rrn || payment.id,
      });
    }

    paymentIntent.status = 'Paid';
    paymentIntent.providerPaymentId = payment.id;
    paymentIntent.providerReference = payment.acquirer_data?.rrn || payment.id;
    paymentIntent.paidAt = payment.created_at ? new Date(payment.created_at * 1000) : new Date();
    await paymentIntent.save();

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook processing failed:', error);
    return res.status(500).send('Webhook processing failed.');
  }
};
