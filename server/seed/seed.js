
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Mongoose Models
import { User } from '../models/User.js';
import { Frame } from '../models/Frame.js';
import { Comment } from '../models/Comment.js';
import { Thought } from '../models/Thought.js';
import { Collection } from '../models/Collection.js';
import { Trip } from '../models/Trip.js';
import { Photographer } from '../models/Photographer.js';

// Existing Mock Data from src/data
import { users as initialUsers } from '../../src/data/users.js';
import { frames as initialFrames } from '../../src/data/frames.js';
import { thoughts as initialThoughts } from '../../src/data/thoughts.js';
import { collections as initialCollections } from '../../src/data/collections.js';
import { trips as initialTrips } from '../../src/data/trips.js';
import { photographerData } from '../../src/data/photographer.js';

/**
 * ==============================================================================
 * Database Seed Script
 * ==============================================================================
 * WHY THIS SCRIPT EXISTS:
 * Bridges the static frontend mock files (src/data/*.js) to real MongoDB documents.
 * It is completely idempotent and safe to re-run at any time (`npm run seed`):
 * 1. Connects to MongoDB.
 * 2. Clears all existing collections.
 * 3. Converts nested author strings & comments into proper relational references.
 * 4. Seeds Users, Frames, Comments, Thoughts, Collections, Trips, and Photographer content.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/through-my-frames';
  console.log(`\n🌱 [Database Seed Initiated]`);
  console.log(`🔗 Target MongoDB: ${mongoUri}`);

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
    ]);
    console.log(`✓ Collections cleared`);

    // 2. Seed Users
    console.log(`👤 Seeding Users...`);
    const createdUsers = await User.insertMany(initialUsers);
    console.log(`✓ Seeded ${createdUsers.length} Users`);

    // Create a lookup map: lowercase username -> User _id
    const userMap = new Map();
    createdUsers.forEach((u) => {
      userMap.set(u.username.toLowerCase(), u._id);
    });

    const getUserId = (username) => {
      if (!username) return createdUsers[0]._id;
      const key = username.toLowerCase().replace(/[-_\s]/g, '');
      if (key === 'ayushmisra' || key === 'ayushmishra') {
        return userMap.get('ayushmisra') || createdUsers[0]._id;
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

    // 3. Seed Frames and Comments
    console.log(`🖼️  Seeding Frames & Comments...`);
    const frameDocMap = new Map(); // slug/id -> Frame _id
    let totalComments = 0;

    for (const f of initialFrames) {
      const authorId = getUserId(f.author?.username);
      const frameDoc = await Frame.create({
        customId: f.id,
        image: f.image,
        fallbackImage: f.fallbackImage || '/images/placeholder.jpg',
        moment: f.moment,
        mood: f.mood || 'Calm',
        category: f.category || 'Travel',
        location: f.location,
        camera: f.camera || { body: 'Mobile Photography' },
        likes: f.likes || 0,
        aspectRatio: f.aspectRatio || '16/9',
        author: authorId,
        createdAt: safeDate(f.createdAt),
      });

      frameDocMap.set(f.id, frameDoc._id);

      // Seed nested comments if any
      if (Array.isArray(f.comments) && f.comments.length > 0) {
        for (const c of f.comments) {
          const commentAuthorId = getUserId(c.author?.username);
          await Comment.create({
            frame: frameDoc._id,
            author: commentAuthorId,
            content: c.content,
            createdAt: safeDate(c.createdAt),
          });
          totalComments++;
        }
      }
    }
    console.log(`✓ Seeded ${initialFrames.length} Frames`);
    console.log(`✓ Seeded ${totalComments} Comments`);

    // 4. Seed Thoughts
    console.log(`💭 Seeding Thoughts...`);
    const thoughtsToInsert = initialThoughts.map((t) => ({
      customId: t.id,
      text: t.text,
      mood: t.mood || 'Calm',
      background: t.background,
      tags: t.tags || ['Reflections'],
      author: getUserId(t.author?.username),
      createdAt: safeDate(t.createdAt),
    }));
    const createdThoughts = await Thought.insertMany(thoughtsToInsert);
    console.log(`✓ Seeded ${createdThoughts.length} Thoughts`);

    // 5. Seed Collections
    console.log(`📚 Seeding Collections...`);
    for (const col of initialCollections) {
      const authorId = getUserId(col.author?.username);
      const resolvedFrameIds = (col.frameIds || [])
        .map((slug) => frameDocMap.get(slug))
        .filter(Boolean);

      await Collection.create({
        customId: col.id,
        title: col.title,
        description: col.description,
        cover: col.cover,
        fallbackImage: col.fallbackImage || '/images/placeholder.jpg',
        frameIds: col.frameIds || [],
        frames: resolvedFrameIds,
        count: col.frameIds?.length || 0,
        author: authorId,
        curatedAt: safeDate(col.curatedAt),
      });
    }
    console.log(`✓ Seeded ${initialCollections.length} Collections`);

    // 6. Seed Trips
    console.log(`🧭 Seeding Trips / Wander Journeys...`);
    for (const tr of initialTrips) {
      const resolvedFrameIds = (tr.frames || [])
        .map((slug) => frameDocMap.get(slug))
        .filter(Boolean);

      await Trip.create({
        customId: tr.id,
        title: tr.title,
        place: tr.place,
        dates: tr.dates,
        cover: tr.cover,
        fallbackImage: tr.fallbackImage || '/images/placeholder.jpg',
        story: tr.story,
        frameIds: tr.frames || [],
        frames: resolvedFrameIds,
        coordinates: tr.coordinates || { x: 50, y: 50 },
        highlights: tr.highlights || [],
      });
    }
    console.log(`✓ Seeded ${initialTrips.length} Trips`);

    // 7. Seed Photographer Sanctuary (Ayush Misra)
    console.log(`📷 Seeding Photographer Sanctuary...`);
    await Photographer.create({
      ...photographerData,
      portrait: '/images/honey.jpg',
      name: 'Ayush Misra',
    });
    console.log(`✓ Seeded Photographer Sanctuary Profile (Ayush Misra)`);

    console.log(`\n==================================================`);
    console.log(`✨ All Through My Frames 2.0 data successfully seeded!`);
    console.log(`==================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed:`, error);
    process.exit(1);
  }
};

seedDatabase();

