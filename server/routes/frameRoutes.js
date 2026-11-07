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
  toggleSave,
  getComments,
  addComment,
} from '../controllers/frameController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { commentLimiter } from '../middleware/rateLimiter.js';

/**
 * ==============================================================================
 * Frame Routes (Phase 3: Protected Routes & Interactions)
 * ==============================================================================
 * Maps HTTP verbs to controllers.
 * - Writes (POST, PUT, DELETE) require valid JWT authentication via `protect`.
 * - Public reads use `optionalAuth` to personalize like/save states when logged in.
 */

const router = express.Router();

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

const addCommentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

// 1. Random Frame route (placed before /:id)
router.get('/random', getRandomFrame);

// 2. Collection root routes
router
  .route('/')
  .get(optionalAuth, getFrames)
  .post(protect, validate(createFrameValidation), createFrame);

// 3. Frame by ID or slug routes
router
  .route('/:id')
  .get(optionalAuth, getFrameById)
  .put(protect, updateFrame)
  .delete(protect, deleteFrame);

// 4. Social interaction toggles
router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSave);

// 5. Nested comments routes
router
  .route('/:id/comments')
  .get(getComments)
  .post(protect, commentLimiter, validate(addCommentValidation), addComment);

export default router;
