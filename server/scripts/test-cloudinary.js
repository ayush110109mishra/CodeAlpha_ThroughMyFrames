import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const maskKey = (key) => (key ? `${key.slice(0, 3)}...` : '(not set)');
const maskSecret = (sec) => (sec ? '*****' : '(not set)');

async function testCloudinary() {
  console.log('==================================================');
  console.log('🧪 Testing Cloudinary Configuration & Connectivity');
  console.log('==================================================');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log(`Cloud Name : ${cloudName || '(missing)'}`);
  console.log(`API Key    : ${maskKey(apiKey)}`);
  console.log(`API Secret : ${maskSecret(apiSecret)}`);
  console.log('--------------------------------------------------');

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ [CONFIG ERROR]: Cloudinary credentials incomplete in server/.env');
    process.exit(1);
  }

  // 1x1 pixel PNG buffer
  const tinyPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(tinyPngBase64, 'base64');

  console.log('📤 Uploading 1x1 test image buffer to folder "through-my-frames"...');

  let uploadResult;
  try {
    uploadResult = await uploadBufferToCloudinary(buffer, 'through-my-frames');
    console.log('✅ [UPLOAD SUCCESS]');
    console.log(`   Public ID  : ${uploadResult.publicId}`);
    console.log(`   Secure URL : ${uploadResult.url}`);
  } catch (err) {
    console.error('❌ [UPLOAD FAILED]');
    console.error(`   Error message : ${err.message}`);
    if (err.http_code) console.error(`   HTTP Code     : ${err.http_code}`);

    // Map common Cloudinary errors to root causes
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('must supply cloud_name') || msg.includes('cloud_name is disabled')) {
      console.error('   👉 Diagnosis   : Invalid or disabled Cloud Name.');
    } else if (msg.includes('invalid api key') || msg.includes('unknown api key') || msg.includes('unauthorized') || err.http_code === 401) {
      console.error('   👉 Diagnosis   : Wrong API Key or API Secret, or mismatched credentials between projects.');
    } else if (msg.includes('account is disabled') || msg.includes('locked')) {
      console.error('   👉 Diagnosis   : Cloudinary account has been disabled or locked.');
    } else {
      console.error('   👉 Diagnosis   : Network failure or Cloudinary API restriction.');
    }
    process.exit(1);
  }

  // Verify URL with HTTP GET/HEAD
  console.log('\n🌐 Verifying delivered image URL over HTTP...');
  try {
    const fetchRes = await fetch(uploadResult.url, { method: 'GET' });
    console.log(`   HTTP Status    : ${fetchRes.status} ${fetchRes.statusText}`);
    console.log(`   Content-Type   : ${fetchRes.headers.get('content-type')}`);
    console.log(`   Content-Length : ${fetchRes.headers.get('content-length')} bytes`);

    if (fetchRes.ok) {
      console.log('✅ [FETCH SUCCESS]: Image is publicly accessible over CDN.');
    } else {
      console.error(`⚠️ [FETCH WARNING]: URL returned non-200 status (${fetchRes.status}).`);
    }
  } catch (fetchErr) {
    console.error(`❌ [FETCH FAILED]: ${fetchErr.message}`);
  }

  // Delete test asset
  console.log('\n🧹 Cleaning up test asset from Cloudinary...');
  try {
    await deleteFromCloudinary(uploadResult.publicId);
    console.log(`✅ [CLEANUP SUCCESS]: Asset ${uploadResult.publicId} deleted.`);
  } catch (delErr) {
    console.warn(`⚠️ [CLEANUP WARNING]: ${delErr.message}`);
  }

  console.log('==================================================');
}

testCloudinary();
