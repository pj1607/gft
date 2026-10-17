import mongoose from 'mongoose';
import dayjs from 'dayjs';

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
  enum: ['Paid', 'Unpaid'],
  required: true,
    },
    lastPaidDate: {
        type: Date,
        default: Date.now,
    },
    unpaidFor: {
        type: Number,
        default: 0,
    },
    
    createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  previousUnpaidMonths: {
    type: Number,
    default: null
  },
  previousLastPaidDate: {
    type: Date,
    default: null
  },
  paymentHistory: {
    type: [{
      paidAt: { type: Date, required: true, default: Date.now },
      monthsCovered: { type: Number, default: 1, min: 1 },
      status: { type: String, enum: ['Paid', 'Reversed'], default: 'Paid' },
      reversedAt: { type: Date, default: null }
    }],
    default: []
  }

}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);

export default Member;
