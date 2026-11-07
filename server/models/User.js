import mongoose from 'mongoose';

/**
 * ==============================================================================
 * User Model (Phase 3: Auth & Social Ready)
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Represents any person in the Through My Frames journal ecosystem—both
 * community members and the primary photographer (Ayush Mishra).
 *
 * Security Considerations:
 * 1. `passwordHash` is explicitly configured with `select: false` so that standard
 *    `User.find()` or `User.findById()` queries never leak the hashed password.
 * 2. `email` is strictly unique and lowercase to prevent account collision attacks.
 * 3. `toJSON` transform explicitly strips `passwordHash` as defense-in-depth.
 * 4. `role` is strictly constrained to 'user' or 'admin' for RBAC authorization.
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
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Prevents hash from returning in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    headline: {
      type: String,
      default: '',
    },
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
    timestamps: true, // Manages createdAt and updatedAt automatically
  }
);

// Virtual for backward-compatible followersCount alias
userSchema.virtual('followersCount').get(function () {
  return this.followers;
});

// Virtual for backward-compatible followingCount alias
userSchema.virtual('followingCount').get(function () {
  return this.following;
});

// Ensure passwordHash is never serialized into JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

userSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
