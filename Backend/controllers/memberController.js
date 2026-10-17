import Member from '../models/memberModel.js';
import mongoose from 'mongoose';
import dayjs from "dayjs";


// ALL-MEMBERS
export const allMembers = async (req, res) => {
  try {
    const members = await Member.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    const now = new Date();

    const updatedMembers = await Promise.all(
      members.map(async (member) => {
        if (member.status === 'Paid' && member.lastPaidDate) {
          const paidDate = new Date(member.lastPaidDate);
          const monthDiff =
            (now.getFullYear() - paidDate.getFullYear()) * 12 +
            (now.getMonth() - paidDate.getMonth());

          if (monthDiff >= 1) {
            member.status = 'Unpaid';
            member.unpaidFor = monthDiff;
            await member.save();
          }
        }
        return member;
      })
    );

    res.status(200).json({
      members: updatedMembers,
      totalMembers: updatedMembers.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ADD MEMBER
export const addMember = async (req, res) => {
  try {
    let { name, phone, status, lastPaidDate, unpaidFor, monthlyFee } = req.body;

    if (!name || !phone || !status || !lastPaidDate) {
      return res.status(400).json({ error: 'Name, phone, status and last paid date are required.' });
    }

    name = name.trim();
    phone = phone.trim();
    const parsedMonthlyFee = monthlyFee === undefined || monthlyFee === '' ? 0 : Number(monthlyFee);

    if (typeof name !== 'string' || name.length < 4) {
      return res.status(400).json({ error: 'Name must be at least 4 characters long.' });
    }
    if (typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
    }
    if (!Number.isFinite(parsedMonthlyFee) || parsedMonthlyFee < 0) {
      return res.status(400).json({ error: 'Monthly fee must be zero or a positive amount.' });
    }

    const existingMember = await Member.findOne({ phone, createdBy: req.user._id });
    if (existingMember) {
      return res.status(409).json({ error: 'Already registered with this Mobile No' });
    }

    const newMember = new Member({
      name,
      phone,
      status,
      lastPaidDate,
      unpaidFor,
      monthlyFee: parsedMonthlyFee,
      createdBy: req.user._id,
      paymentHistory: status === 'Paid'
        ? [{ paidAt: lastPaidDate, monthsCovered: 1, amount: parsedMonthlyFee || null, status: 'Paid' }]
        : [],
    });

    await newMember.save();
    res.status(201).json({ success: 'yes', newMember });
  } catch (error) {
    console.error('Add member failed:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// LEGACY PAYMENT ENDPOINT
// New dashboard flows use /payments/members/:id/cash or /payments/members/:id/qr.
export const updatePaymentStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    const member = await Member.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const paidAt = new Date();
    member.previousUnpaidMonths = member.unpaidFor;
    member.previousLastPaidDate = member.lastPaidDate;
    member.status = 'Paid';
    member.lastPaidDate = paidAt;
    member.unpaidFor = 0;
    member.paymentHistory.push({
      paidAt,
      amount: member.monthlyFee || null,
      method: member.monthlyFee ? 'Cash' : null,
      monthsCovered: Math.max(Number(member.previousUnpaidMonths) || 1, 1),
      status: 'Paid',
    });

    await member.save();
    return res.status(200).json(member);
  } catch (error) {
    console.error('Update payment status failed:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PAYMENT HISTORY
export const getPaymentHistory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    const member = await Member.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).select('name phone paymentHistory');

    if (!member) return res.status(404).json({ message: 'Member not found' });

    const paymentHistory = [...member.paymentHistory].sort(
      (a, b) => new Date(b.paidAt) - new Date(a.paidAt)
    );

    return res.status(200).json({
      member: { id: member._id, name: member.name, phone: member.phone },
      paymentHistory,
      totalPayments: paymentHistory.filter((payment) => payment.status === 'Paid').length,
    });
  } catch (error) {
    console.error('Get payment history failed:', error);
    return res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

// UNDO PAYMENT STATUS
export const undoPaymentStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    const member = await Member.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const latestPayment = [...member.paymentHistory]
      .reverse()
      .find((payment) => payment.status === 'Paid');

    if (
      latestPayment &&
      member.lastPaidDate &&
      new Date(latestPayment.paidAt).getTime() === new Date(member.lastPaidDate).getTime()
    ) {
      latestPayment.status = 'Reversed';
      latestPayment.reversedAt = new Date();
    }

    member.status = 'Unpaid';
    member.unpaidFor = member.previousUnpaidMonths ?? 0;
    member.lastPaidDate = member.previousLastPaidDate ?? member.lastPaidDate;
    await member.save();

    return res.status(200).json(member);
  } catch (error) {
    console.error('Undo payment status failed:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE MEMBER
export const deleteMember = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }
    const deleted = await Member.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: 'Member not found or not authorized' });
    return res.json({ message: 'Member deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET MEMBER SUMMARY
export const getMemberSummary = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments({ createdBy: req.user._id });
    const unpaidMembers = await Member.countDocuments({ createdBy: req.user._id, status: 'Unpaid' });
    return res.status(200).json({
      total: totalMembers,
      paid: totalMembers - unpaidMembers,
      unpaid: unpaidMembers,
    });
  } catch (error) {
    console.error('Error fetching member summary:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// UPDATE MEMBER
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, phone, monthlyFee } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid member ID.' });
    }
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }

    name = name.trim();
    phone = phone.trim();
    const parsedMonthlyFee = monthlyFee === undefined || monthlyFee === '' ? 0 : Number(monthlyFee);

    if (typeof name !== 'string' || name.length < 4) {
      return res.status(400).json({ error: 'Name must be at least 4 characters long.' });
    }
    if (typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
    }
    if (!Number.isFinite(parsedMonthlyFee) || parsedMonthlyFee < 0) {
      return res.status(400).json({ error: 'Monthly fee must be zero or a positive amount.' });
    }

    const existingMember = await Member.findOne({
      phone,
      createdBy: req.user._id,
      _id: { $ne: id },
    });
    if (existingMember) {
      return res.status(409).json({ error: 'Already registered with this Mobile No' });
    }

    const updatedMember = await Member.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { name, phone, monthlyFee: parsedMonthlyFee },
      { new: true, runValidators: true }
    );

    if (!updatedMember) return res.status(404).json({ error: 'Member not found.' });

    return res.status(200).json({
      message: 'Member updated successfully',
      member: updatedMember,
    });
  } catch (err) {
    console.error('Error updating member:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
