import mongoose from 'mongoose';
import { Collection } from '../models/Collection.js';
import { Frame } from '../models/Frame.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Collection Controller (Phase 4: Full Collections Lifecycle)
 * ==============================================================================
 */

const findCollectionByIdOrSlug = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const col = await Collection.findById(identifier);
    if (col) return col;
  }
  return await Collection.findOne({ customId: identifier });
};

/**
 * @desc    Get all collections (optional author filter)
 * @route   GET /api/collections
 * @access  Public
 */
export const getCollections = async (req, res, next) => {
  try {
    const { author } = req.query;
    const query = {};

    if (author) {
      if (mongoose.Types.ObjectId.isValid(author)) {
        query.author = author;
      } else {
        const user = await User.findOne({ username: new RegExp(`^${author}$`, 'i') });
        if (user) {
          query.author = user._id;
        } else {
          return sendSuccess(res, [], 'No collections found for user');
        }
      }
    }

    const collections = await Collection.find(query)
      .populate('author', 'name username avatar role')
      .populate('frames')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, collections, 'Collections retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single collection by ID or slug (with its frames populated)
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

    await collection.populate('author', 'name username avatar role');
    await collection.populate({
      path: 'frames',
      populate: { path: 'author', select: 'name username avatar role' },
    });

    const payload = collection.toJSON();

    if (!payload.frames || payload.frames.length === 0) {
      if (payload.frameIds && payload.frameIds.length > 0) {
        payload.frames = await Frame.find({
          $or: [{ customId: { $in: payload.frameIds } }, { _id: { $in: payload.frameIds } }],
        }).populate('author', 'name username avatar role');
      }
    }

    return sendSuccess(res, payload, 'Collection retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a collection
 * @route   POST /api/collections
 * @access  Private (Requires valid JWT)
 */
export const createCollection = async (req, res, next) => {
  try {
    const { title, description, cover, frameIds, customId } = req.body;

    // Author is taken strictly from verified JWT
    const authorId = req.user._id;

    // Resolve frame ObjectIds if frameIds slugs are provided
    let frameObjectIds = [];
    if (Array.isArray(frameIds) && frameIds.length > 0) {
      const matched = await Frame.find({
        $or: [{ customId: { $in: frameIds } }, { _id: { $in: frameIds } }],
      }).select('_id');
      frameObjectIds = matched.map((f) => f._id);
    }

    const newCollection = await Collection.create({
      customId: customId || `collection-${Date.now()}`,
      title,
      description: description || '',
      cover,
      frameIds: frameIds || [],
      frames: frameObjectIds,
      count: frameObjectIds.length,
      author: authorId,
    });

    await newCollection.populate('author', 'name username avatar role');
    return sendSuccess(res, newCollection, 'Collection created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a collection
 * @route   PUT /api/collections/:id
 * @access  Private (Owner or Admin only)
 */
export const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await findCollectionByIdOrSlug(id);

    if (!collection) {
      return sendError(res, 'Collection not found', 404);
    }

    // Ownership check
    const isOwner = collection.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Forbidden: You do not have permission to modify this collection', 403);
    }

    delete req.body.author;

    const updated = await Collection.findByIdAndUpdate(collection._id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name username avatar role');

    return sendSuccess(res, updated, 'Collection updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle frame in collection (add if missing, remove if present)
 * @route   POST /api/collections/:id/frames
 * @access  Private (Owner or Admin only)
 */
export const toggleFrameInCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { frameId } = req.body;

    if (!frameId) {
      return sendError(res, 'frameId is required', 400);
    }

    const collection = await findCollectionByIdOrSlug(id);
    if (!collection) {
      return sendError(res, 'Collection not found', 404);
    }

    // Ownership check
    const isOwner = collection.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Forbidden: You do not have permission to modify this collection', 403);
    }

    // Resolve target frame
    let targetFrame = null;
    if (mongoose.Types.ObjectId.isValid(frameId)) {
      targetFrame = await Frame.findById(frameId);
    }
    if (!targetFrame) {
      targetFrame = await Frame.findOne({ customId: frameId });
    }
    if (!targetFrame) {
      return sendError(res, 'Frame not found', 404);
    }

    const frameObjId = targetFrame._id;
    const exists = collection.frames.some((f) => f.toString() === frameObjId.toString());

    if (exists) {
      collection.frames = collection.frames.filter((f) => f.toString() !== frameObjId.toString());
      if (collection.frameIds) {
        collection.frameIds = collection.frameIds.filter(
          (cid) => cid !== targetFrame.customId && cid !== frameObjId.toString()
        );
      }
    } else {
      collection.frames.push(frameObjId);
      if (targetFrame.customId && !collection.frameIds.includes(targetFrame.customId)) {
        collection.frameIds.push(targetFrame.customId);
      }
    }

    collection.count = collection.frames.length;
    await collection.save();

    return sendSuccess(
      res,
      {
        collectionId: collection._id,
        inCollection: !exists,
        count: collection.count,
      },
      !exists ? 'Photograph added to collection' : 'Photograph removed from collection'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a collection
 * @route   DELETE /api/collections/:id
 * @access  Private (Owner or Admin only)
 */
export const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await findCollectionByIdOrSlug(id);

    if (!collection) {
      return sendError(res, 'Collection not found', 404);
    }

    // Ownership check
    const isOwner = collection.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Forbidden: You do not have permission to delete this collection', 403);
    }

    await Collection.findByIdAndDelete(collection._id);
    return sendSuccess(res, null, 'Collection deleted successfully');
  } catch (error) {
    next(error);
  }
};
