/**
 * NodeForge - Demo Controller
 * Demonstrates CommonJS module consumption (greeting, math), path inspection,
 * intentional error throwing, and time formatting.
 */

const path = require('path');
const greeting = require('../utils/greeting');
const math = require('../utils/math');

function getHealth(req, res) {
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'NodeForge Express Engine',
    port: process.env.PORT || 3000
  });
}

function getHello(req, res) {
  const name = req.query.name || 'Student';
  const role = req.query.role || 'Full Stack Learner';
  const message = greeting.createGreeting(name, role);
  const timeGreeting = greeting.getTimeBasedGreeting();

  res.json({
    success: true,
    salutation: timeGreeting,
    message,
    moduleSource: 'utils/greeting.js',
    queryReceived: { name, role }
  });
}

function getTime(req, res) {
  const now = new Date();
  res.json({
    success: true,
    iso: now.toISOString(),
    utcString: now.toUTCString(),
    localTime: now.toLocaleTimeString(),
    epochMs: now.getTime(),
    timezoneOffsetMinutes: now.getTimezoneOffset()
  });
}

function triggerError(req, res, next) {
  const customMessage = req.query.msg || 'Simulated demonstration error from /api/demo/error';
  const statusCode = parseInt(req.query.status, 10) || 500;

  const error = new Error(customMessage);
  error.status = statusCode;

  // Passing error to next(err) invokes Express's 4-argument error handler
  next(error);
}

function calculateMath(req, res, next) {
  try {
    const { operation, a, b, n, numbers } = req.body || {};

    let result;
    let description;

    switch (operation) {
      case 'add':
        result = math.add(a, b);
        description = `${a} + ${b} = ${result}`;
        break;
      case 'subtract':
        result = math.subtract(a, b);
        description = `${a} - ${b} = ${result}`;
        break;
      case 'multiply':
        result = math.multiply(a, b);
        description = `${a} × ${b} = ${result}`;
        break;
      case 'divide':
        result = math.divide(a, b);
        description = `${a} ÷ ${b} = ${result}`;
        break;
      case 'factorial':
        result = math.factorial(n);
        description = `${n}! = ${result}`;
        break;
      case 'power':
        result = math.power(a, b);
        description = `${a} ^ ${b} = ${result}`;
        break;
      case 'stats':
        result = math.stats(numbers);
        description = `Statistical summary of [${numbers.join(', ')}]`;
        break;
      default:
        return res.status(400).json({
          error: true,
          status: 400,
          message: `Unknown or missing operation '${operation}'. Supported: add, subtract, multiply, divide, factorial, power, stats`
        });
    }

    res.json({
      success: true,
      operation,
      result,
      description,
      moduleSource: 'utils/math.js'
    });
  } catch (err) {
    next(err);
  }
}

function inspectPath(req, res) {
  const { segments = ['projects', 'nodeforge', 'src', 'index.js'], sampleFile = 'server.config.js' } = req.body || {};

  // Clean strings
  const cleanSegments = Array.isArray(segments)
    ? segments.map(s => String(s).replace(/[<>:"|?*]/g, ''))
    : ['projects', 'nodeforge', 'src', 'index.js'];

  const cleanFile = String(sampleFile).replace(/[<>:"|?*]/g, '') || 'server.config.js';

  // Safe path operations - purely computing paths, not reading unrestricted files
  const joinedPath = path.join(...cleanSegments);
  const resolvedPath = path.resolve(cleanFile);
  const basename = path.basename(cleanFile);
  const extname = path.extname(cleanFile);
  const dirname = path.dirname(joinedPath);
  const isAbsolute = path.isAbsolute(cleanFile);

  res.json({
    success: true,
    platform: process.platform,
    separator: path.sep,
    delimiter: path.delimiter,
    inputSegments: cleanSegments,
    sampleFile: cleanFile,
    computed: {
      join: joinedPath,
      resolve: resolvedPath,
      basename,
      extname,
      dirname,
      isAbsolute
    },
    educationalNotes: {
      joinNote: 'path.join() concatenates path segments using the host platform separator (\\ on Windows, / on Linux/macOS).',
      resolveNote: 'path.resolve() creates an absolute path from right to left using process.cwd() as base.',
      basenameNote: 'path.basename() extracts the final portion of a path, useful for file names.',
      extnameNote: 'path.extname() extracts the file extension from the last dot (.) to the end.'
    }
  });
}

module.exports = {
  getHealth,
  getHello,
  getTime,
  triggerError,
  calculateMath,
  inspectPath
};
