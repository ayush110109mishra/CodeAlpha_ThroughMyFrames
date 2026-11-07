import express from 'express';
import {
  getUserByUsername,
  toggleFollow,
  getMySavedFrames,
  updateMe,
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

/**
 * ==============================================================================
 * User Routes (Phase 3: Profiles, Saved Frames & Social Graph)
 * ==============================================================================
 * NOTE ON ROUTE ORDERING:
 * Specific `/me/*` and `/me` routes must be registered before the dynamic `/:username`
 * wildcard to prevent Express from interpreting "me" as a username parameter.
 */

const router = express.Router();

// 1. Current user endpoints
router.get('/me/saved', protect, getMySavedFrames);
router.put('/me', protect, updateMe);

// 2. Profile and follow endpoints
router.get('/:username', optionalAuth, getUserByUsername);
router.post('/:username/follow', protect, toggleFollow);

export default router;
