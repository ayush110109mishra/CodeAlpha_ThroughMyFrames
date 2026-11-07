import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

/**
 * ==============================================================================
 * Cloudinary Configuration & Media Stream Uploader
 * ==============================================================================
 * WHY CLOUDINARY:
 * Provides secure asset hosting, automated responsive delivery transformations
 * (f_auto, q_auto), and global CDN distribution so photography assets load with
 * minimal latency worldwide.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Streams an in-memory buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadBufferToCloudinary = (buffer, folder = 'through-my-frames') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env.'
        )
      );
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Deletes an asset from Cloudinary
 * @param {string} publicId - Cloudinary asset identifier
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn(`[Cloudinary Warning]: Failed to delete asset ${publicId}:`, error.message);
  }
};

export { cloudinary };
