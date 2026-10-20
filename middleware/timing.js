/**
 * NodeForge - API Timing Middleware
 * Measures the exact response duration in milliseconds and adds X-Response-Time header
 */

function apiTiming(req, res, next) {
  const startHrTime = process.hrtime();

  // Helper method for other middlewares to read elapsed duration
  req.getDurationMs = function () {
    const diff = process.hrtime(startHrTime);
    return Number(((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2));
  };

  // Intercept writeHead / send to append the custom header
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    const durationMs = req.getDurationMs();
    res.setHeader('X-Response-Time', `${durationMs}ms`);
    return originalWriteHead.apply(res, args);
  };

  next();
}

module.exports = apiTiming;
