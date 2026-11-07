import jwt from 'jsonwebtoken';

/**
 * ==============================================================================
 * JWT (JSON Web Token) Utility
 * ==============================================================================
 * WHY JWT:
 * In a stateless REST architecture, the server does not store session cookies in memory
 * or a centralized session store (e.g. Redis). Instead, upon successful authentication,
 * the server cryptographically signs a compact JSON payload using a private secret (`JWT_SECRET`).
 *
 * Each subsequent request passes this signed token in the `Authorization: Bearer <token>` header.
 * The server verifies the cryptographic signature: if an attacker modifies the payload (like changing
 * their user ID to admin), the signature becomes invalid and the request is immediately rejected.
 */

export const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
