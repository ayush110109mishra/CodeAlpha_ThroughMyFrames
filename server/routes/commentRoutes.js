import express from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

/**
 * ==============================================================================
 * Comment Routes (Phase 3: Protected Moderation)
 * ==============================================================================
 */

const router = express.Router();

router.delete('/:id', protect, deleteComment);

export default router;
