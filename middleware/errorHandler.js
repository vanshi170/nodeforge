/**
 * NodeForge - Global Error Handler Middleware
 * Express recognizes error-handling middleware by its 4 arguments: (err, req, res, next)
 */

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = Number(err.status || err.statusCode || 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR HANDLER] Captured ${status} error on ${req.method} ${req.originalUrl}:`, message);

  res.status(status).json({
    error: true,
    status,
    message,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
