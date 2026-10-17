import mongoose from 'mongoose';

const pendingPaymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, enum: ['razorpay'], default: 'razorpay', required: true },
  qrCodeId: { type: String, default: null, unique: true, sparse: true },
  providerPaymentId: { type: String, default: null, unique: true, sparse: true },
  amountPaise: { type: Number, required: true, min: 100 },
  monthlyFeePaise: { type: Number, required: true, min: 100 },
  monthsCovered: { type: Number, required: true, min: 1 },
  qrImageUrl: { type: String, default: null },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'NeedsReview', 'Expired'],
    default: 'Pending',
    index: true,
  },
  expiresAt: { type: Date, required: true, index: true },
  paidAt: { type: Date, default: null },
  providerReference: { type: String, default: null },
}, { timestamps: true });

pendingPaymentSchema.index({ memberId: 1, ownerId: 1, createdAt: -1 });

const PendingPayment = mongoose.model('PendingPayment', pendingPaymentSchema);
export default PendingPayment;
