import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const emailArg = process.argv[2];

if (!emailArg || !emailArg.trim()) {
  console.error('\n❌ [ERROR]: Please provide an email address.');
  console.error('Usage: npm run make-admin -- <email>');
  console.error('Example: npm run make-admin -- honeymishra711@gmail.com\n');
  process.exit(1);
}

const targetEmail = emailArg.trim().toLowerCase();

const run = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('\n❌ [ERROR]: MONGO_URI is not set in environment or server/.env.\n');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.error(`\n❌ [NOT FOUND]: No user found with email: ${targetEmail}`);
      console.error(`Verify the user has registered first before promoting to admin.\n`);
      await mongoose.disconnect();
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`\nℹ️  User @${user.username} (${user.email}) is already an admin.`);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`\n✨ [SUCCESS]: User @${user.username} (${user.email}) has been promoted to role 'admin'!`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ [DATABASE ERROR]: ${err.message}\n`);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
};

run();
