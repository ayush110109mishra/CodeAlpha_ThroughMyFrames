import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

/**
 * ==============================================================================
 * Authentication Routes
 * ==============================================================================
 * Handles user onboarding, session generation, and token validation.
 * Rate limiting is enforced on login and signup to mitigate brute force attempts.
 * Strict type checking ensures inputs are primitive strings (NoSQL injection defense).
 */

const router = express.Router();

const signupValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('Username must be between 2 and 30 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain alphanumeric characters, dots, and underscores'),
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const loginValidation = [
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .notEmpty()
    .withMessage('Password is required'),
  body('identifier')
    .optional()
    .isString()
    .withMessage('Identifier must be a string'),
  body('email')
    .optional()
    .isString()
    .withMessage('Email must be a string'),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string'),
];

// Public, rate-limited auth endpoints
router.post('/signup', authLimiter, validate(signupValidation), signup);
router.post('/login', authLimiter, validate(loginValidation), login);

// Protected user identity checkpoint
router.get('/me', protect, getMe);

export default router;
