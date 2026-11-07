import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Authentication Controller
 * ==============================================================================
 * WHY CONTROLLERS STRUCTURE AUTH THIS WAY:
 * 1. Password Hashing (bcrypt): We NEVER store plain text passwords. bcrypt uses a
 *    one-way cryptographic hash with an intentional computational cost (work factor 10)
 *    and automatic salting to thwart rainbow table attacks.
 * 2. Generic Error Messages: When login fails, whether because the username does not exist
 *    or the password was incorrect, we ALWAYS return the identical "Invalid credentials" error.
 *    WHY: Revealing "User does not exist" vs "Incorrect password" allows malicious actors
 *    to enumerate and harvest valid user accounts.
 * 3. Hashed Password Seclusion: The `passwordHash` is excluded from all user objects
 *    sent back to the client.
 */

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/signup
 * @access  Public (Rate-limited)
 */
export const signup = async (req, res, next) => {
  try {
    // SECURITY: Users can NEVER assign their own role. Prevent privilege escalation.
    delete req.body.role;

    const { name, username, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return sendError(res, 'All registration fields must be valid text strings', 400);
    }

    // Normalize inputs
    const normalizedUsername = (username || '').trim().toLowerCase();
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check if username already taken
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return sendError(res, 'Username is already taken by another wanderer', 400);
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return sendError(res, 'An account with this email address already exists', 400);
    }

    // Hash the password with bcrypt (cost 10)
    // WHY: Cost factor 10 balances security and server performance.
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the user in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      avatar: '/images/honey.jpg',
      cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    });

    // Generate JWT token
    const token = signToken(newUser._id);

    // Prepare clean user payload (passwordHash is automatically stripped via User toJSON)
    const userPayload = newUser.toJSON();

    return sendSuccess(
      res,
      { user: userPayload, token },
      'Account created successfully. Welcome to Through My Frames!',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user and return JWT token
 * @route   POST /api/auth/login
 * @access  Public (Rate-limited)
 */
export const login = async (req, res, next) => {
  try {
    const { identifier, email, username, password } = req.body;

    const rawId = identifier || email || username;
    if (typeof rawId !== 'string' || typeof password !== 'string') {
      return sendError(res, 'Credentials must be valid text strings', 400);
    }

    const loginIdentifier = rawId.trim().toLowerCase();

    if (!loginIdentifier || !password) {
      return sendError(res, 'Please provide your email/username and password', 400);
    }

    // Find user by either email or username
    // Note: We explicitly include `+passwordHash` because it is marked with `select: false` in schema
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
    }).select('+passwordHash');

    // Generic error message for both non-existent user and wrong password
    const genericErrorMessage = 'Invalid credentials. Please verify your login details.';

    if (!user) {
      return sendError(res, genericErrorMessage, 401);
    }

    // Verify password against stored hash using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, genericErrorMessage, 401);
    }

    // Sign fresh JWT
    const token = signToken(user._id);

    // Clean user payload
    const userPayload = user.toJSON();

    return sendSuccess(
      res,
      { user: userPayload, token },
      `Welcome back, ${user.name}!`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user details
 * @route   GET /api/auth/me
 * @access  Private (Requires valid JWT)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by the `protect` middleware
    return sendSuccess(res, { user: req.user.toJSON() }, 'Current user profile retrieved');
  } catch (error) {
    next(error);
  }
};
