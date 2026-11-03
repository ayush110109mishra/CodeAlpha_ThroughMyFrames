import { Photographer } from '../models/Photographer.js';
import { Frame } from '../models/Frame.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Photographer Controller
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Serves the creator sanctuary content for the /photographer route, including
 * artist statement, philosophy pillars, vertical timeline, gear list, and contact handling.
 */

/**
 * @desc    Get photographer sanctuary info and populated favorite frames
 * @route   GET /api/photographer
 * @access  Public
 */
export const getPhotographer = async (req, res, next) => {
  try {
    let photographer = await Photographer.findOne().lean();

    // If not seeded yet, fallback to a sensible default structure
    if (!photographer) {
      return sendError(res, 'Photographer data not initialized. Run npm run seed.', 404);
    }

    // Resolve favorite frames by customId slugs
    let favoriteFrames = [];
    if (photographer.favoriteFrameIds && photographer.favoriteFrameIds.length > 0) {
      favoriteFrames = await Frame.find({
        customId: { $in: photographer.favoriteFrameIds },
      })
        .populate('author', 'name username avatar')
        .lean();
    }

    const payload = {
      ...photographer,
      favoriteFrames,
    };

    return sendSuccess(res, payload, 'Photographer information retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a letter / print inquiry to the photographer
 * @route   POST /api/photographer/contact
 * @access  Public
 */
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, type, message } = req.body;

    if (!email || !message) {
      return sendError(res, 'Email and message are required', 400);
    }

    // In Phase 2, we log the message and return success.
    // In Phase 3, this can trigger nodemailer / Resend email dispatch.
    console.log(`📩 [Letter Received for Ayush Misra]: From ${name || 'Anonymous'} (${email}) [${type}]: ${message}`);

    return sendSuccess(
      res,
      { sentAt: new Date().toISOString() },
      'Your letter has reached Ayush. You will receive a response shortly.'
    );
  } catch (error) {
    next(error);
  }
};

