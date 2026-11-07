import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Save (Bookmark) Model (Phase 3)
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Tracks user-curated private/personal bookmarks of photo frames.
 * Allows retrieving `/api/users/me/saved` with full frame population.
 */

const saveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    frame: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Frame',
      required: [true, 'Frame ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saves per user
saveSchema.index({ user: 1, frame: 1 }, { unique: true });

export const Save = mongoose.model('Save', saveSchema);
