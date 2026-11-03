import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths for bulletproof .env loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
// Also fallback to root .env if present
dotenv.config();

// Database connection
import { connectDB } from './config/db.js';

// Route handlers
import healthRoutes from './routes/healthRoutes.js';
import frameRoutes from './routes/frameRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import thoughtRoutes from './routes/thoughtRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import userRoutes from './routes/userRoutes.js';
import photographerRoutes from './routes/photographerRoutes.js';

// Middlewares
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

/**
 * ==============================================================================
 * Express Server Entry Point (Phase 2)
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Initializes the HTTP server, mounts security & parsing middleware, binds API
 * routes under /api, and starts listening for client requests.
 */

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS (Cross-Origin Resource Sharing)
// Allows our React frontend (http://localhost:5173) to communicate with this API
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      const allowed = [
        CLIENT_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
      ];
      if (allowed.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. HTTP Request Logger (active in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 5. Welcome & Documentation Route
app.get('/', (req, res) => {
  res.json({
    name: 'Through My Frames 2.0 API',
    version: '2.0.0',
    curator: 'Ayush Misra',
    tagline: 'Photos. Places. Thoughts.',
    endpoints: {
      health: '/api/health',
      frames: '/api/frames',
      thoughts: '/api/thoughts',
      collections: '/api/collections',
      trips: '/api/trips',
      users: '/api/users/:username',
      photographer: '/api/photographer',
    },
  });
});

// 6. Mount REST API Routes
app.use('/api/health', healthRoutes);
app.use('/api/frames', frameRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/thoughts', thoughtRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/photographer', photographerRoutes);

// 7. Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// 8. Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`✨ [Through My Frames 2.0 Backend Online]`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed Client: ${CLIENT_URL}`);
  console.log(`==================================================\n`);
});

// Handle unhandled Promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection: ${err.message}`);
  // Keep server alive in dev, close gracefully in prod
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});
