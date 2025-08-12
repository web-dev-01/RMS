import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number (e.g., +919876543210)'],
    },
    image: {
      type: String, // URL of the profile picture
      default: null,
    },
    role: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User',
    },

    // Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: '',
    },
    verificationCodeExpires: { // ✅ Added expiry for security
      type: Date,
      default: null,
    },

    // Reset password
    resetPasswordCode: {
      type: String,
      default: '',
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Update passwordChangedAt when password changes
UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.passwordChangedAt = Date.now();
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
