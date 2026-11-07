import { Comment } from '../models/Comment.js';
import { Frame } from '../models/Frame.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Comment Controller (Phase 3: Moderation & Access Control)
 * ==============================================================================
 * Access Rules for Comment Deletion:
 * A comment can be deleted if and only if:
 * 1. The user authored the comment (`isCommentOwner`).
 * 2. OR the user is the author of the photo frame where the comment was posted (`isFrameOwner`).
 *    WHY: Photographers have curation and moderation authority over their own sanctuary.
 * 3. OR the user has an `admin` role.
 * Any other user is rejected with 403 Forbidden.
 */

/**
 * @desc    Delete a comment by ID
 * @route   DELETE /api/comments/:id
 * @access  Private (Comment Owner, Frame Owner, or Admin)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return sendError(res, 'Comment not found', 404);
    }

    // Fetch the associated frame to check frame ownership
    const frame = await Frame.findById(comment.frame);

    const isCommentOwner = comment.author.toString() === req.user._id.toString();
    const isFrameOwner = frame && frame.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Verify permission
    if (!isCommentOwner && !isFrameOwner && !isAdmin) {
      return sendError(
        res,
        'Forbidden: You do not have permission to delete this reflection',
        403
      );
    }

    await Comment.findByIdAndDelete(id);

    return sendSuccess(res, null, 'Reflection removed successfully');
  } catch (error) {
    next(error);
  }
};
