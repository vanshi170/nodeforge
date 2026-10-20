/**
 * NodeForge - Notes Controller
 * Demonstrates the built-in 'fs' module with asynchronous fs.promises operations
 * and safe cross-platform path resolution using the 'path' module.
 */

const fs = require('fs').promises;
const path = require('path');

// Safe, deterministic file path inside the project
const DATA_DIR = path.join(__dirname, '..', 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

/**
 * Ensures data directory and notes.json exist
 */
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(NOTES_FILE);
    } catch {
      // File does not exist, create initial file
      const initialNotes = [
        {
          id: 'note-1',
          title: 'Understanding the Node.js Event Loop',
          content: 'Node.js uses a single-threaded event loop with non-blocking I/O to handle thousands of concurrent connections efficiently.',
          category: 'Architecture',
          createdAt: new Date().toISOString()
        },
        {
          id: 'note-2',
          title: 'CommonJS require() and module.exports',
          content: 'CommonJS is Node\'s original module format. Modules are evaluated synchronously on first require and cached.',
          category: 'Modules',
          createdAt: new Date().toISOString()
        }
      ];
      await fs.writeFile(NOTES_FILE, JSON.stringify(initialNotes, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[NOTES CONTROLLER] Failed to ensure data file:', err);
    throw err;
  }
}

/**
 * Reads notes from notes.json
 */
async function readNotes() {
  await ensureDataFile();
  const rawData = await fs.readFile(NOTES_FILE, 'utf8');
  try {
    return JSON.parse(rawData);
  } catch {
    return [];
  }
}

/**
 * Writes notes to notes.json
 */
async function writeNotes(notes) {
  await ensureDataFile();
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf8');
}

/**
 * GET /api/notes
 */
async function getAllNotes(req, res, next) {
  try {
    const notes = await readNotes();
    res.json({
      success: true,
      count: notes.length,
      data: notes,
      storageMethod: 'fs.promises (asynchronous file I/O)',
      filePath: 'data/notes.json'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/notes
 */
async function createNote(req, res, next) {
  try {
    const { title, content, category } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: 'Validation Error: "title" is required and must be a non-empty string.'
      });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: 'Validation Error: "content" is required and must be a non-empty string.'
      });
    }

    const notes = await readNotes();

    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      content: content.trim(),
      category: (category && String(category).trim()) || 'General',
      createdAt: new Date().toISOString()
    };

    notes.unshift(newNote);
    await writeNotes(notes);

    res.status(201).json({
      success: true,
      message: 'Note created successfully via fs.promises.writeFile',
      data: newNote
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notes/:id
 */
async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: 'Validation Error: Note ID is required in URL parameter.'
      });
    }

    const notes = await readNotes();
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      return res.status(404).json({
        error: true,
        status: 404,
        message: `Note with ID '${id}' was not found.`
      });
    }

    const [deletedNote] = notes.splice(noteIndex, 1);
    await writeNotes(notes);

    res.json({
      success: true,
      message: 'Note deleted successfully from data/notes.json',
      deletedNote
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllNotes,
  createNote,
  deleteNote
};
