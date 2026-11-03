import mongoose from 'mongoose';

/**
 * ==============================================================================
 * User Model
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Represents any person in the Through My Frames journal ecosystem—both
 * community members and the primary photographer (Ayush Misra).
 *
 * Mongoose Schemas map directly to MongoDB documents and enforce validation,
 * default values, and relationships (like referencing users in frames & comments).
 */

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      default: 'user',
    },
    userType: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // PHASE 3 TODO: Add authentication password field here:
    // password: {
    //   type: String,
    //   select: false, // Prevents password from being returned in API queries by default
    // },
    avatar: {
      type: String,
      default: '/images/honey.jpg',
    },
    cover: {
      type: String,
      default: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    location: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    gearSummary: {
      type: String,
      default: '',
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    isPhotographerOwner: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Virtual for backward-compatible followersCount alias
userSchema.virtual('followersCount').get(function () {
  return this.followers;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model('User', userSchema);

