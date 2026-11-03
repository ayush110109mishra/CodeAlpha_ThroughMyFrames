/**
 * ==============================================================================
 * Central Error Handler Middleware
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * In Express, passing an argument to `next(err)` triggers error middleware.
 * Centralizing error handling here ensures:
 * 1. Consistent JSON error envelopes: `{ success: false, message: '...' }`.
 * 2. Mongoose-specific errors (CastError, ValidationError, Duplicate Key 11000)
 *    are translated into clean, human-readable HTTP 400 messages.
 * 3. In development, stack traces are sent for easy debugging; in production,
 *    sensitive stack details are hidden.
 * 4. The server NEVER crashes due to an unhandled controller exception.
 */

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with identifier: ${err.value}`;
  }

  // 2. Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for '${field}'. Please use another value.`;
  }

  // 3. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

