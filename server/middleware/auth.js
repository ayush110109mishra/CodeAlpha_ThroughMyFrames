import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Authentication & Authorization Middlewares
 * ==============================================================================
 * WHY THESE EXIST:
 * 1. HTTP is stateless. The server has no memory of previous requests.
 * 2. `protect` acts as a security checkpoint for private endpoints (e.g., creating frames).
 * 3. `optionalAuth` checks for credentials without blocking anonymous readers,
 *    enabling personalized state (like `likedByMe`) when logged in.
 * 4. `restrictTo` enforces Role-Based Access Control (RBAC) so regular users
 *    cannot perform administrative actions.
 */

/**
 * Middleware: protect
 * Requires a valid Bearer JWT. Rejects unauthorized requests with 401.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // STEP 1: Extract Bearer token from the standard Authorization header.
    // WHY: Using the Authorization header avoids CSRF vulnerabilities inherent to ambient cookies
    // without requiring complex CSRF tokens.
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(
        res,
        'Authentication required. Please log in to perform this action.',
        401
      );
    }

    // STEP 2: Cryptographically verify the token using JWT_SECRET.
    // WHY: Ensures the token was genuinely signed by our backend and has not been tampered with or expired.
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Your session has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authorization token. Please log in again.', 401);
    }

    // STEP 3: Check if the user still exists in the database.
    // WHY: A user might have been deleted or banned after their token was issued.
    // Checking the database prevents deleted users from continuing to make requests.
    const currentUser = await User.findById(decoded.id).select('+role');
    if (!currentUser) {
      return sendError(
        res,
        'The account associated with this token no longer exists.',
        401
      );
    }

    // STEP 4: Attach the verified user document to the Express request object.
    // WHY: Downstream route handlers and controllers can now access `req.user`
    // safely without having to re-fetch the user or trust client-provided IDs.
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: optionalAuth
 * Inspects Authorization header if present. If valid, attaches `req.user`.
 * If missing or invalid, does NOT reject the request; simply continues as anonymous.
 * WHY: Enables public browsing (e.g. GET /api/frames) while allowing the server to
 * personalize the response (e.g., setting `likedByMe: true`) for logged-in users.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      } catch {
        // If token is expired or invalid in optional mode, ignore and proceed as guest
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: restrictTo
 * RBAC authorization gate. Requires `protect` to have already run.
 * WHY: Prevents privilege escalation. Even if a user has a valid login token,
 * they cannot access admin-only routes unless their role matches.
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        'Forbidden: You do not have permission to perform this action.',
        403
      );
    }
    next();
  };
};
