import { Frame } from '../models/Frame.js';
import { Thought } from '../models/Thought.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Moment of the Day Controller
 * ==============================================================================
 * WHY DETERMINISTIC DATE HASHING:
 * Ensures every visitor across the globe receives the EXACT same "Moment of the Day"
 * for the entire 24-hour cycle, fostering shared contemplation.
 */

// Simple 32-bit integer hash from string
const hashDateString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getMomentOfToday = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const dateSeed = hashDateString(todayStr);

    const frameCount = await Frame.countDocuments();
    const thoughtCount = await Thought.countDocuments();

    if (frameCount === 0 && thoughtCount === 0) {
      return sendError(res, 'No moments available today', 404);
    }

    // 70% chance of frame, 30% chance of thought (deterministic by dateSeed)
    const selectFrame = frameCount > 0 && (thoughtCount === 0 || dateSeed % 10 < 7);

    if (selectFrame) {
      const skipIndex = dateSeed % frameCount;
      const frame = await Frame.findOne()
        .skip(skipIndex)
        .populate('author', 'name username avatar role');

      return sendSuccess(
        res,
        {
          isThought: false,
          momentType: 'frame',
          date: todayStr,
          data: frame,
        },
        'Moment of the Day retrieved successfully'
      );
    } else {
      const skipIndex = dateSeed % thoughtCount;
      const thought = await Thought.findOne()
        .skip(skipIndex)
        .populate('author', 'name username avatar role');

      return sendSuccess(
        res,
        {
          isThought: true,
          momentType: 'thought',
          date: todayStr,
          data: thought,
        },
        'Moment of the Day retrieved successfully'
      );
    }
  } catch (error) {
    next(error);
  }
};

export const getRandomMoment = async (req, res, next) => {
  try {
    const frameCount = await Frame.countDocuments();
    const thoughtCount = await Thought.countDocuments();

    if (frameCount === 0 && thoughtCount === 0) {
      return sendError(res, 'No moments available', 404);
    }

    const selectFrame = frameCount > 0 && (thoughtCount === 0 || Math.random() > 0.3);

    if (selectFrame) {
      const skipIndex = Math.floor(Math.random() * frameCount);
      const frame = await Frame.findOne()
        .skip(skipIndex)
        .populate('author', 'name username avatar role');

      return sendSuccess(
        res,
        {
          isThought: false,
          momentType: 'frame',
          data: frame,
        },
        'Random moment retrieved successfully'
      );
    } else {
      const skipIndex = Math.floor(Math.random() * thoughtCount);
      const thought = await Thought.findOne()
        .skip(skipIndex)
        .populate('author', 'name username avatar role');

      return sendSuccess(
        res,
        {
          isThought: true,
          momentType: 'thought',
          data: thought,
        },
        'Random moment retrieved successfully'
      );
    }
  } catch (error) {
    next(error);
  }
};

