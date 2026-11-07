import rateLimit from 'express-rate-limit';

/**
 * ==============================================================================
 * Rate Limiter Middleware
 * ==============================================================================
 * WHY RATE LIMITING EXISTS:
 * Protects APIs against automated credential-stuffing, DoS flooding, scrapers,
 * and spam injection.
 */

// 1. General API Limiter: 250 requests per 15 min per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please slow down and try again shortly.',
  },
});

// 2. Authentication Limiter: 10 attempts per 15 min per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please wait 15 minutes before trying again.',
  },
});

// 3. Media Upload Limiter: 20 uploads per 15 min per IP
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. Please wait 15 minutes before uploading more photographs.',
  },
});

// 4. Contact / Inquiry Limiter: 5 submissions per 15 min per IP
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have sent several letters recently. Please wait 15 minutes before submitting another note.',
  },
});

// 5. Comment / Reflection Limiter: 30 reflections per 15 min per IP
export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Reflection posting limit reached. Please pause a moment before sharing more thoughts.',
  },
});
