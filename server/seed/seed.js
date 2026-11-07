import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Mongoose Models
import { User } from '../models/User.js';
import { Frame } from '../models/Frame.js';
import { Comment } from '../models/Comment.js';
import { Thought } from '../models/Thought.js';
import { Collection } from '../models/Collection.js';
import { Trip } from '../models/Trip.js';
import { Photographer } from '../models/Photographer.js';
import { Like } from '../models/Like.js';
import { Follow } from '../models/Follow.js';
import { Save } from '../models/Save.js';

// Secret Masking Utility
import { maskMongoUri } from '../utils/maskSecret.js';

// Existing Mock Data from src/data
import { users as initialUsers } from '../../src/data/users.js';
import { frames as initialFrames } from '../../src/data/frames.js';
import { thoughts as initialThoughts } from '../../src/data/thoughts.js';
import { collections as initialCollections } from '../../src/data/collections.js';
import { trips as initialTrips } from '../../src/data/trips.js';
import { photographerData } from '../../src/data/photographer.js';

/**
 * ==============================================================================
 * Database Seed Script (Phase 3: Auth & Social Ready)
 * ==============================================================================
 * WHY THIS SCRIPT EXISTS:
 * Seeds the database with initialized user profiles, hashed passwords,
 * frame artifacts, thoughts, collections, and photographer sanctuary content.
 *
 * Security & Repeatability:
 * 1. Safe to re-run at any time (`npm run seed`).
 * 2. Passwords are salted and hashed using bcrypt (cost 10).
 * 3. Owner password is read dynamically from SEED_OWNER_PASSWORD in .env.
 * 4. Demo users receive the documented standard demo password "Demo@12345".
 * 5. Masks sensitive connection strings in console logs.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedDatabase = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasForce = process.argv.includes('--force');

  if (isProduction && !hasForce) {
    console.error(`\n🚨 [DANGER: PRODUCTION SEED REFUSED]`);
    console.error(`Attempted to run database seed in NODE_ENV=production without the --force flag.`);
    console.error(`WARNING: Running seed WILL IRREVERSIBLY WIPE all collections (users, frames, comments, likes, saves).`);
    console.error(`If you genuinely intend to wipe and re-seed production, run:`);
    console.error(`  node seed/seed.js --force\n`);
    process.exit(1);
  }

  if (isProduction && hasForce) {
    console.warn(`\n⚠️  [WARNING: PRODUCTION SEED RUNNING WITH --FORCE]`);
    console.warn(`All production collections will be wiped and reset to seed defaults!\n`);
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/through-my-frames';
  console.log(`\n🌱 [Database Seed Initiated]`);
  console.log(`🔗 Target MongoDB: ${maskMongoUri(mongoUri)}`);

  try {
    await mongoose.connect(mongoUri);
    console.log(`✓ Connected to MongoDB`);

    // 1. Clear Existing Data
    console.log(`🧹 Clearing existing collections...`);
    await Promise.all([
      User.deleteMany({}),
      Frame.deleteMany({}),
      Comment.deleteMany({}),
      Thought.deleteMany({}),
      Collection.deleteMany({}),
      Trip.deleteMany({}),
      Photographer.deleteMany({}),
      Like.deleteMany({}),
      Follow.deleteMany({}),
      Save.deleteMany({}),
    ]);
    console.log(`✓ Collections cleared`);

    // 2. Prepare Hashed Passwords
    const ownerPassword = process.env.SEED_OWNER_PASSWORD || 'Ayush@12345';
    const demoPassword = 'Demo@12345';

    const salt = await bcrypt.genSalt(10);
    const ownerPasswordHash = await bcrypt.hash(ownerPassword, salt);
    const demoPasswordHash = await bcrypt.hash(demoPassword, salt);

    // 3. Seed Users with valid emails, roles, and password hashes
    console.log(`👤 Seeding Users with hashed credentials...`);
    const usersToCreate = initialUsers.map((u) => {
      const isOwner = u.username.toLowerCase() === 'ayushmishra';
      return {
        ...u,
        email: isOwner ? 'honeymishra711@gmail.com' : `${u.username.toLowerCase()}@throughmyframes.art`,
        passwordHash: isOwner ? ownerPasswordHash : demoPasswordHash,
        role: isOwner ? 'admin' : 'user',
        headline: u.role || 'Wanderer',
      };
    });

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✓ Seeded ${createdUsers.length} Users`);

    // Create a lookup map: lowercase username -> User _id
    const userMap = new Map();
    createdUsers.forEach((u) => {
      userMap.set(u.username.toLowerCase(), u._id);
    });

    const getUserId = (username) => {
      if (!username) return createdUsers[0]._id;
      const key = username.toLowerCase().replace(/[-_\s]/g, '');
      if (key === 'ayushmishra') {
        return userMap.get('ayushmishra') || createdUsers[0]._id;
      }
      return userMap.get(username.toLowerCase()) || createdUsers[0]._id;
    };

    const safeDate = (dateVal) => {
      if (!dateVal) return new Date();
      if (typeof dateVal === 'string') {
        const cleanStr = dateVal.replace(' T', 'T').trim();
        const d = new Date(cleanStr);
        if (!isNaN(d.getTime())) return d;
      }
      const fallback = new Date(dateVal);
      return !isNaN(fallback.getTime()) ? fallback : new Date();
    };

    // 4. Seed Frames and Comments
    console.log(`🖼️  Seeding Frames & Comments...`);
    const frameDocMap = new Map(); // slug/id -> Frame _id
    const commentsToInsert = [];

    for (const f of initialFrames) {
      const authorId = getUserId(f.author?.username);
      const frameDoc = await Frame.create({
        customId: f.id,
        image: f.image,
        fallbackImage: f.fallbackImage || '/images/placeholder.jpg',
        moment: f.moment,
        mood: f.mood || 'Calm',
        category: f.category || 'Travel',
        location: f.location || 'Undisclosed Location',
        camera: f.camera || {
          body: 'Mobile Photography',
          lens: 'Wide Angle',
          settings: 'Natural Light',
        },
        likes: typeof f.likes === 'number' ? f.likes : 0,
        aspectRatio: f.aspectRatio || '16/9',
        author: authorId,
        createdAt: safeDate(f.createdAt),
        updatedAt: safeDate(f.createdAt),
      });

      frameDocMap.set(f.id, frameDoc._id);

      // Collect nested comments
      if (Array.isArray(f.comments) && f.comments.length > 0) {
        for (const c of f.comments) {
          commentsToInsert.push({
            frame: frameDoc._id,
            author: getUserId(c.author?.username),
            content: c.content || c.text || 'Beautiful perspective.',
            createdAt: safeDate(c.createdAt),
            updatedAt: safeDate(c.createdAt),
          });
        }
      }
    }

    console.log(`✓ Seeded ${initialFrames.length} Frames`);

    if (commentsToInsert.length > 0) {
      await Comment.insertMany(commentsToInsert);
      console.log(`✓ Seeded ${commentsToInsert.length} Comments`);
    }

    // 5. Seed Thoughts
    console.log(`💭 Seeding Thoughts...`);
    const thoughtsToInsert = initialThoughts.map((t) => ({
      customId: t.id,
      text: t.text,
      mood: t.mood || 'Calm',
      tags: t.tags || ['Reflections'],
      background: t.background || 'linear-gradient(135deg, rgba(194, 105, 62, 0.08) 0%, rgba(233, 201, 168, 0.18) 100%)',
      author: getUserId(t.author?.username),
      createdAt: safeDate(t.createdAt),
      updatedAt: safeDate(t.createdAt),
    }));
    await Thought.insertMany(thoughtsToInsert);
    console.log(`✓ Seeded ${thoughtsToInsert.length} Thoughts`);

    // 6. Seed Collections
    console.log(`📚 Seeding Collections...`);
    const collectionsToInsert = initialCollections.map((col) => {
      const resolvedFrameObjectIds = (col.frameIds || [])
        .map((slug) => frameDocMap.get(slug))
        .filter(Boolean);

      return {
        customId: col.id,
        title: col.title,
        description: col.description,
        cover: col.cover,
        frameIds: col.frameIds || [],
        frames: resolvedFrameObjectIds,
        count: col.count || col.frameIds?.length || 0,
        author: getUserId(col.author?.username),
      };
    });
    await Collection.insertMany(collectionsToInsert);
    console.log(`✓ Seeded ${collectionsToInsert.length} Collections`);

    // 7. Seed Trips
    console.log(`🗺️  Seeding Trips...`);
    const tripsToInsert = initialTrips.map((tr) => {
      const resolvedFrameObjectIds = (tr.frames || [])
        .map((slug) => frameDocMap.get(slug))
        .filter(Boolean);

      return {
        customId: tr.id,
        title: tr.title,
        place: tr.place,
        dates: tr.dates,
        cover: tr.cover,
        fallbackImage: tr.fallbackImage || '/images/placeholder.jpg',
        story: tr.story,
        frames: resolvedFrameObjectIds,
        frameIds: tr.frames || [],
        coordinates: tr.coordinates || { x: 50, y: 50 },
        highlights: tr.highlights || [],
        author: getUserId('ayushmishra'),
      };
    });
    await Trip.insertMany(tripsToInsert);
    console.log(`✓ Seeded ${tripsToInsert.length} Trips`);

    // 8. Seed Photographer Sanctuary (Ayush Mishra)
    console.log(`🏛️  Seeding Photographer Sanctuary...`);
    await Photographer.create({
      name: photographerData.name || 'Ayush Mishra',
      title: photographerData.title,
      tagline: photographerData.tagline,
      portrait: photographerData.portrait,
      portraitAlt: photographerData.portraitAlt,
      location: photographerData.location,
      yearsActive: photographerData.yearsActive,
      statement: photographerData.statement,
      philosophy: photographerData.philosophy,
      timeline: photographerData.timeline,
      gear: photographerData.gear,
      favoriteFrameIds: photographerData.favoriteFrameIds,
      currentExploration: photographerData.currentExploration,
      socials: photographerData.socials,
    });
    console.log(`✓ Seeded Photographer Sanctuary Profile (Ayush Mishra)`);

    console.log(`\n==================================================`);
    console.log(`✨ Phase 3 Database Seed Completed Successfully!`);
    console.log(`🔑 Owner: ayushmishra (password from SEED_OWNER_PASSWORD)`);
    console.log(`🔑 Demo Accounts: aman, riya, mirapatel (password: Demo@12345)`);
    console.log(`==================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ [Database Seed Error]:`, error);
    process.exit(1);
  }
};

seedDatabase();
