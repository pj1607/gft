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
    // Date of attendance in India (Asia/Kolkata), formatted as YYYY-MM-DD.
    attendanceDate: {
      type: String,
      required: true,
    },
    checkInAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // MongoDB TTL removes the record after this date. Set by the controller.
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent the same member from being marked present more than once per day.
attendanceSchema.index(
  { ownerId: 1, memberId: 1, attendanceDate: 1 },
  { unique: true }
);

// MongoDB deletes documents asynchronously once expiresAt has passed.
attendanceSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: 'attendance_ttl_expiry' }
);

export default mongoose.model('Attendance', attendanceSchema);
