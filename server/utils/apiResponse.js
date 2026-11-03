/**
 * ==============================================================================
 * API Response Helper Utilities
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Ensures every single endpoint in Through My Frames returns a uniform JSON envelope:
 * {
 *   success: true | false,
 *   message?: '...',
 *   data: ...,
 *   meta?: { page, total, ... }
 * }
 * Consistency in the backend response structure makes frontend consuming logic
 * extremely predictable and simple to parse.
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = undefined) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 400, errors = undefined) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
