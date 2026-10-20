import mongoose from 'mongoose';
import Member from '../models/memberModel.js';
import User from '../models/userModel.js';
import Attendance from '../models/attendanceModel.js';

export const getGymInfo = async (req, res) => {
  return res.json({ ownerId: req.user._id });
};

export const checkInMember = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { rollNumber, name, phone } = req.body;

    if (!mongoose.isValidObjectId(ownerId)) {
      return res.status(400).json({ message: 'Invalid gym QR code.' });
    }

    const ownerExists = await User.exists({ _id: ownerId });
    if (!ownerExists) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    let member;

    if (typeof rollNumber === 'string' && rollNumber.trim()) {
      member = await Member.findOne({
        createdBy: ownerId,
        rollNumber: rollNumber.trim().toUpperCase(),
      });
    } else if (
      typeof name === 'string' &&
      name.trim() &&
      typeof phone === 'string' &&
      phone.trim()
    ) {
      member = await Member.findOne({
        createdBy: ownerId,
        name: name.trim(),
        phone: phone.trim(),
      });
    } else {
      return res.status(400).json({
        message:
          'Enter your roll number, or your registered name and phone number.',
      });
    }

    if (!member) {
      return res.status(404).json({
        message:
          'Member not found. Check your details or contact the gym owner.',
      });
    }

    const now = new Date();
    const attendanceDate = now.toISOString().slice(0, 10);

    try {
      const attendance = await Attendance.create({
        ownerId,
        memberId: member._id,
        attendanceDate,
        checkInAt: now,
      });

      return res.status(201).json({
        message: 'Attendance marked successfully!',
        memberName: member.name,
        rollNumber: member.rollNumber,
        attendanceDate,
        checkInAt: attendance.checkInAt,
      });
    } catch (error) {
      if (error.code === 11000) {
        const existing = await Attendance.findOne({
          ownerId,
          memberId: member._id,
          attendanceDate,
        });

        return res.status(409).json({
          message: 'Your attendance has already been marked today.',
          memberName: member.name,
          rollNumber: member.rollNumber,
          attendanceDate,
          checkInAt: existing?.checkInAt,
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('Attendance check-in error:', error);
    return res.status(500).json({
      message: 'Unable to mark attendance. Please try again.',
    });
  }
};


export const getMemberAttendanceHistory = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!mongoose.isValidObjectId(memberId)) {
      return res.status(400).json({ message: 'Invalid member ID.' });
    }

    const member = await Member.findOne({
      _id: memberId,
      createdBy: req.user._id,
    }).select('_id name phone rollNumber');

    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    const records = await Attendance.find({
      ownerId: req.user._id,
      memberId: member._id,
    })
      .sort({ attendanceDate: -1, checkInAt: -1 })
      .select('attendanceDate checkInAt')
      .lean();

    return res.status(200).json({
      member: {
        id: member._id,
        name: member.name,
        phone: member.phone,
        rollNumber: member.rollNumber,
      },
      totalPresentDays: records.length,
      attendance: records,
    });
  } catch (error) {
    console.error('Member attendance history error:', error);
    return res.status(500).json({
      message: 'Unable to load member attendance history.',
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const date = req.query.date;

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    const filter = { ownerId: req.user._id };
    if (date) filter.attendanceDate = date;

    const records = await Attendance.find(filter)
      .sort({ checkInAt: -1 })
      .populate('memberId', 'name phone rollNumber')
      .lean();

    const attendance = records.map((record) => ({
      _id: record._id,
      attendanceDate: record.attendanceDate,
      checkInAt: record.checkInAt,
      memberName: record.memberId?.name ?? 'Member deleted',
      phone: record.memberId?.phone ?? '',
      rollNumber: record.memberId?.rollNumber ?? '',
    }));

    return res.json({ attendance });
  } catch (error) {
    console.error('Attendance history error:', error);
    return res.status(500).json({
      message: 'Unable to load attendance history.',
    });
  }
};
