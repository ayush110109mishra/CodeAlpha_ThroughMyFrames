import mongoose from 'mongoose';
import { Frame } from '../models/Frame.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Frame Controller
 * ==============================================================================
 * WHY CONTROLLERS EXIST:
 * Routes define "WHERE a request goes" (HTTP Method + URL).
 * Controllers contain "WHAT happens when it gets there" (Business Logic).
 *
 * This keeps HTTP transport separate from database queries, making code
 * testable, readable, and easy to maintain.
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
 * @desc    Get all frames with filtering, search, pagination, and sorting
 * @route   GET /api/frames
 * @access  Public
 */
export const getFrames = async (req, res, next) => {
  try {
    const {
      mood,
      category,
      search,
      author,
      sort = 'latest',
      page = 1,
      limit = 24,
    } = req.query;

    const query = {};

    // 1. Filter by Mood
    if (mood && mood.toLowerCase() !== 'all') {
      query.mood = new RegExp(`^${mood}$`, 'i');
    }

    // 2. Filter by Category
    if (category && category.toLowerCase() !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    // 3. Filter by Author username
    if (author) {
      const user = await User.findOne({ username: new RegExp(`^${author}$`, 'i') }).select('_id');
      if (user) {
        query.author = user._id;
      }
    }

    // 4. Keyword Search (moment text, location, mood, category)
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { moment: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { mood: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
      ];
    }

    // 5. Sorting strategy
    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { likes: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    // 6. Pagination
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

    return sendSuccess(res, frames, 'Frames retrieved successfully', 200, {
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
 * @access  Public
 */
export const getFrameById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, `Frame not found with identifier: ${id}`, 404);
    }

    await frame.populate('author', 'name username avatar bio location gearSummary');

    // Fetch related comments from Comment collection with populated author
    const comments = await Comment.find({ frame: frame._id })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .lean();

    const responseData = {
      ...frame.toObject(),
      comments,
    };

    return sendSuccess(res, responseData, 'Frame retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a random frame (for Moment of the Day / Surprise Me)
 * @route   GET /api/frames/random
 * @access  Public
 */
export const getRandomFrame = async (req, res, next) => {
  try {
    const { excludeId } = req.query;
    const matchStage = {};

    if (excludeId) {
      if (mongoose.Types.ObjectId.isValid(excludeId)) {
        matchStage._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
      } else {
        matchStage.customId = { $ne: excludeId };
      }
    }

    const randomFrames = await Frame.aggregate([
      { $match: matchStage },
      { $sample: { size: 1 } },
    ]);

    if (!randomFrames || randomFrames.length === 0) {
      // Fallback: pick any frame without filter
      const fallback = await Frame.findOne().populate('author', 'name username avatar');
      return sendSuccess(res, fallback, 'Random frame retrieved');
    }

    const frame = await Frame.findById(randomFrames[0]._id).populate('author', 'name username avatar');
    return sendSuccess(res, frame, 'Random frame retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new frame
 * @route   POST /api/frames
 * @access  Open in Phase 2 (TODO: Phase 3 will protect with JWT authentication)
 */
export const createFrame = async (req, res, next) => {
  try {
    const {
      image,
      moment,
      mood,
      category,
      location,
      camera,
      aspectRatio,
      customId,
    } = req.body;

    // In Phase 2 without JWT, default author to primary photographer (Ayush Misra)
    let authorId = req.body.authorId;
    if (!authorId) {
      const defaultUser = await User.findOne({ username: 'ayushmisra' });
      authorId = defaultUser ? defaultUser._id : (await User.findOne())._id;
    }

    const newFrame = await Frame.create({
      customId: customId || `frame-${Date.now()}`,
      image,
      moment,
      mood: mood || 'Calm',
      category: category || 'Travel',
      location,
      camera: camera || { body: 'Mobile Photography' },
      aspectRatio: aspectRatio || '16/9',
      author: authorId,
    });

    await newFrame.populate('author', 'name username avatar');
    return sendSuccess(res, newFrame, 'Frame created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a frame by ID or slug
 * @route   PUT /api/frames/:id
 * @access  Open in Phase 2 (TODO: Phase 3 will verify author ownership via JWT)
 */
export const updateFrame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    const updatedFrame = await Frame.findByIdAndUpdate(frame._id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name username avatar');

    return sendSuccess(res, updatedFrame, 'Frame updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a frame and associated comments
 * @route   DELETE /api/frames/:id
 * @access  Open in Phase 2 (TODO: Phase 3 will verify author ownership via JWT)
 */
export const deleteFrame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    // Cascade delete: remove all comments linked to this frame
    await Comment.deleteMany({ frame: frame._id });
    await Frame.findByIdAndDelete(frame._id);

    return sendSuccess(res, null, 'Frame and associated comments deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like on a frame
 * @route   POST /api/frames/:id/like
 * @access  Public
 */
export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    // Atomic increment
    frame.likes = (frame.likes || 0) + 1;
    await frame.save();

    return sendSuccess(res, { likes: frame.likes }, 'Like registered');
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
      .populate('author', 'name username avatar')
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
 * @access  Open in Phase 2 (TODO: Phase 3 will inject author from JWT)
 */
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const frame = await findFrameByIdOrSlug(id);

    if (!frame) {
      return sendError(res, 'Frame not found', 404);
    }

    let authorId = req.body.authorId;
    if (!authorId) {
      const defaultUser = await User.findOne({ username: 'ayushmisra' }) || (await User.findOne());
      authorId = defaultUser._id;
    }

    const comment = await Comment.create({
      frame: frame._id,
      author: authorId,
      content,
    });

    await comment.populate('author', 'name username avatar');

    return sendSuccess(res, comment, 'Comment posted successfully', 201);
  } catch (error) {
    next(error);
  }
};
