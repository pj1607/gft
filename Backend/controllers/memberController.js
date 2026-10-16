import Member from '../models/memberModel.js';
import mongoose from 'mongoose';
import dayjs from "dayjs";


// ALL-MEMBERS
export const allMembers = async (req, res) => {
  try {
  const members = await Member.find({ createdBy: req.user._id }).sort({ createdAt: -1 });;

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
    const totalMember = updatedMembers.length;

    res.status(200).json({
      members: updatedMembers,
      totalMembers: totalMember,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

//ADD-MEMBER
export const addMember = async (req, res) => {
  try {
    let { name, phone, status, lastPaidDate, unpaidFor } = req.body;

    if (!name || !phone || !status || !lastPaidDate) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    name = name.trim();
    phone = phone.trim();

    if (typeof name !== 'string' || name.length < 4) {
      return res.status(400).json({ error: 'Name must be at least 4 characters long.' });
    }

    if (typeof phone !== 'string') {
      return res.status(400).json({ error: 'Phone number must be a string.' });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
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
      createdBy: req.user._id,
    });

    await newMember.save();
    res.status(201).json({ success: 'yes', newMember });

  } catch (error) {
    console.error('Add member failed:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};


//UPDATE-PAYMENT-STATUS
export const updatePaymentStatus = async (req, res) => {
  const objectId = new mongoose.Types.ObjectId(req.params.id);

  try {
  
    const member = await Member.findOne({ _id: objectId, createdBy: req.user._id });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const updatedMember = await Member.findOneAndUpdate(
      { _id: objectId, createdBy: req.user._id },
      {
        previousUnpaidMonths: member.unpaidFor,
        previousLastPaidDate: member.lastPaidDate,
        
        status: "Paid",
        lastPaidDate: new Date(),
        unpaidFor: 0
      },
      { new: true }
    );

    res.json(updatedMember);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//UNDO-PAYMENT-STATUS
export const undoPaymentStatus = async (req, res) => {
  const objectId = new mongoose.Types.ObjectId(req.params.id);


  try {
    const member = await Member.findOne({ _id: objectId, createdBy: req.user._id });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const updatedMember = await Member.findOneAndUpdate(
      { _id: objectId, createdBy: req.user._id },
      {
        status: "Unpaid",
        unpaidFor: member.previousUnpaidMonths ?? 0,
        lastPaidDate: member.previousLastPaidDate ?? dayjs().format('DD MMMM YYYY')
      },
      { new: true }
    );

    res.json(updatedMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


//DELETE-MEMBER
export const deleteMember = async (req, res) => {
  const objectId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const deleted = await Member.findOneAndDelete({
      _id: objectId,
      createdBy: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Member not found or not authorized' });
    }
    res.json({ message: 'Member deleted' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


//getMemberSummary 
export const getMemberSummary = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments({createdBy: req.user._id,} );
    const unpaidMembers = await Member.countDocuments({createdBy: req.user._id, status: 'Unpaid' });

    const paidMembers = totalMembers - unpaidMembers;

    res.status(200).json({
      total: totalMembers,
      paid: paidMembers,
      unpaid: unpaidMembers,
    });
  } catch (error) {
    console.error('Error fetching member summary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

//UPDATE MEMBER

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }

    name = name.trim();
    phone = phone.trim();

    if (typeof name !== 'string' || name.length < 4) {
      return res.status(400).json({ error: 'Name must be at least 4 characters long.' });
    }

    if (typeof phone !== 'string') {
      return res.status(400).json({ error: 'Phone number must be a string.' });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
    }

    const existingMember = await Member.findOne({
      phone,
      createdBy: req.user._id,
      _id: { $ne: new mongoose.Types.ObjectId(id) }
    });

    if (existingMember) {
      return res.status(409).json({ error: 'Already registered with this Mobile No' });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { name, phone },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    res.status(200).json({
      message: 'Member updated successfully',
      member: updatedMember,
    });
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
