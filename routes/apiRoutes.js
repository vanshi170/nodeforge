/**
 * NodeForge - API Routes
 * Mounts all Express endpoints for runtime, notes, demos, metrics, and logs
 */

const express = require('express');
const router = express.Router();

const notesController = require('../controllers/notesController');
const runtimeController = require('../controllers/runtimeController');
const demoController = require('../controllers/demoController');
const { getRequestStats } = require('../middleware/requestCounter');
const { getRecentLogs } = require('../middleware/logger');

// Health & System Information
router.get('/health', demoController.getHealth);
router.get('/runtime', runtimeController.getRuntimeInfo);

// Notes API (fs module demonstration)
router.get('/notes', notesController.getAllNotes);
router.post('/notes', notesController.createNote);
router.delete('/notes/:id', notesController.deleteNote);

// Demos (CommonJS modules, error handling, path module)
router.get('/demo/hello', demoController.getHello);
router.get('/demo/time', demoController.getTime);
router.get('/demo/error', demoController.triggerError);
router.post('/demo/math', demoController.calculateMath);
router.post('/demo/path', demoController.inspectPath);

// Middleware Observability
router.get('/requests', (req, res) => {
  res.json({
    success: true,
    data: getRequestStats()
  });
});

router.get('/logs', (req, res) => {
  res.json({
    success: true,
    data: getRecentLogs()
  });
});

module.exports = router;
