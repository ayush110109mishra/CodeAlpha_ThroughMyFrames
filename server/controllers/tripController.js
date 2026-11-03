import mongoose from 'mongoose';
import { Trip } from '../models/Trip.js';
import { Frame } from '../models/Frame.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Trip Controller
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Serves travelogues, interactive illustrated map coordinates, and itineraries
 * featured on the /wander page.
 */

const findTripByIdOrSlug = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const trip = await Trip.findById(identifier);
    if (trip) return trip;
  }
  return await Trip.findOne({ customId: identifier });
};

/**
 * @desc    Get all trips/travelogues
 * @route   GET /api/trips
 * @access  Public
 */
export const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 }).lean();
    return sendSuccess(res, trips, 'Trips retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single trip by ID or slug (expands route frames)
 * @route   GET /api/trips/:id
 * @access  Public
 */
export const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await findTripByIdOrSlug(id);

    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }

    // Resolve frames either by ObjectId or customId slugs
    let frames = [];
    if (trip.frames && trip.frames.length > 0) {
      frames = await Frame.find({ _id: { $in: trip.frames } })
        .populate('author', 'name username avatar')
        .lean();
    } else if (trip.frameIds && trip.frameIds.length > 0) {
      frames = await Frame.find({ customId: { $in: trip.frameIds } })
        .populate('author', 'name username avatar')
        .lean();
    }

    const responseData = {
      ...trip.toObject(),
      frames,
    };

    return sendSuccess(res, responseData, 'Trip retrieved successfully');
  } catch (error) {
    next(error);
  }
};

