/**
 * NodeForge - 404 Not Found Middleware
 * Handles all requests that do not match any defined routes
 */

function notFound(req, res, next) {
  res.status(404).json({
    error: true,
    status: 404,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found on NodeForge server`,
    timestamp: new Date().toISOString()
  });
}

module.exports = notFound;
