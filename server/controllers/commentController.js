import { Comment } from '../models/Comment.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Comment Controller
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Handles standalone actions on comments outside the scope of a single frame,
 * such as deleting an inappropriate comment or author moderation.
 */

/**
 * @desc    Delete a comment by ID
 * @route   DELETE /api/comments/:id
 * @access  Open in Phase 2 (TODO: Phase 3 will verify author or admin role via JWT)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return sendError(res, 'Comment not found', 404);
    }

    await Comment.findByIdAndDelete(id);
    return sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

