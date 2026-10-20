# NodeForge — Node.js & Express Learning Playground

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Architecture](https://img.shields.io/badge/Modules-CommonJS-4f46e5)](https://nodejs.org/docs/latest/api/modules.html)

**NodeForge** is a fully functional, beginner-friendly educational playground designed for computer science engineering students (Semester 3 / Week 15–16). It demonstrates how Node.js executes server-side JavaScript through Google's V8 engine, harnesses core built-in system modules (`fs`, `path`, `process`), implements low-level HTTP servers using the native `http` module, and builds robust web APIs using **Express.js** routing and middleware.

---

## 📑 Table of Contents

1. [Syllabus Mapping (Week 15–16)](#-syllabus-mapping-week-1516)
2. [Project Architecture & Structure](#-project-architecture--structure)
3. [Installation & Setup](#-installation--setup)
4. [Running the Application](#-running-the-application)
5. [API Reference & curl Examples](#-api-reference--curl-examples)
6. [Interactive Learning Sections](#-interactive-learning-sections)
7. [Automated Terminal Testing](#-automated-terminal-testing)
8. [Viva Examination Guide](#-viva-examination-guide)

---

## 🎓 Syllabus Mapping (Week 15–16)

| Week / Topic | Syllabus Concept | Implementation in NodeForge | Primary Files |
| :--- | :--- | :--- | :--- |
| **Week 15.1** | Node.js Runtime & V8 Engine | Genuine system metrics inspection via global `process` object | `controllers/runtimeController.js`, `public/js/app.js` |
| **Week 15.2** | CommonJS Module System | Reusable encapsulated logic using `require()` and `module.exports` | `utils/greeting.js`, `utils/math.js` |
| **Week 15.3** | Built-in Core Modules: `fs` | Asynchronous file persistence with `fs.promises` (CRUD Notes) | `controllers/notesController.js`, `data/notes.json` |
| **Week 15.4** | Built-in Core Modules: `path` | Cross-platform path normalization (`join`, `resolve`, `basename`, `extname`) | `controllers/demoController.js` |
| **Week 15.5** | Built-in Core Modules: `process` | Uptime, PID, memory, and environment variables via `dotenv` | `controllers/runtimeController.js`, `.env` |
| **Week 16.1** | Raw HTTP Server (`http` module) | Low-level server using `http.createServer()`, manual routing, status codes | `raw-server.js` |
| **Week 16.2** | Express.js Introduction | Declarative routing, static file serving, decoupled controllers | `server.js`, `routes/apiRoutes.js` |
| **Week 16.3** | Express Middleware Pipeline | Timing (`X-Response-Time`), logger, counter, JSON parser, CORS | `middleware/timing.js`, `middleware/logger.js`, `middleware/requestCounter.js` |
| **Week 16.4** | Request–Response Lifecycle | Visual trace of `req`, `res`, `next()`, and centralized 4-arg error handling | `middleware/errorHandler.js`, `public/index.html` |

---

## 🏗 Project Architecture & Structure

```text
nodeforge/
├── controllers/
│   ├── demoController.js       # Module demos (math, greeting, path, error)
│   ├── notesController.js      # Safe async fs.promises CRUD operations
│   └── runtimeController.js   # Genuine process metrics collector
├── data/
│   └── notes.json              # File-based JSON storage (fs demonstration)
├── middleware/
│   ├── cors.js                 # Cross-Origin Resource Sharing
│   ├── errorHandler.js         # 4-argument global error handler
│   ├── logger.js               # In-memory ring buffer (50 logs) & stdout
│   ├── notFound.js             # Consistent 404 JSON responder
│   ├── requestCounter.js       # Request metrics by method & status
│   └── timing.js               # API latency measurement & X-Response-Time
├── public/
│   ├── css/
│   │   └── styles.css          # Developer dashboard theme (Inter font, responsive)
│   ├── js/
│   │   └── app.js              # Vanilla frontend fetch() client & simulations
│   └── index.html              # 7-section learning dashboard
├── routes/
│   └── apiRoutes.js            # Express router mounting all endpoints
├── scripts/
│   └── test-endpoints.js       # Automated terminal-based HTTP test runner
├── utils/
│   ├── greeting.js             # CommonJS greeting utility
│   └── math.js                 # CommonJS arithmetic & stats utility
├── .env                        # Local environment configuration
├── .env.example                # Safe environment template
├── .gitignore                  # Git ignore rules (node_modules, .env, logs)
├── package.json                # Project dependencies and npm scripts
├── raw-server.js               # Raw HTTP server (built-in http module only)
├── server.js                   # Main Express application server
└── README.md                   # Comprehensive documentation & viva guide
```

---

## ⚡ Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended, tested on Node v24)
- npm (v9.0.0 or higher)

### 1. Clone or Open Project Directory
```bash
cd "c:\Users\VICTUS\Desktop\Desktop Data\HW\nodeforge"
```

### 2. Install Dependencies
```bash
npm install
```
*(Dependencies installed: `express`, `dotenv`)*

### 3. Verify Environment File
A default `.env` file is included. You can customize ports if desired:
```properties
PORT=3000
RAW_PORT=3001
NODE_ENV=development
```

---

## 🚀 Running the Application

NodeForge provides two runnable servers:

### Option A: Start the Express Application Server (Port 3000)
```bash
npm start
```
*Or with hot-reload watch mode (Node.js 18+):*
```bash
npm run dev
```
- **Dashboard URL:** `http://localhost:3000`
- **Express API Base:** `http://localhost:3000/api`

### Option B: Start the Raw HTTP Server (Port 3001)
In a separate terminal window:
```bash
npm run raw
```
- **Raw Server URL:** `http://localhost:3001`
- **Endpoints:** `GET /`, `GET /api/hello`, `GET /api/time`, `GET /api/status`

> **Note:** Both servers can run concurrently without port conflict.

---

## 📡 API Reference & curl Examples

You can test all endpoints directly from PowerShell or Command Prompt using `curl`.

### 1. Express Server Endpoints (`http://localhost:3000`)

#### A. Health Check
```bash
curl http://localhost:3000/api/health
```

#### B. Runtime Information (`process` Object)
```bash
curl http://localhost:3000/api/runtime
```

#### C. Retrieve Saved Notes (`fs.promises` Read)
```bash
curl http://localhost:3000/api/notes
```

#### D. Create a New Note (`fs.promises` Write)
```bash
curl -X POST http://localhost:3000/api/notes `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Event Loop\",\"content\":\"Asynchronous non-blocking architecture\",\"category\":\"Architecture\"}'
```

#### E. Delete a Note by ID
```bash
curl -X DELETE http://localhost:3000/api/notes/note-1
```

#### F. CommonJS Greeting Module
```bash
curl "http://localhost:3000/api/demo/hello?name=Sarah&role=Engineer"
```

#### G. CommonJS Math Module
```bash
curl -X POST http://localhost:3000/api/demo/math `
  -H "Content-Type: application/json" `
  -d '{\"operation\":\"multiply\",\"a\":12,\"b\":8}'
```

#### H. Cross-Platform Path Inspection (`path` Module)
```bash
curl -X POST http://localhost:3000/api/demo/path `
  -H "Content-Type: application/json" `
  -d '{\"segments\":[\"var\",\"log\",\"app.log\"],\"sampleFile\":\"server.config.js\"}'
```

#### I. Test Global Error Handling Middleware
```bash
curl "http://localhost:3000/api/demo/error?status=500&msg=Database+timeout+simulation"
```

#### J. Request Metrics & In-Memory Logs Buffer
```bash
curl http://localhost:3000/api/requests
curl http://localhost:3000/api/logs
```

---

### 2. Raw HTTP Server Endpoints (`http://localhost:3001`)

#### A. Welcome HTML Page
```bash
curl http://localhost:3001/
```

#### B. JSON Greeting
```bash
curl http://localhost:3001/api/hello
```

#### C. Server Time
```bash
curl http://localhost:3001/api/time
```

#### D. Runtime Status
```bash
curl http://localhost:3001/api/status
```

#### E. Unsupported Route (Demonstrating 404 Response)
```bash
curl http://localhost:3001/api/does-not-exist
```

---

## 🖥 Interactive Learning Sections

1. **Overview Dashboard:** Live health check, port display, request counter, and jump cards.
2. **Node.js Runtime & CommonJS:** Theoretical breakdown of V8/libuv vs Browser DOM, live memory/uptime inspector, and interactive calculators for `utils/greeting.js` and `utils/math.js`.
3. **Core Modules (`fs`, `path`, `process`):**
   - **`fs`:** Notes manager persisting data directly into `data/notes.json` via `fs.promises`.
   - **`path`:** Live sandbox demonstrating `path.join()`, `path.resolve()`, `path.basename()`, `path.extname()`.
   - **`process`:** Operating system architecture, PID, working directory, and environment variable isolation.
4. **Raw HTTP Server:** Live controller for port 3001 showing how `http.createServer()` operates under the hood with status codes and JSON formatting.
5. **Express.js Framework:** Route tester, timing header verification, and real-time in-memory request log viewer.
6. **Request–Response Lifecycle:** Visual step-by-step pipeline tracking how requests pass through timing, CORS, logger, counter, JSON parser, route handlers, and error catchers with `next()`.
7. **Viva Questions:** 20 searchable oral examination questions with category filters and accordion answers.

---

## 🧪 Automated Terminal Testing

NodeForge includes a dedicated automated test suite that verifies all Express and Raw HTTP endpoints without requiring a browser.

With both servers running, execute:
```bash
npm run test:api
```

This verifies:
- ✅ Express static frontend serving (GET /)
- ✅ Timing header (`X-Response-Time`)
- ✅ Health and runtime process inspection
- ✅ CommonJS modules (`utils/greeting.js` and `utils/math.js`)
- ✅ File persistence (`data/notes.json` creation, read, delete, validation)
- ✅ Centralized error-handling middleware (500 internal errors)
- ✅ 404 Not Found routing
- ✅ In-memory request logging and counting
- ✅ Raw HTTP server endpoints on port 3001 (GET /, /api/hello, /api/time, /api/status, 404s)

---

## 🗣 Viva Examination Guide

Below are sample questions commonly asked in oral examinations:

1. **What is Node.js?**
   *A cross-platform JavaScript runtime built on Chrome's V8 engine that executes JavaScript on the server.*
2. **What is libuv?**
   *A multi-platform C library that provides the event loop and thread pool for non-blocking asynchronous I/O in Node.js.*
3. **What is the difference between CommonJS and ES Modules?**
   *CommonJS loads modules synchronously using `require()` and `module.exports`, while ES Modules use asynchronous static syntax (`import` / `export`).*
4. **Why use `fs.promises` instead of `fs.readFileSync`?**
   *`fs.readFileSync` blocks the single-threaded event loop, preventing all other users from being served. `fs.promises` offloads file I/O to background threads without blocking.*
5. **Why use `path.join()` instead of string concatenation?**
   *Windows uses backslashes (`\`) while POSIX (Linux/macOS) uses forward slashes (`/`). `path.join()` normalizes the separators automatically.*
6. **What is the role of `next()` in Express middleware?**
   *`next()` invokes the next middleware function in the execution stack. If omitted, the request hangs indefinitely. Calling `next(err)` triggers the error-handling middleware.*
7. **How does Express identify an error-handling middleware?**
   *By having exactly 4 parameters in its function signature: `(err, req, res, next)`.*
8. **What does `express.json()` do?**
   *It parses incoming requests with JSON payloads (based on `body-parser`) and populates `req.body`.*

---

## 📄 License
ISC License — Suitable for educational and academic submission.
