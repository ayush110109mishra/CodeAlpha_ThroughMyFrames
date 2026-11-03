import express from 'express';
import { deleteComment } from '../controllers/commentController.js';

/**
 * ==============================================================================
 * Comment Routes
 * ==============================================================================
 * Provides endpoints for standalone comment moderation and deletion.
 */

const router = express.Router();

router.delete('/:id', deleteComment);

export default router;
