import mongoose from 'mongoose';
import { Thought } from '../models/Thought.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Thought Controller (Phase 3: Protected Writes)
 * ==============================================================================
 */

const findThoughtByIdOrSlug = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const thought = await Thought.findById(identifier);
    if (thought) return thought;
  }
  return await Thought.findOne({ customId: identifier });
};

/**
 * @desc    Get single random thought
 * @route   GET /api/thoughts/random
 * @access  Public
 */
export const getRandomThought = async (req, res, next) => {
  try {
    const count = await Thought.countDocuments();
    if (count === 0) {
      return sendError(res, 'No thoughts found', 404);
    }
    const random = Math.floor(Math.random() * count);
    const thought = await Thought.findOne().skip(random).populate('author', 'name username avatar role');
    return sendSuccess(res, thought, 'Random thought retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all thoughts (with mood filter & text search)
 * @route   GET /api/thoughts
 * @access  Public
 */
export const getThoughts = async (req, res, next) => {
  try {
    const { mood, author, search } = req.query;
    const query = {};

    if (mood && mood.toLowerCase() !== 'all') {
      query.mood = new RegExp(`^${mood}$`, 'i');
    }

    if (author) {
      const user = await User.findOne({ username: new RegExp(`^${author}$`, 'i') });
      if (user) query.author = user._id;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { text: { $regex: term, $options: 'i' } },
        { mood: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } },
      ];
    }

    const thoughts = await Thought.find(query)
      .populate('author', 'name username avatar role')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, thoughts, 'Thoughts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single thought by ID or slug
 * @route   GET /api/thoughts/:id
 * @access  Public
 */
export const getThoughtById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const thought = await findThoughtByIdOrSlug(id);

    if (!thought) {
      return sendError(res, 'Thought not found', 404);
    }

    await thought.populate('author', 'name username avatar role');
    return sendSuccess(res, thought, 'Thought retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new thought
 * @route   POST /api/thoughts
 * @access  Private (Requires valid JWT)
 */
export const createThought = async (req, res, next) => {
  try {
    const { text, mood, tags, background, customId } = req.body;

    // Author is taken strictly from verified JWT
    const authorId = req.user._id;

    const newThought = await Thought.create({
      customId: customId || `thought-${Date.now()}`,
      text,
      mood: mood || 'Calm',
      tags: tags || ['Reflections'],
      background:
        background ||
        'linear-gradient(135deg, rgba(194, 105, 62, 0.08) 0%, rgba(233, 201, 168, 0.18) 100%)',
      author: authorId,
    });

    await newThought.populate('author', 'name username avatar role');
    return sendSuccess(res, newThought, 'Thought published to the living journal!', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a thought
 * @route   PUT /api/thoughts/:id
 * @access  Private (Owner or Admin only)
 */
export const updateThought = async (req, res, next) => {
  try {
    const { id } = req.params;
    const thought = await findThoughtByIdOrSlug(id);

    if (!thought) {
      return sendError(res, 'Thought not found', 404);
    }

    // Ownership check
    const isOwner = thought.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Forbidden: You do not have permission to modify this thought', 403);
    }

    delete req.body.author;

    const updated = await Thought.findByIdAndUpdate(thought._id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name username avatar role');

    return sendSuccess(res, updated, 'Thought updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a thought
 * @route   DELETE /api/thoughts/:id
 * @access  Private (Owner or Admin only)
 */
export const deleteThought = async (req, res, next) => {
  try {
    const { id } = req.params;
    const thought = await findThoughtByIdOrSlug(id);

    if (!thought) {
      return sendError(res, 'Thought not found', 404);
    }

    // Ownership check
    const isOwner = thought.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Forbidden: You do not have permission to delete this thought', 403);
    }

    await Thought.findByIdAndDelete(thought._id);
    return sendSuccess(res, null, 'Thought deleted successfully');
  } catch (error) {
    next(error);
  }
};
