/**
 * NodeForge - Automated Terminal-Based API Test Suite
 * Tests all Express endpoints (port 3000) and Raw HTTP endpoints (port 3001)
 * Run via: npm run test:api
 */

const EXPRESS_URL = 'http://localhost:3000';
const RAW_URL = 'http://localhost:3001';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

async function testExpressServer() {
  console.log('\n\x1b[36m==================================================\x1b[0m');
  console.log('\x1b[36mTesting Express Server Endpoints (Port 3000)\x1b[0m');
  console.log('\x1b[36m==================================================\x1b[0m');

  // Test 1: GET / (Frontend HTML is served)
  try {
    const res = await fetch(`${EXPRESS_URL}/`);
    const text = await res.text();
    assert(res.status === 200, 'GET / returns 200 OK');
    assert(text.includes('NodeForge'), 'GET / HTML contains "NodeForge" branding');
    assert(res.headers.has('x-response-time'), 'GET / contains X-Response-Time timing header');
  } catch (err) {
    assert(false, 'GET / request failed', err.message);
  }

  // Test 2: GET /api/health
  try {
    const res = await fetch(`${EXPRESS_URL}/api/health`);
    const json = await res.json();
    assert(res.status === 200, 'GET /api/health returns 200 OK');
    assert(json.status === 'healthy', 'GET /api/health payload has status="healthy"');
    assert(typeof json.uptimeSeconds === 'number', 'GET /api/health returns valid uptime');
  } catch (err) {
    assert(false, 'GET /api/health failed', err.message);
  }

  // Test 3: GET /api/runtime
  try {
    const res = await fetch(`${EXPRESS_URL}/api/runtime`);
    const json = await res.json();
    assert(res.status === 200, 'GET /api/runtime returns 200 OK');
    assert(json.success === true, 'GET /api/runtime returns success=true');
    assert(Boolean(json.data.version), `Runtime detects Node.js version: ${json.data.version}`);
    assert(Boolean(json.data.platform), `Runtime detects OS platform: ${json.data.platform}`);
    assert(Boolean(json.data.arch), `Runtime detects architecture: ${json.data.arch}`);
    assert(Boolean(json.data.memoryUsageMB.heapUsed), 'Runtime inspects heap memory');
  } catch (err) {
    assert(false, 'GET /api/runtime failed', err.message);
  }

  // Test 4: CommonJS Demo Endpoints: GET /api/demo/hello & GET /api/demo/time
  try {
    const resHello = await fetch(`${EXPRESS_URL}/api/demo/hello?name=Morgan&role=Engineer`);
    const jsonHello = await resHello.json();
    assert(resHello.status === 200, 'GET /api/demo/hello returns 200 OK');
    assert(jsonHello.message.includes('Morgan'), 'Greeting module correctly incorporates query param "name"');
    assert(jsonHello.moduleSource === 'utils/greeting.js', 'Greeting identifies moduleSource');

    const resTime = await fetch(`${EXPRESS_URL}/api/demo/time`);
    const jsonTime = await resTime.json();
    assert(resTime.status === 200, 'GET /api/demo/time returns 200 OK');
    assert(Boolean(jsonTime.iso), 'Server time provides valid ISO format');
  } catch (err) {
    assert(false, 'Demo hello/time failed', err.message);
  }

  // Test 5: CommonJS Math Module: POST /api/demo/math
  try {
    const resMath = await fetch(`${EXPRESS_URL}/api/demo/math`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'multiply', a: 12, b: 5 })
    });
    const jsonMath = await resMath.json();
    assert(resMath.status === 200, 'POST /api/demo/math returns 200 OK');
    assert(jsonMath.result === 60, 'Math module calculation (12 * 5) === 60');

    // Test math error handling (division by zero)
    const resDivZero = await fetch(`${EXPRESS_URL}/api/demo/math`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'divide', a: 10, b: 0 })
    });
    assert(resDivZero.status >= 400, 'POST /api/demo/math with division by zero returns error status');
  } catch (err) {
    assert(false, 'POST /api/demo/math failed', err.message);
  }

  // Test 6: Path Module Demo: POST /api/demo/path
  try {
    const resPath = await fetch(`${EXPRESS_URL}/api/demo/path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segments: ['var', 'log', 'app.log'],
        sampleFile: 'data/notes.json'
      })
    });
    const jsonPath = await resPath.json();
    assert(resPath.status === 200, 'POST /api/demo/path returns 200 OK');
    assert(jsonPath.computed.basename === 'notes.json', 'path.basename extracted correctly');
    assert(jsonPath.computed.extname === '.json', 'path.extname extracted correctly');
    assert(Boolean(jsonPath.computed.resolve), 'path.resolve generated absolute path');
  } catch (err) {
    assert(false, 'POST /api/demo/path failed', err.message);
  }

  // Test 7: Notes CRUD API (fs module demonstration)
  let createdNoteId = null;
  try {
    // 7a: GET /api/notes
    const resNotes = await fetch(`${EXPRESS_URL}/api/notes`);
    const jsonNotes = await resNotes.json();
    assert(resNotes.status === 200, 'GET /api/notes returns 200 OK');
    assert(Array.isArray(jsonNotes.data), 'GET /api/notes returns array of notes');

    // 7b: POST /api/notes (valid note)
    const resCreate = await fetch(`${EXPRESS_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Terminal Test Note',
        content: 'Testing fs.promises asynchronous persistence from automated runner.',
        category: 'Test'
      })
    });
    const jsonCreate = await resCreate.json();
    assert(resCreate.status === 201, 'POST /api/notes creates note with 201 Created');
    assert(jsonCreate.success === true, 'POST /api/notes returns success=true');
    assert(Boolean(jsonCreate.data.id), 'POST /api/notes generated unique note ID');
    createdNoteId = jsonCreate.data.id;

    // 7c: POST /api/notes (invalid - missing title)
    const resInvalid = await fetch(`${EXPRESS_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Only content, missing title' })
    });
    assert(resInvalid.status === 400, 'POST /api/notes rejects missing title with 400 Bad Request');

    // 7d: DELETE /api/notes/:id (valid delete)
    if (createdNoteId) {
      const resDelete = await fetch(`${EXPRESS_URL}/api/notes/${createdNoteId}`, {
        method: 'DELETE'
      });
      const jsonDelete = await resDelete.json();
      assert(resDelete.status === 200, `DELETE /api/notes/${createdNoteId} returns 200 OK`);
      assert(jsonDelete.deletedNote.id === createdNoteId, 'DELETE confirms removed note ID');
    }

    // 7e: DELETE /api/notes/:id (non-existent note ID)
    const resDelete404 = await fetch(`${EXPRESS_URL}/api/notes/non-existent-id-999`, {
      method: 'DELETE'
    });
    assert(resDelete404.status === 404, 'DELETE /api/notes with invalid ID returns 404 Not Found');
  } catch (err) {
    assert(false, 'Notes CRUD test failed', err.message);
  }

  // Test 8: Error-Handling Middleware: GET /api/demo/error
  try {
    const resError = await fetch(`${EXPRESS_URL}/api/demo/error?status=500&msg=Automated+test+simulation`);
    const jsonError = await resError.json();
    assert(resError.status === 500, 'GET /api/demo/error returns 500 Internal Server Error');
    assert(jsonError.error === true, 'Custom error handler formats error=true JSON response');
    assert(jsonError.message.includes('Automated test simulation'), 'Error handler preserves error message');
  } catch (err) {
    assert(false, 'GET /api/demo/error failed', err.message);
  }

  // Test 9: 404 Middleware: Unknown routes
  try {
    const res404 = await fetch(`${EXPRESS_URL}/api/unmapped-route-random`);
    const json404 = await res404.json();
    assert(res404.status === 404, 'Unknown API route returns 404 Not Found');
    assert(json404.error === true, '404 handler returns structured JSON error');
  } catch (err) {
    assert(false, '404 handler failed', err.message);
  }

  // Test 10: Request Counter & Logs Middleware
  try {
    const resCounter = await fetch(`${EXPRESS_URL}/api/requests`);
    const jsonCounter = await resCounter.json();
    assert(resCounter.status === 200, 'GET /api/requests returns 200 OK');
    assert(jsonCounter.data.totalRequests > 0, `Middleware counter recorded ${jsonCounter.data.totalRequests} requests`);

    const resLogs = await fetch(`${EXPRESS_URL}/api/logs`);
    const jsonLogs = await resLogs.json();
    assert(resLogs.status === 200, 'GET /api/logs returns 200 OK');
    assert(Array.isArray(jsonLogs.data), `In-memory logger holds ${jsonLogs.data.length} recent requests`);
  } catch (err) {
    assert(false, 'Middleware observability failed', err.message);
  }
}

async function testRawHttpServer() {
  console.log('\n\x1b[35m==================================================\x1b[0m');
  console.log('\x1b[35mTesting Raw HTTP Server Endpoints (Port 3001)\x1b[0m');
  console.log('\x1b[35m==================================================\x1b[0m');

  // Test 1: GET / (HTML welcome message)
  try {
    const res = await fetch(`${RAW_URL}/`);
    const html = await res.text();
    assert(res.status === 200, 'Raw Server: GET / returns 200 OK');
    assert(html.includes('NodeForge Raw HTTP Server'), 'Raw Server: GET / returns HTML welcome page');
  } catch (err) {
    assert(false, 'Raw Server: GET / failed', err.message);
  }

  // Test 2: GET /api/hello (JSON greeting)
  try {
    const res = await fetch(`${RAW_URL}/api/hello`);
    const json = await res.json();
    assert(res.status === 200, 'Raw Server: GET /api/hello returns 200 OK');
    assert(res.headers.get('content-type').includes('application/json'), 'Raw Server: Sets Content-Type: application/json');
    assert(json.message.includes('Raw HTTP Server'), 'Raw Server: Greeting message verified');
  } catch (err) {
    assert(false, 'Raw Server: GET /api/hello failed', err.message);
  }

  // Test 3: GET /api/time (JSON server time)
  try {
    const res = await fetch(`${RAW_URL}/api/time`);
    const json = await res.json();
    assert(res.status === 200, 'Raw Server: GET /api/time returns 200 OK');
    assert(Boolean(json.serverTime), 'Raw Server: serverTime returned');
  } catch (err) {
    assert(false, 'Raw Server: GET /api/time failed', err.message);
  }

  // Test 4: GET /api/status (JSON server status & Node runtime)
  try {
    const res = await fetch(`${RAW_URL}/api/status`);
    const json = await res.json();
    assert(res.status === 200, 'Raw Server: GET /api/status returns 200 OK');
    assert(json.status === 'active', 'Raw Server: status="active"');
    assert(Boolean(json.nodeVersion), `Raw Server: reports Node version ${json.nodeVersion}`);
  } catch (err) {
    assert(false, 'Raw Server: GET /api/status failed', err.message);
  }

  // Test 5: GET /api/unsupported (Proper 404 handling)
  try {
    const res = await fetch(`${RAW_URL}/api/unsupported-route`);
    const json = await res.json();
    assert(res.status === 404, 'Raw Server: Unknown route returns 404 Not Found');
    assert(json.error === true, 'Raw Server: 404 response is formatted as JSON');
  } catch (err) {
    assert(false, 'Raw Server: 404 handling failed', err.message);
  }
}

async function run() {
  console.log('\x1b[1m🚀 Starting NodeForge Automated Test Suite...\x1b[0m');
  try {
    await testExpressServer();
    await testRawHttpServer();
  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n\x1b[1m==================================================\x1b[0m');
  console.log(`\x1b[1mTest Results: \x1b[32m${passedTests} Passed\x1b[0m, \x1b[31m${failedTests} Failed\x1b[0m`);
  console.log('\x1b[1m==================================================\x1b[0m');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
