import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      minlength: [2, 'Plan name must be at least 2 characters'],
      maxlength: [100, 'Plan name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    benefits: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [200, 'Each benefit cannot exceed 200 characters'],
        },
      ],
      default: [],
      validate: {
        validator: (benefits) => benefits.length <= 30,
        message: 'A plan cannot have more than 30 benefits',
      },
    },

    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: [0, 'Plan price cannot be negative'],
      validate: {
        validator: Number.isFinite,
        message: 'Plan price must be a valid number',
      },
    },

    durationMonths: {
      type: Number,
      required: [true, 'Plan duration is required'],
      min: [1, 'Plan duration must be at least 1 month'],
      max: [120, 'Plan duration cannot exceed 120 months'],
      validate: {
        validator: Number.isInteger,
        message: 'Plan duration must be a whole number of months',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Gym owner reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently retrieve active plans belonging to a gym owner.
membershipPlanSchema.index({ createdBy: 1, isActive: 1 });

const MembershipPlan = mongoose.model(
  'MembershipPlan',
  membershipPlanSchema
);

export default MembershipPlan;
