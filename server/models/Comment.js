import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Comment Model
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Represents reader remarks and reflections left beneath a specific photo frame.
 * Instead of deeply nesting thousands of comments inside a single Frame document,
 * we store them in their own collection with references (`ref: 'Frame'` and `ref: 'User'`).
 * This is MongoDB relational best-practice: prevents documents from growing beyond
 * the 16MB BSON limit and enables fast pagination and deletion.
 */

const commentSchema = new mongoose.Schema(
  {
    frame: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Frame',
      required: [true, 'Associated frame ID is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required'],
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch recent comments for a specific frame
commentSchema.index({ frame: 1, createdAt: -1 });

export const Comment = mongoose.model('Comment', commentSchema);

