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
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
