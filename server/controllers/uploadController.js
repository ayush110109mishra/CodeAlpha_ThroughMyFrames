import { uploadBufferToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Upload Controller
 * ==============================================================================
 * Receives uploaded image files from multer memory storage and streams them to Cloudinary.
 * Returns the secure delivery URL and publicId for storage on Frame or User documents.
 */

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided in request', 400);
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      // In development if user hasn't added Cloudinary keys yet, provide a mock data URL
      // so local workflow remains testable while warning in log.
      console.warn(
        '⚠️ [Cloudinary Notice]: Credentials missing in server/.env. Using development preview placeholder.'
      );
      const base64Data = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;
      return sendSuccess(
        res,
        {
          url: dataUri,
          publicId: `dev-local-${Date.now()}`,
          isDevMock: true,
        },
        'Image processed (Development mode without Cloudinary credentials)',
        201
      );
    }

    const { url, publicId } = await uploadBufferToCloudinary(
      req.file.buffer,
      'through-my-frames'
    );

    return sendSuccess(
      res,
      { url, publicId },
      'Image uploaded successfully to Cloudinary',
      201
    );
  } catch (error) {
    next(error);
  }
};
