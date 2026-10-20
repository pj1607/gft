import mongoose from 'mongoose';
import dayjs from 'dayjs';
import Member from '../models/memberModel.js';

const rupeesToPaise = (value) => Math.round(Number(value) * 100);

const validatePaymentInputs = ({ amount, feePlans = [], fallbackMonthlyFee = 0 }) => {
  const amountPaise = rupeesToPaise(amount);
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) {
    return { error: 'Enter a payment amount of at least ₹1.' };
  }

  const plans = feePlans
    .map((plan) => ({
      name: plan.name,
      months: Number(plan.months),
      amountPaise: rupeesToPaise(plan.amount),
    }))
    .filter((plan) => Number.isInteger(plan.months) && plan.months >= 1
      && plan.months <= 36 && Number.isSafeInteger(plan.amountPaise) && plan.amountPaise >= 100);

  // Exact package prices take priority, e.g. ₹2,000 can represent a discounted 3-month plan.
  const exactPlan = plans
    .filter((plan) => plan.amountPaise === amountPaise)
    .sort((a, b) => b.months - a.months)[0];

  const oneMonthPlan = plans.find((plan) => plan.months === 1);
  const monthlyFeePaise = oneMonthPlan?.amountPaise || rupeesToPaise(fallbackMonthlyFee);
  if (!Number.isSafeInteger(monthlyFeePaise) || monthlyFeePaise < 100) {
    return { error: 'Add a 1-month fee plan in Profile Settings before recording payments.' };
  }

  let monthsCovered;
  if (exactPlan) {
    monthsCovered = exactPlan.months;
  } else if (amountPaise % monthlyFeePaise === 0) {
    monthsCovered = amountPaise / monthlyFeePaise;
  } else {
    const packageMultiple = plans
      .filter((plan) => amountPaise % plan.amountPaise === 0)
      .map((plan) => ({ months: plan.months * (amountPaise / plan.amountPaise) }))
      .filter((plan) => Number.isInteger(plan.months) && plan.months >= 1 && plan.months <= 36)
      .sort((a, b) => b.months - a.months)[0];
    if (!packageMultiple) {
      return { error: 'Amount must match a saved fee plan or a whole-number multiple of a saved plan.' };
    }
    monthsCovered = packageMultiple.months;
  }

  if (!Number.isSafeInteger(monthsCovered) || monthsCovered < 1 || monthsCovered > 36) {
    return { error: 'A payment can cover between 1 and 36 complete months.' };
  }
  return { amountPaise, monthlyFeePaise, monthsCovered };
};

const getStoredPaidThrough = (member) => {
  if (member.paidThroughDate) {
    const storedDate = dayjs(member.paidThroughDate);
    if (storedDate.isValid()) return storedDate;
  }

  // Backward compatibility: infer coverage for records created before paidThroughDate existed.
  const latestPayment = [...(member.paymentHistory || [])]
    .filter((payment) => payment.status === 'Paid' && payment.paidAt)
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))[0];

  if (latestPayment) {
    const paidAt = dayjs(latestPayment.paidAt);
    if (paidAt.isValid()) {
      return paidAt.add(Math.max(Number(latestPayment.monthsCovered) || 1, 1), 'month');
    }
  }

  // Older versions used lastPaidDate as an approximate coverage date.
  const legacyDate = dayjs(member.lastPaidDate);
  return legacyDate.isValid() ? legacyDate.add(1, 'month') : null;
};

const getMonthsOverdue = (member, now = dayjs()) => {
  const storedUnpaid = Number(member.unpaidFor) || 0;
  if (storedUnpaid > 0) return storedUnpaid;

  if (member.status === 'Unpaid') {
    const paidThrough = getStoredPaidThrough(member);
    if (paidThrough && paidThrough.isValid()) {
      return Math.max(now.diff(paidThrough, 'month'), 1);
    }

    if (member.lastPaidDate) {
      const lastPaid = dayjs(member.lastPaidDate);
      if (lastPaid.isValid() && lastPaid.isBefore(now, 'month')) {
        return Math.max((now.year() - lastPaid.year()) * 12 + now.month() - lastPaid.month(), 1);
      }
    }
    return 1;
  }

  return 0;
};

const applySuccessfulPayment = async ({ member, amountPaise, monthlyFeePaise, monthsCovered, method, reference = null }) => {
  const now = dayjs();
  const previousPaidThrough = getStoredPaidThrough(member);
  const overdueMonths = getMonthsOverdue(member, now);
  const remainingUnpaid = Math.max(overdueMonths - monthsCovered, 0);

  member.previousUnpaidMonths = overdueMonths;
  member.previousLastPaidDate = member.lastPaidDate;
  member.previousPaidThroughDate = previousPaidThrough?.isValid()
    ? previousPaidThrough.toDate()
    : null;

  let paidThrough;
  if (remainingUnpaid > 0) {
    // Payments that do not clear all arrears are applied to overdue fees first.
    paidThrough = previousPaidThrough?.isValid() ? previousPaidThrough : now;
  } else if (overdueMonths > 0) {
    // Once arrears are cleared, keep at least one full month before the next due date.
    const extraMonths = Math.max(monthsCovered - overdueMonths, 1);
    paidThrough = now.add(extraMonths, 'month');
  } else {
    // Advance payments extend the existing coverage period instead of resetting it.
    const baseDate = previousPaidThrough?.isValid() && previousPaidThrough.isAfter(now)
      ? previousPaidThrough
      : now;
    paidThrough = baseDate.add(monthsCovered, 'month');
  }

  member.monthlyFee = monthlyFeePaise / 100;
  member.lastPaidDate = now.toDate();
  member.paidThroughDate = paidThrough.toDate();
  member.unpaidFor = remainingUnpaid;
  member.status = remainingUnpaid === 0 ? 'Paid' : 'Unpaid';
  member.paymentHistory.push({
    paidAt: now.toDate(),
    amount: amountPaise / 100,
    method,
    monthsCovered,
    reference,
    status: 'Paid',
  });
  await member.save();
};

const recordManualPayment = async (req, res, method) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid member ID.' });
    }
    const member = await Member.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!member) return res.status(404).json({ message: 'Member not found.' });

    if (method === 'UPI') {
      const { upiId } = req.user;
      if (!upiId) return res.status(400).json({ message: 'Set up the gym UPI ID in your profile before recording a UPI payment.' });
      if (req.body.confirmedReceived !== true) {
        return res.status(400).json({ message: 'Confirm that you verified the UPI payment in your bank or UPI app.' });
      }
    }

    const details = validatePaymentInputs({
      amount: req.body.amount,
      feePlans: req.user.feePlans || [],
      fallbackMonthlyFee: member.monthlyFee,
    });
    if (details.error) return res.status(400).json({ message: details.error });

    const reference = typeof req.body.reference === 'string' ? req.body.reference.trim().slice(0, 100) : null;
    await applySuccessfulPayment({ member, ...details, method, reference });
    return res.status(200).json({ message: method + ' payment recorded successfully.', member });
  } catch (error) {
    console.error('Record manual payment failed:', error);
    return res.status(500).json({ message: 'Unable to record the payment.' });
  }
};

export const recordCashPayment = (req, res) => recordManualPayment(req, res, 'Cash');
export const recordUpiPayment = (req, res) => recordManualPayment(req, res, 'UPI');
