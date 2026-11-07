import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Message Model (Photographer Correspondence)
 * ==============================================================================
 * WHY THIS MODEL EXISTS:
 * Stores archival print inquiries, exhibition commissions, and letters sent
 * through the /photographer sanctuary contact form.
 */

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Anonymous Wanderer',
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    type: {
      type: String,
      enum: [
        'Print Inquiry',
        'Editorial / Assignment',
        'Collaboration',
        'Personal Note',
        'General Inquiry',
      ],
      default: 'Print Inquiry',
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.virtual('id').get(function () {
  return this._id.toString();
});

messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

export const Message = mongoose.model('Message', messageSchema);
