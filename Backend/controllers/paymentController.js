import mongoose from 'mongoose';
import dayjs from 'dayjs';
import Member from '../models/memberModel.js';

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
    return { error: 'The amount must cover complete months. Adjust the amount or monthly fee; partial-month payments are not supported yet.' };
  }
  const monthsCovered = amountPaise / monthlyFeePaise;
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

    const monthlyFee = req.body.monthlyFee ?? member.monthlyFee;
    const details = validatePaymentInputs({ amount: req.body.amount, monthlyFee });
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
