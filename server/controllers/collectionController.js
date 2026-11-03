import mongoose from 'mongoose';
import { Collection } from '../models/Collection.js';
import { Frame } from '../models/Frame.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Collection Controller
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Handles CRUD and retrieval for curated albums of frames.
 */

const findCollectionByIdOrSlug = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const col = await Collection.findById(identifier);
    if (col) return col;
  }
  return await Collection.findOne({ customId: identifier });
};

/**
 * @desc    Get all curated collections
 * @route   GET /api/collections
 * @access  Public
 */
export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find()
      .populate('author', 'name username avatar role')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, collections, 'Collections retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single collection by ID or slug (expands full frames)
 * @route   GET /api/collections/:id
 * @access  Public
 */
export const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await findCollectionByIdOrSlug(id);

    if (!collection) {
      return sendError(res, 'Collection not found', 404);
    }

    await collection.populate('author', 'name username avatar bio');

    // Also populate frames either by ObjectId reference or matching frameIds slugs
    let frames = [];
    if (collection.frames && collection.frames.length > 0) {
      frames = await Frame.find({ _id: { $in: collection.frames } })
        .populate('author', 'name username avatar')
        .lean();
    } else if (collection.frameIds && collection.frameIds.length > 0) {
      frames = await Frame.find({ customId: { $in: collection.frameIds } })
        .populate('author', 'name username avatar')
        .lean();
    }

    const responseData = {
      ...collection.toObject(),
      frames,
    };

    return sendSuccess(res, responseData, 'Collection retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a collection
 * @route   POST /api/collections
 * @access  Open in Phase 2 (TODO: Phase 3 will protect with JWT)
 */
export const createCollection = async (req, res, next) => {
  try {
    const { title, description, cover, frameIds, customId } = req.body;

    let authorId = req.body.authorId;
    if (!authorId) {
      const defaultUser = await User.findOne({ username: 'ayushmisra' }) || (await User.findOne());
      authorId = defaultUser._id;
    }

    // Resolve frame ObjectIds if frameIds slugs are provided
    let frameObjectIds = [];
    if (Array.isArray(frameIds) && frameIds.length > 0) {
      const matched = await Frame.find({ customId: { $in: frameIds } }).select('_id');
      frameObjectIds = matched.map((f) => f._id);
    }

    const newCollection = await Collection.create({
      customId: customId || `collection-${Date.now()}`,
      title,
      description,
      cover,
      frameIds: frameIds || [],
      frames: frameObjectIds,
      count: frameIds?.length || 0,
      author: authorId,
    });

    await newCollection.populate('author', 'name username avatar');
    return sendSuccess(res, newCollection, 'Collection created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a collection
 * @route   PUT /api/collections/:id
 * @access  Open in Phase 2 (TODO: Phase 3 will verify author via JWT)
 */
export const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await findCollectionByIdOrSlug(id);

    if (!collection) {
      return sendError(res, 'Collection not found', 404);
    }

    const updated = await Collection.findByIdAndUpdate(collection._id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name username avatar');

    return sendSuccess(res, updated, 'Collection updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a collection
 * @route   DELETE /api/collections/:id
 * @access  Open in Phase 2 (TODO: Phase 3 will verify author via JWT)
 */
export const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await findCollectionByIdOrSlug(id);

    if (!collection) {
      return sendError(res, 'Collection not found', 404);
    }

    await Collection.findByIdAndDelete(collection._id);
    return sendSuccess(res, null, 'Collection deleted successfully');
  } catch (error) {
    next(error);
  }
};
