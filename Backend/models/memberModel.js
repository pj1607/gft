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
  type : Date,
  default: null
}

}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);

export default Member;
