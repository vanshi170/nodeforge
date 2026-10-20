/**
 * NodeForge - Raw HTTP Server (Built-in 'http' module only)
 * Demonstrates low-level HTTP server creation without any external framework.
 * Explains http.createServer(), req (IncomingMessage), res (ServerResponse),
 * manual routing, header management, and status codes.
 */

require('dotenv').config();
const http = require('http');

const RAW_PORT = process.env.RAW_PORT || 3001;
const serverStartTime = new Date();

/**
 * Helper to set standard CORS headers to allow requests from the dashboard
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Helper to send JSON responses
 */
function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js Raw HTTP Engine'
  });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Request handler function passed to http.createServer()
 */
const server = http.createServer((req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  console.log(`[RAW-HTTP] ${method} ${pathname} from ${req.socket.remoteAddress}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // Only handle GET requests for these demonstration endpoints
  if (method !== 'GET') {
    return sendJson(res, 405, {
      error: true,
      status: 405,
      message: `Method ${method} Not Allowed on raw HTTP demonstration server`
    });
  }

  // Route: GET /
  if (pathname === '/') {
    setCorsHeaders(res);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Node.js Raw HTTP Engine'
    });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>NodeForge Raw HTTP Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; background: #f8fafc; color: #1e293b; }
          .badge { display: inline-block; padding: 4px 10px; background: #6366f1; color: white; border-radius: 9999px; font-size: 12px; font-weight: bold; }
          code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <span class="badge">Raw HTTP Server</span>
        <h1>Welcome to NodeForge Raw HTTP Server</h1>
        <p>This server is built using <strong>only</strong> Node's built-in <code>http</code> module with no Express framework!</p>
        <h3>Available Endpoints:</h3>
        <ul>
          <li><code>GET /</code> - This HTML welcome message</li>
          <li><code>GET /api/hello</code> - Greeting JSON</li>
          <li><code>GET /api/time</code> - Server time JSON</li>
          <li><code>GET /api/status</code> - Server status & Node runtime details JSON</li>
        </ul>
        <p>Running on port <strong>${RAW_PORT}</strong>.</p>
      </body>
      </html>
    `.trim());
    return;
  }

  // Route: GET /api/hello
  if (pathname === '/api/hello') {
    return sendJson(res, 200, {
      message: 'Hello from Node.js Raw HTTP Server!',
      framework: 'None (Built-in http module)',
      implementation: 'http.createServer()',
      timestamp: new Date().toISOString()
    });
  }

  // Route: GET /api/time
  if (pathname === '/api/time') {
    const now = new Date();
    return sendJson(res, 200, {
      serverTime: now.toISOString(),
      localeTime: now.toLocaleTimeString(),
      epochMs: now.getTime(),
      uptimeSeconds: Math.floor(process.uptime())
    });
  }

  // Route: GET /api/status
  if (pathname === '/api/status') {
    return sendJson(res, 200, {
      status: 'active',
      serverType: 'Raw Node.js http.Server',
      port: Number(RAW_PORT),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      processUptimeSeconds: Math.floor(process.uptime()),
      startedAt: serverStartTime.toISOString()
    });
  }

  // Route: 404 for any unsupported route
  return sendJson(res, 404, {
    error: true,
    status: 404,
    message: `Cannot ${method} ${pathname} - Route not found on Raw HTTP Server`,
    timestamp: new Date().toISOString()
  });
});

// Start listening if run directly
if (require.main === module) {
  server.listen(RAW_PORT, () => {
    console.log('='.repeat(60));
    console.log(`⚡ NodeForge Raw HTTP Server is running on port ${RAW_PORT}`);
    console.log(`📍 Local URL:    http://localhost:${RAW_PORT}`);
    console.log(`📡 Endpoints:    GET /, GET /api/hello, GET /api/time, GET /api/status`);
    console.log(`🔧 Framework:    None (Node.js http module)`);
    console.log('='.repeat(60));
  });

  const shutdown = (signal) => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Closing Raw HTTP server...`);
    server.close(() => {
      console.log('[SHUTDOWN] Raw HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = server;
