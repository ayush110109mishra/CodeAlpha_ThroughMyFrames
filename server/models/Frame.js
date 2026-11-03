import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Frame Model
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * A "Frame" is the core artifact of Through My Frames: a photograph paired with
 * a 280-character handwritten "moment", atmospheric mood, location, and camera metadata.
 *
 * It references the User model for `author`.
 * It includes text indexes to power the Explore search bar efficiently.
 */

const frameSchema = new mongoose.Schema(
  {
    // Friendly slug/id matching existing mock filenames (e.g., 'taj-mahal', 'sunset')
    customId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: [true, 'Photo image path or URL is required'],
      trim: true,
    },
    fallbackImage: {
      type: String,
      default: '/images/placeholder.jpg',
    },
    moment: {
      type: String,
      required: [true, 'Moment caption is required'],
      trim: true,
      maxlength: [280, 'A moment caption cannot exceed 280 characters'],
    },
    mood: {
      type: String,
      required: [true, 'Mood tag is required'],
      enum: {
        values: ['Calm', 'Nostalgic', 'Wanderlust', 'Curious', 'Grateful', 'Random'],
        message: '{VALUE} is not a supported mood',
      },
      default: 'Calm',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Travel', 'Street', 'Nature', 'Sky', 'Portrait', 'Thoughts'],
        message: '{VALUE} is not a supported category',
      },
      default: 'Travel',
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    camera: {
      body: { type: String, default: 'Mobile Photography' },
      lens: { type: String, default: 'Wide Angle' },
      settings: { type: String, default: 'Natural Light' },
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
      index: -1,
    },
    aspectRatio: {
      type: String,
      default: '16/9',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Frame author is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast keyword search across captions and locations
frameSchema.index({ moment: 'text', location: 'text', mood: 'text', category: 'text' });

// Virtual to provide a unified `id` field compatible with both Mongo `_id` and legacy `customId`
frameSchema.virtual('id').get(function () {
  return this.customId || this._id.toString();
});

frameSchema.virtual('likesCount').get(function () {
  return this.likes;
});

frameSchema.set('toJSON', { virtuals: true });
frameSchema.set('toObject', { virtuals: true });

export const Frame = mongoose.model('Frame', frameSchema);

