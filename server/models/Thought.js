import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Thought Model
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Represents short reflective essays, quotes, and contemplative prose written
 * in the Thoughts journal. Displayed as masonry cards with delicate gradient
 * backgrounds and author attribution.
 */

const thoughtSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Thought text cannot be empty'],
      trim: true,
      maxlength: [500, 'Thought cannot exceed 500 characters'],
    },
    mood: {
      type: String,
      enum: ['Calm', 'Nostalgic', 'Wanderlust', 'Curious', 'Grateful', 'Reflective'],
      default: 'Calm',
      index: true,
    },
    background: {
      type: String,
      default: 'linear-gradient(135deg, rgba(194, 105, 62, 0.08) 0%, rgba(233, 201, 168, 0.18) 100%)',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Thought author is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

thoughtSchema.virtual('id').get(function () {
  return this.customId || this._id.toString();
});

thoughtSchema.set('toJSON', { virtuals: true });
thoughtSchema.set('toObject', { virtuals: true });

export const Thought = mongoose.model('Thought', thoughtSchema);

