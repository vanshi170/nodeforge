/**
 * NodeForge - Request Counter Middleware
 * Tracks incoming requests, method distribution, and HTTP status codes
 */

const startedAt = new Date();

const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  clientErrors: 0,
  serverErrors: 0,
  byMethod: {
    GET: 0,
    POST: 0,
    DELETE: 0,
    PUT: 0,
    OPTIONS: 0,
    OTHER: 0
  }
};

function requestCounter(req, res, next) {
  stats.totalRequests++;

  const method = req.method.toUpperCase();
  if (stats.byMethod[method] !== undefined) {
    stats.byMethod[method]++;
  } else {
    stats.byMethod.OTHER++;
  }

  res.on('finish', () => {
    const code = res.statusCode;
    if (code >= 200 && code < 400) {
      stats.successfulRequests++;
    } else if (code >= 400 && code < 500) {
      stats.clientErrors++;
    } else if (code >= 500) {
      stats.serverErrors++;
    }
  });

  next();
}

function getRequestStats() {
  const uptimeSeconds = Math.floor(process.uptime());
  return {
    ...stats,
    startedAt: startedAt.toISOString(),
    uptimeSeconds,
    pid: process.pid
  };
}

module.exports = {
  requestCounter,
  getRequestStats
};
