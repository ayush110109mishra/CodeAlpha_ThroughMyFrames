import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths for bulletproof .env loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
// Also fallback to root .env if present
dotenv.config();

// Fail-fast environment validation
import { validateEnv } from './config/validateEnv.js';
validateEnv();

// Database connection
import { connectDB } from './config/db.js';

// Route handlers
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import frameRoutes from './routes/frameRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import thoughtRoutes from './routes/thoughtRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import userRoutes from './routes/userRoutes.js';
import photographerRoutes from './routes/photographerRoutes.js';
import momentRoutes from './routes/momentRoutes.js';

// Middlewares
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

/**
 * ==============================================================================
 * Express Server Entry Point (Phase 4: Production Hardened)
 * ==============================================================================
 * WHY THESE SECURITY LAYERS EXIST:
 * 1. trust proxy: Enables Express to correctly identify client IP behind reverse
 *    proxies (Render, Heroku, Cloudflare) so rate-limiting functions accurately.
 * 2. helmet CSP: Whitelists Cloudinary CDN for photography assets while blocking
 *    cross-site scripting (XSS) injection vectors.
 * 3. compression: Gzips JSON responses and text streams to lower network egress.
 * 4. generalLimiter: Protects all /api endpoints against automated DoS spikes.
 */

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Trust Reverse Proxy (Render / Vercel / Cloudflare)
app.set('trust proxy', 1);

// 2. Security Headers via Helmet (with Cloudinary & Unsplash Content Security Policy)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://images.unsplash.com',
          'https://*.unsplash.com',
        ],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 3. CORS (Cross-Origin Resource Sharing)
// Supports comma-separated origins (e.g. production domain + Vercel preview deploys)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .concat(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173']);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
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

// 4. Response Compression (Gzip / Deflate)
app.use(compression());

// 5. General API Rate Limiter
app.use('/api', generalLimiter);

// 6. Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. HTTP Request Logger (active in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 8. Welcome & Documentation Route
app.get('/', (req, res) => {
  res.json({
    name: 'Through My Frames 2.0 API',
    version: '2.0.0',
    curator: 'Ayush Mishra',
    tagline: 'Photos. Places. Thoughts.',
    endpoints: {
      health: '/api/health',
      frames: '/api/frames',
      thoughts: '/api/thoughts',
      collections: '/api/collections',
      trips: '/api/trips',
      users: '/api/users/:username',
      photographer: '/api/photographer',
      moment: '/api/moment/today',
    },
  });
});

// 9. Mount REST API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/frames', frameRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/thoughts', thoughtRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/photographer', photographerRoutes);
app.use('/api/moment', momentRoutes);

// 10. Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// 11. Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`✨ [Through My Frames 2.0 Backend Online]`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log(`==================================================\n`);
});

// Handle unhandled Promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});
