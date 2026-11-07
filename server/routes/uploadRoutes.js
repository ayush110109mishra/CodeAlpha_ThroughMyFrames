import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Upload Routes
 * ==============================================================================
 * WHY MULTER MEMORY STORAGE:
 * `multer.memoryStorage()` retains uploaded files as Buffers in memory rather than
 * writing temporary files to local disk. This is ideal for containerized or serverless
 * environments where local disks are ephemeral, and allows direct streaming to Cloudinary.
 *
 * File Limits:
 * - 5MB max payload size (prevents memory exhaustion DOS).
 * - Strict MIME type filter: only JPEG, PNG, and WebP are allowed.
 */

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are permitted.'));
    }
  },
});

// Middleware wrapper to catch Multer errors gracefully
const handleUploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('image');
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'File size exceeds 5MB limit', 400);
      }
      return sendError(res, `Upload error: ${err.message}`, 400);
    } else if (err) {
      return sendError(res, err.message, 400);
    }
    next();
  });
};

router.post('/image', protect, uploadLimiter, handleUploadMiddleware, uploadImage);

export default router;
