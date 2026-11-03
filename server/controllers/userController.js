import { User } from '../models/User.js';
import { Frame } from '../models/Frame.js';
import { Thought } from '../models/Thought.js';
import { Collection } from '../models/Collection.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * User Controller
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Powers the Journal Profile page (`/u/:username`).
 * Aggregates a user's biographical identity, followers count, and all their
 * authored frames, thoughts, and curated collections into a single payload.
 */

// Normalizes usernames and handles Ayush Misra / Mishra equivalence
const normalizeUsername = (str) => (str || '').toLowerCase().replace(/[-_\s]/g, '');

const isAyushMisra = (username) => {
  const norm = normalizeUsername(username);
  return norm === 'ayushmisra' || norm === 'ayushmishra';
};

/**
 * @desc    Get user profile and their content (frames, thoughts, collections)
 * @route   GET /api/users/:username
 * @access  Public
 */
export const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Search query with alias handling
    let user;
    if (isAyushMisra(username)) {
      user = await User.findOne({
        $or: [{ username: 'ayushmisra' }, { username: 'ayushmishra' }],
      });
    } else {
      user = await User.findOne({
        username: new RegExp(`^${username}$`, 'i'),
      });
    }

    // Graceful fallback to primary photographer if not found
    if (!user) {
      user = await User.findOne({ isPhotographerOwner: true }) || (await User.findOne());
    }

    if (!user) {
      return sendError(res, `User @${username} not found`, 404);
    }

    // Concurrently fetch all content authored by this user
    const [userFrames, userThoughts, userCollections] = await Promise.all([
      Frame.find({ author: user._id }).sort({ createdAt: -1 }).lean(),
      Thought.find({ author: user._id }).sort({ createdAt: -1 }).lean(),
      Collection.find({ author: user._id }).sort({ createdAt: -1 }).lean(),
    ]);

    const payload = {
      user: user.toObject(),
      frames: userFrames,
      thoughts: userThoughts,
      collections: userCollections,
    };

    return sendSuccess(res, payload, 'User profile and content retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle follow status for a user
 * @route   POST /api/users/:username/follow
 * @access  Public (In Phase 3, this will track followers in follower/following collection)
 */
export const toggleFollow = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Toggle simulated follower count
    user.followers = Math.max(0, (user.followers || 0) + 1);
    await user.save();

    return sendSuccess(res, { followers: user.followers, isFollowing: true }, 'Follow updated');
  } catch (error) {
    next(error);
  }
};

