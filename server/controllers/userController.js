import { User } from '../models/User.js';
import { Frame } from '../models/Frame.js';
import { Thought } from '../models/Thought.js';
import { Collection } from '../models/Collection.js';
import { Follow } from '../models/Follow.js';
import { Save } from '../models/Save.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * User Controller (Phase 3: Profiles, Social Follows & Saved Collections)
 * ==============================================================================
 */

/**
 * @desc    Get user profile and their content (frames, thoughts, collections, saved)
 * @route   GET /api/users/:username
 * @access  Public (Personalized if token present)
 */
export const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: new RegExp(`^${username}$`, 'i'),
    });

    if (!user) {
      return sendError(res, `User @${username} not found`, 404);
    }

    // Concurrently fetch authored frames, thoughts, collections, saved frames, and counts
    const [userFrames, userThoughts, userCollections, userSaves, followersCount, followingCount] =
      await Promise.all([
        Frame.find({ author: user._id }).sort({ createdAt: -1 }).lean(),
        Thought.find({ author: user._id }).sort({ createdAt: -1 }).lean(),
        Collection.find({ author: user._id }).sort({ createdAt: -1 }).lean(),
        Save.find({ user: user._id })
          .populate({
            path: 'frame',
            populate: { path: 'author', select: 'name username avatar role' },
          })
          .sort({ createdAt: -1 })
          .lean(),
        Follow.countDocuments({ following: user._id }),
        Follow.countDocuments({ follower: user._id }),
      ]);

    // Check if the authenticated requester follows this user
    let isFollowing = false;
    if (req.user) {
      const followExists = await Follow.exists({
        follower: req.user._id,
        following: user._id,
      });
      isFollowing = Boolean(followExists);
    }

    // Extract saved frame objects (ignoring any deleted frames)
    const savedFrames = userSaves.filter((s) => s.frame != null).map((s) => s.frame);

    const userObj = user.toJSON();
    userObj.followers = followersCount;
    userObj.followersCount = followersCount;
    userObj.following = followingCount;
    userObj.followingCount = followingCount;
    userObj.isFollowing = isFollowing;

    const payload = {
      user: userObj,
      frames: userFrames,
      thoughts: userThoughts,
      collections: userCollections,
      saved: savedFrames,
    };

    return sendSuccess(res, payload, 'User profile and content retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle follow / unfollow for a user
 * @route   POST /api/users/:username/follow
 * @access  Private (Requires valid JWT)
 */
export const toggleFollow = async (req, res, next) => {
  try {
    const { username } = req.params;
    const targetUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });

    if (!targetUser) {
      return sendError(res, 'User not found', 404);
    }

    // SECURITY: Users cannot follow themselves
    if (targetUser._id.equals(req.user._id)) {
      return sendError(res, 'You cannot follow your own journal profile', 400);
    }

    const followerId = req.user._id;
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: targetUser._id,
    });

    let isFollowing;
    if (existingFollow) {
      // Unfollow
      await Follow.findByIdAndDelete(existingFollow._id);
      targetUser.followers = Math.max(0, (targetUser.followers || 1) - 1);
      req.user.following = Math.max(0, (req.user.following || 1) - 1);
      isFollowing = false;
    } else {
      // Follow
      await Follow.create({
        follower: followerId,
        following: targetUser._id,
      });
      targetUser.followers = (targetUser.followers || 0) + 1;
      req.user.following = (req.user.following || 0) + 1;
      isFollowing = true;
    }

    await Promise.all([targetUser.save(), req.user.save()]);

    const actualFollowersCount = await Follow.countDocuments({ following: targetUser._id });

    return sendSuccess(
      res,
      { isFollowing, followersCount: actualFollowersCount },
      isFollowing ? `Now following @${targetUser.username}` : `Unfollowed @${targetUser.username}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookmarked frames saved by the current authenticated user
 * @route   GET /api/users/me/saved
 * @access  Private (Requires valid JWT)
 */
export const getMySavedFrames = async (req, res, next) => {
  try {
    const saves = await Save.find({ user: req.user._id })
      .populate({
        path: 'frame',
        populate: { path: 'author', select: 'name username avatar role' },
      })
      .sort({ createdAt: -1 })
      .lean();

    const savedFrames = saves.filter((s) => s.frame != null).map((s) => ({
      ...s.frame,
      id: s.frame.customId || s.frame._id.toString(),
      isSaved: true,
      savedByMe: true,
    }));

    return sendSuccess(res, savedFrames, 'Saved frames retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/users/me
 * @access  Private (Requires valid JWT)
 */
export const updateMe = async (req, res, next) => {
  try {
    const { name, bio, location, website, avatar, cover, gearSummary, headline, username } =
      req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Optional username update with unique check
    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await User.findOne({
        username: cleanUsername,
        _id: { $ne: user._id },
      });
      if (existing) {
        return sendError(res, 'Username is already taken by another wanderer', 400);
      }
      user.username = cleanUsername;
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (website !== undefined) user.website = website.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (cover !== undefined) user.cover = cover;
    if (gearSummary !== undefined) user.gearSummary = gearSummary.trim();
    if (headline !== undefined) user.headline = headline.trim();

    await user.save();

    return sendSuccess(res, user.toJSON(), 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
