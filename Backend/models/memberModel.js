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
    // Date of the most recent payment transaction.
    lastPaidDate: {
        type: Date,
        default: Date.now,
    },
    // Date through which membership fees are covered; status expires at this date.
    paidThroughDate: {
        type: Date,
        default: null,
    },
    unpaidFor: {
        type: Number,
        default: 0,
    },
    monthlyFee: {
        type: Number,
        default: 0,
        min: 0,
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
    previousPaidThroughDate: {
        type: Date,
        default: null
    },
    paymentHistory: {
        type: [{
            paidAt: { type: Date, required: true, default: Date.now },
            amount: { type: Number, default: null, min: 0 },
            method: { type: String, enum: ['Cash', 'UPI', 'Other'], default: null },
            monthsCovered: { type: Number, default: 1, min: 1 },
            providerPaymentId: { type: String, default: null },
            reference: { type: String, default: null },
            status: { type: String, enum: ['Paid', 'Reversed'], default: 'Paid' },
            reversedAt: { type: Date, default: null }
        }],
        default: []
    }
}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);
export default Member;
