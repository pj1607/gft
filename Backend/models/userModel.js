import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true, 
  },
  username: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    validate: {
      validator: function (v) {
        // Password is required only if googleId is not set
        return this.googleId || (v && v.length >= 6);
      },
      message: 'Password is required and must be at least 6 characters.',
    },
  },
  picture: String,
  upiId: { type: String, trim: true, lowercase: true, default: '' },
  gymName: { type: String, trim: true, maxlength: 80, default: '' },
  feePlans: {
    type: [{
      name: { type: String, required: true, trim: true, maxlength: 50 },
      months: { type: Number, required: true, min: 1, max: 36 },
      amount: { type: Number, required: true, min: 1 },
    }],
    default: [],
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
