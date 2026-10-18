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
    return { error: 'Amount must match a saved fee plan or be a whole-number multiple of the 1-month fee.' };
  }

  if (!Number.isSafeInteger(monthsCovered) || monthsCovered < 1 || monthsCovered > 36) {
    return { error: 'A payment can cover between 1 and 36 complete months.' };
  }
  return { amountPaise, monthlyFeePaise, monthsCovered };
};

const getMonthsOverdue = (member, now = dayjs()) => {
  const storedUnpaid = Number(member.unpaidFor) || 0;
  if (storedUnpaid > 0) return storedUnpaid;
  if (member.status === 'Unpaid' && member.lastPaidDate) {
    const lastPaid = dayjs(member.lastPaidDate);
    if (lastPaid.isValid() && lastPaid.isBefore(now, 'month')) {
      return Math.max((now.year() - lastPaid.year()) * 12 + now.month() - lastPaid.month(), 1);
    }
    return 1;
  }
  return 0;
};

const applySuccessfulPayment = async ({ member, amountPaise, monthlyFeePaise, monthsCovered, method, reference = null }) => {
  member.previousUnpaidMonths = getMonthsOverdue(member);
  member.previousLastPaidDate = member.lastPaidDate;
  const now = dayjs();
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
    paidAt: new Date(),
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
