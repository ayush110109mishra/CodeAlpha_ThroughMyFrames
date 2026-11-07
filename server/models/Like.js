import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Like Model (Phase 3: Social Interactions)
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Rather than an unconstrained array of user IDs on the Frame document (which could
 * balloon beyond MongoDB's 16MB document limit and cause write race conditions),
 * a separate Like collection with a compound unique index guarantees:
 * 1. A single user can only like a frame once (idempotent at the database layer).
 * 2. High concurrency without document lock contention on popular frames.
 * 3. Quick lookup to check if the current user has liked a frame (`likedByMe`).
 */

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a like'],
      index: true,
    },
    frame: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Frame',
      required: [true, 'Frame ID is required for a like'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index prevents double-likes at database level
likeSchema.index({ user: 1, frame: 1 }, { unique: true });

export const Like = mongoose.model('Like', likeSchema);
