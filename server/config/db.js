import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Database Connection Module (Mongoose + MongoDB)
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Mongoose acts as an Object Data Modeling (ODM) library for MongoDB.
 * Instead of raw queries, Mongoose lets us define Schemas with validations,
 * types, relationships (populate), and lifecycle hooks.
 *
 * Centralizing the connection logic in config/db.js ensures:
 * 1. Single source of truth for database lifecycle management.
 * 2. Clean separation of concerns (server.js does not need raw connection details).
 * 3. Graceful error handling and retry logging.
 */

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/through-my-frames';
  try {
    const conn = await mongoose.connect(uri, {
      // Modern Mongoose v8 defaults are used.
      // Auto-reconnect and index creation are enabled by default.
    });

    console.log(`🌿 [MongoDB Connected]: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    console.warn(`💡 Tip: If using MongoDB Atlas, check IP Whitelist & credentials in server/.env.`);
    console.warn(`💡 Tip: If running locally, ensure mongod service is running on 127.0.0.1:27017.`);
    // In dev mode, we log but don't forcibly kill so the developer can see server startup errors clearly.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
