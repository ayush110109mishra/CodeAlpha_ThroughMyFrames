import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Trip Model
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Represents travel journeys featured on the /wander page. Each journey includes:
 * - A travelogue field story
 * - Cover photograph and dates
 * - Coordinates for interactive illustrated SVG map pins
 * - Associated frames captured along the route
 */

const tripSchema = new mongoose.Schema(
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
      required: [true, 'Trip title is required'],
      trim: true,
    },
    place: {
      type: String,
      required: [true, 'Trip location is required'],
      trim: true,
    },
    dates: {
      type: mongoose.Schema.Types.Mixed, // Can store string "Oct 10 – Oct 18, 2024" or { from, to }
      required: true,
    },
    cover: {
      type: String,
      required: [true, 'Trip cover image is required'],
    },
    fallbackImage: {
      type: String,
      default: '/images/placeholder.jpg',
    },
    story: {
      type: String,
      required: [true, 'Travelogue story is required'],
    },
    frames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Frame',
      },
    ],
    frameIds: [
      {
        type: String,
      },
    ],
    coordinates: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
    highlights: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

tripSchema.virtual('id').get(function () {
  return this.customId || this._id.toString();
});

tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

export const Trip = mongoose.model('Trip', tripSchema);
