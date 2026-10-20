/**
 * NodeForge - Main Express Application Server
 * Demonstrates Express routing, custom and built-in middleware,
 * static asset serving, and global error handling.
 */

require('dotenv').config();
const path = require('path');
const express = require('express');

// Custom middlewares
const cors = require('./middleware/cors');
const apiTiming = require('./middleware/timing');
const { requestLogger } = require('./middleware/logger');
const { requestCounter } = require('./middleware/requestCounter');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Routes
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Timing middleware (measures execution duration and adds X-Response-Time)
app.use(apiTiming);

// 2. CORS middleware (allows cross-origin requests for multi-port testing)
app.use(cors);

// 3. Request Logger (logs requests and saves to in-memory buffer)
app.use(requestLogger);

// 4. Request Counter (tracks request volume and method distribution)
app.use(requestCounter);

// 5. Body Parsing Middlewares (built-in Express middlewares)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 7. Mount API routes
app.use('/api', apiRoutes);

// 8. 404 Handler for unmatched routes
app.use(notFound);

// 9. Global Error-handling middleware (must be last)
app.use(errorHandler);

// Start listening if run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 NodeForge Express Server is running on port ${PORT}`);
    console.log(`📍 Local URL:     http://localhost:${PORT}`);
    console.log(`📡 API Base URL:  http://localhost:${PORT}/api`);
    console.log(`🔧 Environment:   ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Node.js:       ${process.version} (${process.platform} ${process.arch})`);
    console.log('='.repeat(60));
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Closing Express server gracefully...`);
    server.close(() => {
      console.log('[SHUTDOWN] Express server closed successfully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
