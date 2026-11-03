/**
 * ==============================================================================
 * 404 Not Found Middleware
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * When an incoming request matches none of our defined route paths, Express
 * naturally falls through to this middleware. We emit a clean, predictable 404 JSON
 * response instead of an empty HTML document or dangling connection.
 */

export const notFound = (req, res, next) => {
  const error = new Error(`Resource route not found: [${req.method}] ${req.originalUrl}`);
  res.status(404);
  next(error);
};
