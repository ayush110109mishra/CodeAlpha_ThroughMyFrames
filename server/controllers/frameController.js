import mongoose from 'mongoose';
import { Frame } from '../models/Frame.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { Like } from '../models/Like.js';
import { Follow } from '../models/Follow.js';
import { Save } from '../models/Save.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Frame Controller (Phase 3: Protected Writes & Social Features)
 * ==============================================================================
 * WHY CONTROLLER ENFORCES OWNERSHIP:
 * Even if an API endpoint is behind authentication, a valid user must never be allowed
 * to edit or delete someone else's content. We strictly verify:
 * `resource.author.equals(req.user._id) || req.user.role === 'admin'`
 * Returning 403 Forbidden on violations.
 */

// Helper to find a frame by either Mongo ObjectId or custom slug (e.g. 'taj-mahal')
const findFrameByIdOrSlug = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const frame = await Frame.findById(identifier);
    if (frame) return frame;
  }
  return await Frame.findOne({ customId: identifier });
};

/**
 * @desc    Get all frames with filtering, search, pagination, and following feed
 * @route   GET /api/frames
 * @access  Public (personalized if token provided)
 */
export const getFrames = async (req, res, next) => {
  try {
    const {
      mood,
      category,
      search,
      author,
      feed,
      sort = 'latest',
      page = 1,
      limit = 24,
    } = req.query;

    const query = {};

    // 1. Following Feed: only frames from users followed by the authenticated user
    if (feed === 'following') {
      if (!req.user) {
        return sendError(
          res,
          'Please log in to view frames from photographers you follow',
          401
        );
      }
      const follows = await Follow.find({ follower: req.user._id }).select('following');
      const followingIds = follows.map((f) => f.following);
      query.author = { $in: followingIds };
    }

    // 2. Filter by Mood
    if (mood && mood.toLowerCase() !== 'all') {
      query.mood = new RegExp(`^${mood}$`, 'i');
    }

    // 3. Filter by Category
    if (category && category.toLowerCase() !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    // 4. Filter by Author username
    if (author) {
      const user = await User.findOne({ username: new RegExp(`^${author}$`, 'i') }).select('_id');
      if (user) {
        query.author = user._id;
      }
    }

    // 5. Keyword Search
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { moment: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { mood: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
      ];
    }

    // 6. Sorting strategy
    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { likes: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    // 7. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const skip = (pageNum - 1) * limitNum;

    const total = await Frame.countDocuments(query);
    const frames = await Frame.find(query)
      .populate('author', 'name username avatar role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // 8. If user is logged in, attach personalized `likedByMe` and `savedByMe`
    let likedFrameIds = new Set();
    let savedFrameIds = new Set();
    if (req.user && frames.length > 0) {
      const frameObjectIds = frames.map((f) => f._id);
      const [userLikes, userSaves] = await Promise.all([
        Like.find({ user: req.user._id, frame: { $in: frameObjectIds } }).select('frame'),
        Save.find({ user: req.user._id, frame: { $in: frameObjectIds } }).select('frame'),
      ]);
      likedFrameIds = new Set(userLikes.map((l) => l.frame.toString()));
      savedFrameIds = new Set(userSaves.map((s) => s.frame.toString()));
    }

    const enhancedFrames = frames.map((f) => {
      const fId = f._id.toString();
      return {
        ...f,
        id: f.customId || fId,
        likedByMe: likedFrameIds.has(fId),
        isLiked: likedFrameIds.has(fId),
        savedByMe: savedFrameIds.has(fId),
        isSaved: savedFrameIds.has(fId),
      };
    });

    return sendSuccess(res, enhancedFrames, 'Frames retrieved successfully', 200, {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single frame by ID or slug (includes comments & author)
 * @route   GET /api/frames/:id
 * @access  Public (personalized if token provided)
 */
export const getFrameById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, `Frame not found with identifier: ${id}`, 404);
    }

    await frame.populate('author', 'name username avatar role bio location');

    // Concurrently fetch comments for this frame
    const comments = await Comment.find({ frame: frame._id })
      .populate('author', 'name username avatar role')
      .sort({ createdAt: -1 })
      .lean();

    const payload = frame.toJSON();
    payload.comments = comments;

    // Attach likedByMe and savedByMe if authenticated
    if (req.user) {
      const [hasLiked, hasSaved] = await Promise.all([
        Like.exists({ user: req.user._id, frame: frame._id }),
        Save.exists({ user: req.user._id, frame: frame._id }),
      ]);
      payload.likedByMe = Boolean(hasLiked);
      payload.isLiked = Boolean(hasLiked);
      payload.savedByMe = Boolean(hasSaved);
      payload.isSaved = Boolean(hasSaved);
    } else {
      payload.likedByMe = false;
      payload.isLiked = false;
      payload.savedByMe = false;
      payload.isSaved = false;
    }

    return sendSuccess(res, payload, 'Frame retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single random frame for the "Surprise Me" / Wander feature
 * @route   GET /api/frames/random
 * @access  Public
 */
export const getRandomFrame = async (req, res, next) => {
  try {
    const count = await Frame.countDocuments();
    if (count === 0) {
      return sendError(res, 'No frames currently available in the gallery', 404);
    }

    const random = Math.floor(Math.random() * count);
    const frame = await Frame.findOne().skip(random).populate('author', 'name username avatar role');

    return sendSuccess(res, frame, 'Random frame retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new frame
 * @route   POST /api/frames
 * @access  Private (Requires valid JWT)
 */
export const createFrame = async (req, res, next) => {
  try {
    const {
      image,
      cloudinaryPublicId,
      fallbackImage,
      moment,
      mood,
      category,
      location,
      camera,
      aspectRatio,
      customId,
    } = req.body;

    // SECURITY: Author is taken STRICTLY from the verified JWT user session
    // Never trust author ID passed from the client body
    const authorId = req.user._id;

    // Generate custom slug if not provided
    const slug =
      customId ||
      moment
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 30) + `-${Date.now().toString().slice(-4)}`;

    const newFrame = await Frame.create({
      customId: slug,
      image,
      cloudinaryPublicId: cloudinaryPublicId || null,
      fallbackImage: fallbackImage || '/images/placeholder.jpg',
      moment,
      mood: mood || 'Calm',
      category: category || 'Travel',
      location: location || 'Undisclosed Location',
      camera: camera || {
        body: 'Mobile Photography',
        lens: 'Wide Angle',
        settings: 'Natural Light',
      },
      aspectRatio: aspectRatio || '16/9',
      author: authorId,
    });

    await newFrame.populate('author', 'name username avatar role');

    return sendSuccess(res, newFrame, 'Photograph published to the living journal!', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a frame
 * @route   PUT /api/frames/:id
 * @access  Private (Owner or Admin only)
 */
export const updateFrame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    // SECURITY: Ownership verification
    const isOwner = frame.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Forbidden: You do not have permission to modify this frame', 403);
    }

    // Prevent modifying author
    delete req.body.author;

    const updatedFrame = await Frame.findByIdAndUpdate(frame._id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name username avatar role');

    return sendSuccess(res, updatedFrame, 'Frame updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a frame and its comments, likes, saves & Cloudinary asset
 * @route   DELETE /api/frames/:id
 * @access  Private (Owner or Admin only)
 */
export const deleteFrame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    // SECURITY: Ownership check
    const isOwner = frame.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Forbidden: You do not have permission to delete this frame', 403);
    }

    // Delete image from Cloudinary if hosted there
    if (frame.cloudinaryPublicId) {
      await deleteFromCloudinary(frame.cloudinaryPublicId);
    }

    // Cascade delete: remove all related comments, likes, and bookmarks
    await Promise.all([
      Comment.deleteMany({ frame: frame._id }),
      Like.deleteMany({ frame: frame._id }),
      Save.deleteMany({ frame: frame._id }),
      Frame.findByIdAndDelete(frame._id),
    ]);

    return sendSuccess(res, null, 'Frame and associated reflections removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like status on a frame (real per-user social interaction)
 * @route   POST /api/frames/:id/like
 * @access  Private (Requires valid JWT)
 */
export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    const userId = req.user._id;
    const existingLike = await Like.findOne({ user: userId, frame: frame._id });

    let liked;
    if (existingLike) {
      // User has already liked: Unlike
      await Like.findByIdAndDelete(existingLike._id);
      frame.likes = Math.max(0, (frame.likes || 1) - 1);
      liked = false;
    } else {
      // User has not liked yet: Like
      await Like.create({ user: userId, frame: frame._id });
      frame.likes = (frame.likes || 0) + 1;
      liked = true;
    }

    await frame.save();

    return sendSuccess(
      res,
      { liked, likesCount: frame.likes },
      liked ? 'Frame liked' : 'Frame unliked'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle bookmark/save status on a frame
 * @route   POST /api/frames/:id/save
 * @access  Private (Requires valid JWT)
 */
export const toggleSave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    const userId = req.user._id;
    const existingSave = await Save.findOne({ user: userId, frame: frame._id });

    let saved;
    if (existingSave) {
      await Save.findByIdAndDelete(existingSave._id);
      saved = false;
    } else {
      await Save.create({ user: userId, frame: frame._id });
      saved = true;
    }

    return sendSuccess(
      res,
      { saved },
      saved ? 'Frame saved to your personal collection' : 'Frame removed from saved collection'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for a frame
 * @route   GET /api/frames/:id/comments
 * @access  Public
 */
export const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    const comments = await Comment.find({ frame: frame._id })
      .populate('author', 'name username avatar role')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, comments, 'Comments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a comment to a frame
 * @route   POST /api/frames/:id/comments
 * @access  Private (Requires valid JWT)
 */
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    // Author is taken strictly from verified JWT user session
    const authorId = req.user._id;

    const comment = await Comment.create({
      frame: frame._id,
      author: authorId,
      content,
    });

    await comment.populate('author', 'name username avatar role');

    return sendSuccess(res, comment, 'Reflection shared beneath this frame', 201);
  } catch (error) {
    next(error);
  }
};
