/**
 * NodeForge - Request Logger Middleware
 * Logs incoming HTTP requests and keeps an in-memory ring buffer of recent logs
 */

const MAX_LOGS = 50;
const inMemoryLogs = [];

function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  // Listen for the finish event on the response object
  res.on('finish', () => {
    const statusCode = res.statusCode;
    const duration = typeof req.getDurationMs === 'function' ? req.getDurationMs() : 0;

    const logEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp,
      method,
      url,
      statusCode,
      durationMs: duration,
      ip
    };

    // Keep ring buffer capped at MAX_LOGS
    inMemoryLogs.unshift(logEntry);
    if (inMemoryLogs.length > MAX_LOGS) {
      inMemoryLogs.pop();
    }

    // Terminal log line
    const statusSign = statusCode >= 400 ? '✖' : '✔';
    console.log(
      `[LOGGER] ${statusSign} ${method} ${url} -> ${statusCode} (${duration}ms) @ ${timestamp}`
    );
  });

  next();
}

function getRecentLogs() {
  return [...inMemoryLogs];
}

function clearLogs() {
  inMemoryLogs.length = 0;
}

module.exports = {
  requestLogger,
  getRecentLogs,
  clearLogs
};
