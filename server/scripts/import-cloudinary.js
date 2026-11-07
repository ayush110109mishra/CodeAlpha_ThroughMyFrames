import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { Frame } from '../models/Frame.js';
import { User } from '../models/User.js';

const maskKey = (key) => (key ? `${key.slice(0, 3)}...` : '(not set)');
const maskSecret = (sec) => (sec ? '*****' : '(not set)');
const maskUri = (uri) => (uri ? uri.replace(/:([^@:]+)@/, ':*****@') : '');

async function importCloudinary() {
  const shouldCreate = process.argv.includes('--create');

  console.log('================================================================');
  console.log('📸 Cloudinary Asset Sync & Frame Health Auditor');
  console.log('================================================================');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const mongoUri = process.env.MONGO_URI;

  console.log(`Cloud Name : ${cloudName || '(not configured)'}`);
  console.log(`API Key    : ${maskKey(apiKey)}`);
  console.log(`API Secret : ${maskSecret(apiSecret)}`);
  console.log(`Mongo URI  : ${maskUri(mongoUri)}`);
  console.log(`Mode       : ${shouldCreate ? 'CREATE MISSING FRAMES (--create)' : 'DRY RUN (read-only)'}`);
  console.log('----------------------------------------------------------------');

  // 1. Connect to MongoDB
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB Atlas.');
  } catch (dbErr) {
    console.error('❌ Failed to connect to MongoDB:', dbErr.message);
    process.exit(1);
  }

  // 2. Fetch Assets from Cloudinary Admin API
  let cloudinaryAssets = [];
  let cloudinaryFetchFailed = false;

  if (!isCloudinaryConfigured()) {
    console.warn('⚠️ Cloudinary credentials are not fully configured in server/.env.');
    cloudinaryFetchFailed = true;
  } else {
    try {
      console.log('🔍 Querying Cloudinary Admin API for folder "through-my-frames"...');
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'through-my-frames/',
        max_results: 500,
      });
      cloudinaryAssets = result.resources || [];
      console.log(`✅ Retrieved ${cloudinaryAssets.length} asset(s) from Cloudinary folder "through-my-frames/".`);
    } catch (apiErr) {
      cloudinaryFetchFailed = true;
      console.error('❌ Cloudinary Admin API error:');
      console.error(`   Message   : ${apiErr.message}`);
      if (apiErr.http_code) console.error(`   HTTP Code : ${apiErr.http_code}`);
    }
  }

  // 3. Query Frames from MongoDB
  const dbFrames = await Frame.find({}).populate('author', 'username name email');
  console.log(`📊 Total Frame documents in MongoDB: ${dbFrames.length}`);

  // 4. Compare Cloudinary assets with DB
  if (!cloudinaryFetchFailed) {
    const missingInDb = cloudinaryAssets.filter((asset) => {
      return !dbFrames.some((frame) => {
        return (
          frame.cloudinaryPublicId === asset.public_id ||
          (frame.image && frame.image.includes(asset.public_id)) ||
          frame.image === asset.secure_url
        );
      });
    });

    console.log('\n----------------------------------------------------------------');
    console.log(`Assets in Cloudinary missing from MongoDB: ${missingInDb.length}`);

    if (missingInDb.length > 0) {
      missingInDb.forEach((asset, idx) => {
        console.log(`  ${idx + 1}. Public ID: ${asset.public_id} (${asset.secure_url})`);
      });

      if (shouldCreate) {
        console.log('\n⚙️ Creating missing frames in MongoDB for user "ayushmishra"...');
        const owner =
          (await User.findOne({ username: 'ayushmishra' })) ||
          (await User.findOne({ role: 'admin' }));

        if (!owner) {
          console.error('❌ Could not find user "ayushmishra" or any admin to assign frames to.');
        } else {
          let createdCount = 0;
          for (const asset of missingInDb) {
            const rawName = asset.public_id.split('/').pop().replace(/[_-]+/g, ' ');
            const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            const newFrame = new Frame({
              image: asset.secure_url,
              cloudinaryPublicId: asset.public_id,
              fallbackImage: '/images/placeholder.jpg',
              moment: `${title} — A serene moment captured in India.`,
              mood: 'Calm',
              category: 'Travel',
              location: 'India',
              author: owner._id,
              camera: {
                body: 'Mobile Photography',
                lens: 'Wide Angle',
                settings: 'Natural Light',
              },
            });
            await newFrame.save();
            createdCount++;
            console.log(`  + Created Frame: "${title}" -> ${asset.secure_url}`);
          }
          console.log(`✅ Successfully created ${createdCount} frame(s) in MongoDB.`);
        }
      } else {
        console.log('ℹ️ Run with --create flag to insert these missing frames into MongoDB.');
      }
    } else {
      console.log('✅ All Cloudinary assets already have matching Frame records in MongoDB.');
    }
  } else {
    console.log('\n⚠️ Skipped Cloudinary asset comparison due to Admin API failure.');
  }

  // 5. Check Health of All Existing Frame Image URLs in DB
  console.log('\n================================================================');
  console.log('🩺 Verifying Image Availability for Existing Frames in MongoDB');
  console.log('================================================================');

  let deadCount = 0;
  let activeCount = 0;
  const projectRoot = path.resolve(__dirname, '../..');
  const publicDir = path.resolve(projectRoot, 'public');

  for (const frame of dbFrames) {
    const frameId = frame.id || frame._id;
    const url = frame.image;
    let isOk = false;
    let statusDesc = '';

    if (!url) {
      isOk = false;
      statusDesc = 'EMPTY_URL';
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // Remote URL
      try {
        let res = await fetch(url, { method: 'HEAD' });
        if (res.status === 405 || res.status === 403) {
          // Retry with GET if HEAD is not allowed
          res = await fetch(url, { method: 'GET' });
        }
        if (res.ok) {
          isOk = true;
          statusDesc = `HTTP ${res.status}`;
        } else {
          isOk = false;
          statusDesc = `HTTP ${res.status} ${res.statusText}`;
        }
      } catch (err) {
        isOk = false;
        statusDesc = `NETWORK_ERROR: ${err.message}`;
      }
    } else {
      // Local static file path (e.g. /images/...)
      const cleanPath = url.replace(/^\/+/, '');
      const localFilePath = path.join(publicDir, cleanPath);
      if (fs.existsSync(localFilePath)) {
        isOk = true;
        statusDesc = `LOCAL_FILE_FOUND (${cleanPath})`;
      } else {
        isOk = false;
        statusDesc = `LOCAL_FILE_MISSING (${localFilePath})`;
      }
    }

    if (isOk) {
      activeCount++;
      console.log(`  ✅ [${frameId}] "${frame.moment?.slice(0, 30)}..." -> ${statusDesc}`);
    } else {
      deadCount++;
      console.error(`  ❌ [${frameId}] DEAD LINK: ${url} (${statusDesc})`);
    }
  }

  console.log('----------------------------------------------------------------');
  console.log(`Scan Summary: ${activeCount} Healthy | ${deadCount} Dead Link(s) out of ${dbFrames.length} Frames`);
  console.log('================================================================\n');

  await mongoose.disconnect();
}

importCloudinary().catch((err) => {
  console.error('Fatal error in import-cloudinary:', err);
  process.exit(1);
});
