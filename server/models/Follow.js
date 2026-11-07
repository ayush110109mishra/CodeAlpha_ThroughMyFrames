import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Follow Model (Phase 3: Social Graph)
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Models directional relationships between journal wanderers:
 * - `follower`: the user who clicked Follow.
 * - `following`: the user being followed.
 *
 * Security & Integrity:
 * 1. Compound unique index ensures no duplicate follow records exist.
 * 2. Pre-save validation prevents a user from following themselves.
 */

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follower user ID is required'],
      index: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Following target user ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate follow records
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Prevent following oneself at schema level
followSchema.pre('save', function (next) {
  if (this.follower.equals(this.following)) {
    return next(new Error('Users cannot follow themselves'));
  }
  next();
});

export const Follow = mongoose.model('Follow', followSchema);
