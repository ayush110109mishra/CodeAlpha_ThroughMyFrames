import express from 'express';
import { body } from 'express-validator';
import {
  getFrames,
  getFrameById,
  getRandomFrame,
  createFrame,
  updateFrame,
  deleteFrame,
  toggleLike,
  getComments,
  addComment,
} from '../controllers/frameController.js';
import { validate } from '../middleware/validate.js';

/**
 * ==============================================================================
 * Frame Routes
 * ==============================================================================
 * WHY ROUTES EXIST:
 * Routes define the API contract: which URLs and HTTP verbs map to which controllers.
 * Adding validation middleware directly to routes ensures malformed data is rejected
 * before hitting controller logic.
 */

const router = express.Router();

// Validation rules for creating a frame
const createFrameValidation = [
  body('image').notEmpty().withMessage('Photo image path or URL is required'),
  body('moment')
    .notEmpty()
    .withMessage('Moment caption is required')
    .isLength({ max: 280 })
    .withMessage('Moment cannot exceed 280 characters'),
  body('location').notEmpty().withMessage('Location is required'),
  body('mood')
    .optional()
    .isIn(['Calm', 'Nostalgic', 'Wanderlust', 'Curious', 'Grateful', 'Random'])
    .withMessage('Invalid mood selection'),
  body('category')
    .optional()
    .isIn(['Travel', 'Street', 'Nature', 'Sky', 'Portrait', 'Thoughts'])
    .withMessage('Invalid category selection'),
];

// Validation for adding a comment
const addCommentValidation = [
  body('content')
    .notEmpty()
    .withMessage('Comment cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

// 1. Random Frame route (must be placed BEFORE /:id so 'random' is not interpreted as an ID)
router.get('/random', getRandomFrame);

// 2. Collection root routes
router
  .route('/')
  .get(getFrames)
  .post(validate(createFrameValidation), createFrame);

// 3. Frame by ID or slug routes
router
  .route('/:id')
  .get(getFrameById)
  .put(updateFrame)
  .delete(deleteFrame);

// 4. Like toggle route
router.post('/:id/like', toggleLike);

// 5. Nested comments routes for this frame
router
  .route('/:id/comments')
  .get(getComments)
  .post(validate(addCommentValidation), addComment);

export default router;
