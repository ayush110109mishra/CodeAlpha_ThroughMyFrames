import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Collection Model
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Represents themed albums curated by photographers (e.g., "Sacred Waters & Morning Mist").
 * In the UI, these render with a physical stacked-paper hover effect and expand
 * into full curated gallery showcases.
 */

const collectionSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Collection title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    cover: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    fallbackImage: {
      type: String,
      default: '/images/placeholder.jpg',
    },
    frameIds: [
      {
        type: String,
      },
    ],
    frames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Frame',
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    curatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

collectionSchema.virtual('id').get(function () {
  return this.customId || this._id.toString();
});

collectionSchema.set('toJSON', { virtuals: true });
collectionSchema.set('toObject', { virtuals: true });

export const Collection = mongoose.model('Collection', collectionSchema);
