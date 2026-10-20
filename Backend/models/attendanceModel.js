import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    // UTC date key keeps duplicate prevention consistent across clients.
    attendanceDate: {
      type: String,
      required: true,
    },
    checkInAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { ownerId: 1, memberId: 1, attendanceDate: 1 },
  { unique: true }
);

export default mongoose.model('Attendance', attendanceSchema);
