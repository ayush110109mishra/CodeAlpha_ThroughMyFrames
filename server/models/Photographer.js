import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Photographer (Site Content) Model
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Represents the intimate sanctuary content for the site creator (Ayush Misra)
 * rendered on `/photographer`. Storing this in MongoDB allows the photographer to
 * update artist statements, equipment lists, current university/exploration notes,
 * and timeline milestones dynamically without redeploying frontend code.
 */

const photographerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Ayush Misra',
    },
    title: {
      type: String,
      default: 'Visual Storyteller, Chronicler of Sacred India & Essayist',
    },
    tagline: {
      type: String,
      default: 'Finding the sacred in the mundane; capturing the quiet breaths between heartbeats.',
    },
    portrait: {
      type: String,
      default: '/images/honey.jpg',
    },
    portraitAlt: {
      type: String,
      default: 'Ayush Misra',
    },
    location: {
      type: String,
      default: 'Lucknow, Uttar Pradesh, India',
    },
    yearsActive: {
      type: String,
      default: '2016 – Present',
    },
    statement: {
      type: String,
      required: true,
    },
    philosophy: [
      {
        title: { type: String, required: true },
        desc: { type: String, required: true },
      },
    ],
    timeline: [
      {
        year: { type: String, required: true },
        title: { type: String, required: true },
        location: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    gear: [
      {
        category: { type: String, required: true },
        items: [
          {
            name: { type: String, required: true },
            detail: { type: String, required: true },
          },
        ],
      },
    ],
    favoriteFrameIds: [
      {
        type: String,
      },
    ],
    currentExploration: {
      title: { type: String, default: '' },
      status: { type: String, default: '' },
      note: { type: String, default: '' },
    },
    socials: [
      {
        name: { type: String, required: true },
        handle: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Photographer = mongoose.model('Photographer', photographerSchema);
