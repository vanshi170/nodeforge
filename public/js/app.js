/**
 * NodeForge - Frontend Application Logic
 * Pure Vanilla JavaScript (No frameworks)
 * Interacts with Node.js and Express backend via real fetch() calls.
 */

// Configuration
const API_BASE = '/api';
const RAW_SERVER_BASE = 'http://localhost:3001';

// State
let allVivaQuestions = [];
let activeVivaCategory = 'all';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initVivaQuestions();
  checkBackendHealth();
  probeRawServer();
  loadNotes();
  fetchRuntimeMetrics();
  refreshServerLogs();

  // Periodic health ping
  setInterval(checkBackendHealth, 10000);
});

/* ==========================================================================
   Tab Navigation System
   ========================================================================== */

function initTabs() {
  const navBtns = document.querySelectorAll('.nav-btn');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Sync with URL hash
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(`pane-${hash}`)) {
    switchTab(hash);
  }
}

function switchTab(tabId) {
  // Update buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const activePane = document.getElementById(`pane-${tabId}`);
  if (activePane) {
    activePane.classList.add('active');
    window.location.hash = tabId;
  }

  // Trigger contextual refreshes
  if (tabId === 'runtime') fetchRuntimeMetrics();
  if (tabId === 'core-modules') loadNotes();
  if (tabId === 'express') refreshServerLogs();
  if (tabId === 'raw-http') probeRawServer();
}

function switchCoreSubTab(subTabId) {
  document.querySelectorAll('.sub-nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const targetBtn = Array.from(document.querySelectorAll('.sub-nav-btn')).find(b => 
    b.getAttribute('onclick')?.includes(subTabId)
  );
  if (targetBtn) targetBtn.classList.add('active');

  document.querySelectorAll('.core-sub-pane').forEach(pane => {
    pane.style.display = 'none';
  });

  const targetPane = document.getElementById(`core-${subTabId}`);
  if (targetPane) {
    targetPane.style.display = 'block';
  }
}

/* ==========================================================================
   Backend Health & Process Status (Section 1)
   ========================================================================== */

async function checkBackendHealth() {
  const topStatus = document.getElementById('topStatusIndicator');
  const topText = document.getElementById('topStatusText');
  const pill = document.getElementById('apiStatusPill');
  const consoleElem = document.getElementById('healthResponseConsole');
  const timeElem = document.getElementById('healthLastChecked');

  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Fetch live request stats
    const statsRes = await fetch(`${API_BASE}/requests`);
    const statsData = await statsRes.json();
    const stats = statsData.data || {};

    // Update UI elements
    topStatus.className = 'status-indicator online';
    topText.textContent = `Express Online (${data.port || 3000})`;

    pill.className = 'status-pill status-online';
    pill.textContent = 'Operational (200 OK)';

    document.getElementById('portBadge').textContent = `PORT: ${data.port || 3000}`;
    document.getElementById('requestCountMetric').textContent = stats.totalRequests || 0;
    document.getElementById('uptimeMetric').textContent = `${data.uptimeSeconds || 0}s`;

    timeElem.textContent = new Date().toLocaleTimeString();
    consoleElem.innerHTML = `<code>${JSON.stringify({ health: data, metrics: stats }, null, 2)}</code>`;
  } catch (err) {
    topStatus.className = 'status-indicator offline';
    topText.textContent = 'Server Offline';

    pill.className = 'status-pill status-offline';
    pill.textContent = 'Offline / Error';

    timeElem.textContent = new Date().toLocaleTimeString();
    consoleElem.innerHTML = `<code style="color: #f87171;">[Connection Failed] Error querying ${API_BASE}/health: ${err.message}</code>`;
  }
}

/* ==========================================================================
   Runtime & Process Inspection (Section 2)
   ========================================================================== */

async function fetchRuntimeMetrics() {
  try {
    const res = await fetch(`${API_BASE}/runtime`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const d = json.data;
    document.getElementById('rtNodeVersion').textContent = d.version;
    document.getElementById('rtPlatform').textContent = `${d.platform} (${d.arch})`;
    document.getElementById('rtPid').textContent = d.pid;
    document.getElementById('rtEnv').textContent = d.environment;
    document.getElementById('rtMemory').textContent = `${d.memoryUsageMB.heapUsed} MB / ${d.memoryUsageMB.heapTotal} MB`;
    document.getElementById('rtV8').textContent = d.engineVersions.v8;
    document.getElementById('rtUv').textContent = d.engineVersions.uv;
    document.getElementById('rtUptime').textContent = `${d.uptimeSeconds}s`;
  } catch (err) {
    console.error('Failed to load runtime metrics:', err);
  }
}

/* ==========================================================================
   CommonJS Modules Interactive Demos (Section 2)
   ========================================================================== */

async function testGreetingModule() {
  const name = document.getElementById('greetName').value.trim() || 'Student';
  const role = document.getElementById('greetRole').value.trim() || 'Learner';
  const box = document.getElementById('greetingResultBox');

  box.style.display = 'block';
  box.innerHTML = '<span class="loading-spinner">Invoking API...</span>';

  try {
    const res = await fetch(`${API_BASE}/demo/hello?name=${encodeURIComponent(name)}&role=${encodeURIComponent(role)}`);
    const data = await res.json();
    
    box.innerHTML = `
      <div style="background: #0f172a; padding: 0.75rem; border-radius: 6px; color: #e2e8f0; font-family: var(--font-mono); font-size: 0.8rem;">
        <div style="color: #38bdf8; margin-bottom: 0.25rem;">✔ Response from utils/greeting.js:</div>
        <p style="color: #a7f3d0; margin-bottom: 0.5rem; font-family: var(--font-sans); font-size: 0.9rem;">"${data.message}"</p>
        <div>Salutation: <strong style="color: #fde047;">${data.salutation}</strong></div>
      </div>
    `;
    showToast('Greeting module executed successfully');
  } catch (err) {
    box.innerHTML = `<div style="color: #ef4444;">Error: ${err.message}</div>`;
  }
}

function toggleMathInputs() {
  const op = document.getElementById('mathOp').value;
  const groupA = document.getElementById('groupMathA');
  const groupB = document.getElementById('groupMathB');

  if (op === 'factorial') {
    groupA.querySelector('label').textContent = 'Number (n <= 20):';
    groupB.style.display = 'none';
  } else if (op === 'stats') {
    groupA.querySelector('label').textContent = 'Sample Count:';
    groupB.style.display = 'none';
  } else {
    groupA.querySelector('label').textContent = 'Value A:';
    groupB.querySelector('label').textContent = 'Value B:';
    groupB.style.display = 'block';
  }
}

async function testMathModule() {
  const op = document.getElementById('mathOp').value;
  const valA = parseFloat(document.getElementById('mathA').value);
  const valB = parseFloat(document.getElementById('mathB').value);
  const box = document.getElementById('mathResultBox');

  box.style.display = 'block';
  box.innerHTML = '<span>Calculating...</span>';

  let payload = { operation: op };
  if (op === 'factorial') {
    payload.n = valA;
  } else if (op === 'stats') {
    payload.numbers = [valA, 12, 45, 88, 3, 99];
  } else {
    payload.a = valA;
    payload.b = valB;
  }

  try {
    const res = await fetch(`${API_BASE}/demo/math`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Error ${res.status}`);
    }

    box.innerHTML = `
      <div style="background: #0f172a; padding: 0.75rem; border-radius: 6px; color: #e2e8f0; font-family: var(--font-mono); font-size: 0.82rem;">
        <div style="color: #38bdf8;">✔ Output: ${data.description}</div>
        <div style="color: #fde047; font-size: 1rem; margin-top: 0.25rem;">Result = ${JSON.stringify(data.result)}</div>
        <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.25rem;">Executed via utils/math.js</div>
      </div>
    `;
    showToast('Math calculation completed');
  } catch (err) {
    box.innerHTML = `
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 0.6rem; border-radius: 6px; color: #b91c1c; font-size: 0.85rem;">
        <strong>Error:</strong> ${err.message}
      </div>
    `;
  }
}

/* ==========================================================================
   Core Modules: fs File Notes System (Section 3)
   ========================================================================== */

async function loadNotes() {
  const container = document.getElementById('notesListContainer');
  const countBadge = document.getElementById('notesCount');

  try {
    const res = await fetch(`${API_BASE}/notes`);
    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    const notes = json.data || [];
    countBadge.textContent = notes.length;

    if (notes.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
          No notes saved yet. Add your first note above to persist it to <code>data/notes.json</code>!
        </div>
      `;
      return;
    }

    container.innerHTML = notes.map(note => `
      <div class="note-item" id="note-${note.id}">
        <div class="note-top">
          <span class="note-title">${escapeHtml(note.title)}</span>
          <span class="note-category">${escapeHtml(note.category || 'General')}</span>
        </div>
        <p class="note-content">${escapeHtml(note.content)}</p>
        <div class="note-footer">
          <span>${new Date(note.createdAt).toLocaleString()}</span>
          <button class="btn-delete-note" onclick="deleteNote('${note.id}')" title="Delete note from file system">
            Delete ✖
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `
      <div style="color: var(--danger); padding: 1rem; font-size: 0.88rem;">
        Failed to load notes: ${err.message}
      </div>
    `;
  }
}

async function handleCreateNote(e) {
  e.preventDefault();
  const titleInput = document.getElementById('noteTitle');
  const categoryInput = document.getElementById('noteCategory');
  const contentInput = document.getElementById('noteContent');
  const addBtn = document.getElementById('btnAddNote');

  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const content = contentInput.value.trim();

  if (!title || !content) {
    showToast('Please fill in both title and content', 'error');
    return;
  }

  addBtn.disabled = true;
  addBtn.textContent = 'Saving to disk...';

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, content })
    });
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || `Error ${res.status}`);

    titleInput.value = '';
    contentInput.value = '';
    showToast('Note written to data/notes.json successfully');
    await loadNotes();
  } catch (err) {
    showToast(`Failed to create note: ${err.message}`, 'error');
  } finally {
    addBtn.disabled = false;
    addBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Note to File System
    `;
  }
}

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note from the file system?')) return;

  try {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || `Error ${res.status}`);

    showToast('Note deleted from data/notes.json');
    await loadNotes();
  } catch (err) {
    showToast(`Error deleting note: ${err.message}`, 'error');
  }
}

/* ==========================================================================
   Core Modules: Path Manipulation Sandbox (Section 3)
   ========================================================================== */

async function testPathManipulation() {
  const s1 = document.getElementById('pathSegment1').value.trim() || 'projects';
  const s2 = document.getElementById('pathSegment2').value.trim() || 'nodeforge';
  const s3 = document.getElementById('pathSegment3').value.trim() || 'server.js';
  const sampleFile = document.getElementById('sampleFileName').value.trim() || 'notes.json';
  const consoleElem = document.getElementById('pathOutputConsole');

  consoleElem.innerHTML = '<code>Computing path methods via POST /api/demo/path...</code>';

  try {
    const res = await fetch(`${API_BASE}/demo/path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segments: [s1, s2, s3],
        sampleFile
      })
    });
    const data = await res.json();
    consoleElem.innerHTML = `<code>${JSON.stringify(data, null, 2)}</code>`;
    showToast('Path functions calculated');
  } catch (err) {
    consoleElem.innerHTML = `<code style="color: #f87171;">Error: ${err.message}</code>`;
  }
}

/* ==========================================================================
   Raw HTTP Server Controller (Section 4)
   ========================================================================== */

async function probeRawServer() {
  const pill = document.getElementById('rawServerStatusPill');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${RAW_SERVER_BASE}/api/status`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      pill.className = 'status-pill status-online';
      pill.textContent = 'Raw Server Online (3001)';
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch {
    pill.className = 'status-pill status-offline';
    pill.textContent = 'Raw Server Offline (Port 3001)';
  }
}

async function testRawEndpoint(endpoint) {
  const consoleTitle = document.getElementById('rawConsoleTitle');
  const consoleStatus = document.getElementById('rawConsoleStatus');
  const consoleBody = document.getElementById('rawConsoleBody');

  consoleTitle.textContent = `Querying Raw HTTP Server: GET ${endpoint}`;
  consoleStatus.textContent = 'Connecting...';
  consoleBody.innerHTML = '<code>Sending HTTP request to port 3001...</code>';

  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${RAW_SERVER_BASE}${endpoint}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    const duration = (performance.now() - startTime).toFixed(1);
    const contentType = res.headers.get('content-type') || '';
    let responseText;

    if (contentType.includes('application/json')) {
      const json = await res.json();
      responseText = JSON.stringify(json, null, 2);
    } else {
      responseText = await res.text();
    }

    consoleStatus.textContent = `${res.status} ${res.statusText} (${duration}ms)`;
    consoleBody.innerHTML = `<code>// Status Code: ${res.status}\n// Duration: ${duration}ms\n// Content-Type: ${contentType}\n\n${escapeHtml(responseText)}</code>`;
    showToast(`Raw Server response: ${res.status}`);
    probeRawServer();
  } catch (err) {
    const duration = (performance.now() - startTime).toFixed(1);
    consoleStatus.textContent = `Connection Failed (${duration}ms)`;
    consoleBody.innerHTML = `<code style="color: #f87171;">[Connection Error] Could not connect to Raw HTTP Server on port 3001.\n\nReason: ${err.message}\n\nTo run the raw HTTP server, open a terminal in the project directory and run:\n  npm run raw</code>`;
    probeRawServer();
  }
}

/* ==========================================================================
   Express Route Tester & Logs (Section 5)
   ========================================================================== */

async function testExpressRoute(endpoint) {
  const consoleTitle = document.getElementById('expressConsoleTitle');
  const consoleStatus = document.getElementById('expressConsoleStatus');
  const consoleBody = document.getElementById('expressConsoleBody');

  consoleTitle.textContent = `GET ${endpoint}`;
  consoleStatus.textContent = 'Executing...';
  consoleBody.innerHTML = '<code>Sending request to Express pipeline...</code>';

  const start = performance.now();

  try {
    const res = await fetch(endpoint);
    const duration = (performance.now() - start).toFixed(1);
    const data = await res.json();
    const timingHeader = res.headers.get('X-Response-Time') || `${duration}ms`;

    consoleStatus.textContent = `${res.status} ${res.statusText} (${timingHeader})`;
    consoleBody.innerHTML = `<code>// HTTP Status: ${res.status}\n// X-Response-Time Header: ${timingHeader}\n\n${JSON.stringify(data, null, 2)}</code>`;

    refreshServerLogs();
    checkBackendHealth();
    showToast(`Express responded with ${res.status}`);
  } catch (err) {
    consoleStatus.textContent = 'Request Failed';
    consoleBody.innerHTML = `<code style="color: #f87171;">Request error: ${err.message}</code>`;
  }
}

async function refreshServerLogs() {
  const tbody = document.getElementById('logsTableBody');
  try {
    const res = await fetch(`${API_BASE}/logs`);
    const json = await res.json();
    const logs = json.data || [];

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color: #94a3b8;">No requests logged yet.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const statusColor = l.statusCode >= 500 ? '#ef4444' : l.statusCode >= 400 ? '#f59e0b' : '#10b981';
      return `
        <tr>
          <td style="font-family: var(--font-mono); font-size: 0.76rem;">${new Date(l.timestamp).toLocaleTimeString()}</td>
          <td><span class="code-badge" style="font-weight: 700;">${escapeHtml(l.method)}</span></td>
          <td style="font-family: var(--font-mono); font-size: 0.8rem;">${escapeHtml(l.url)}</td>
          <td><strong style="color: ${statusColor};">${l.statusCode}</strong></td>
          <td style="font-family: var(--font-mono);">${l.durationMs}ms</td>
          <td style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(l.ip)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}

/* ==========================================================================
   Request–Response Lifecycle Simulation (Section 6)
   ========================================================================== */

async function runLifecycleSimulation() {
  const selector = document.getElementById('lifecycleRequestSelector').value;
  const runBtn = document.getElementById('btnRunLifecycle');

  let endpoint = '/api/demo/hello?name=Explorer&role=Tester';
  let method = 'GET';
  let isErrorFlow = false;
  let bodyPayload = null;

  if (selector === 'math') {
    endpoint = '/api/demo/math';
    method = 'POST';
    bodyPayload = { operation: 'multiply', a: 15, b: 8 };
  } else if (selector === 'error') {
    endpoint = '/api/demo/error?status=500&msg=Lifecycle+simulated+database+crash';
    isErrorFlow = true;
  } else if (selector === 'notfound') {
    endpoint = '/api/route-that-does-not-exist';
    isErrorFlow = true;
  }

  runBtn.disabled = true;

  // Clear previous active nodes
  document.querySelectorAll('.pipe-node').forEach(node => {
    node.classList.remove('active-node');
  });

  // Animation timeline of standard pipeline nodes
  const standardSequence = [
    'node-client-req',
    'node-timing',
    'node-cors',
    'node-logger',
    'node-counter',
    'node-json',
    'node-route',
    'node-client-res'
  ];

  // Animate standard sequence
  for (let i = 0; i < standardSequence.length; i++) {
    const nodeId = standardSequence[i];
    const elem = document.getElementById(nodeId);
    if (elem) elem.classList.add('active-node');
    await sleep(140);
  }

  // If error flow, highlight the error pipeline
  if (isErrorFlow) {
    const errorSequence = [
      'node-error-origin',
      'node-error-skip',
      'node-error-handler',
      'node-error-response'
    ];

    for (let i = 0; i < errorSequence.length; i++) {
      const nodeId = errorSequence[i];
      const elem = document.getElementById(nodeId);
      if (elem) elem.classList.add('active-node');
      await sleep(140);
    }
  }

  // Execute real HTTP request to verify
  const start = performance.now();
  try {
    const fetchOptions = { method };
    if (bodyPayload) {
      fetchOptions.headers = { 'Content-Type': 'application/json' };
      fetchOptions.body = JSON.stringify(bodyPayload);
    }

    const res = await fetch(endpoint, fetchOptions);
    const duration = (performance.now() - start).toFixed(1);
    const data = await res.json();
    const timingHeader = res.headers.get('X-Response-Time') || `${duration}ms`;

    document.getElementById('lcMethod').textContent = method;
    document.getElementById('lcEndpoint').textContent = endpoint;
    document.getElementById('lcStatus').textContent = `${res.status} ${res.statusText}`;
    document.getElementById('lcDuration').textContent = `${duration}ms`;
    document.getElementById('lcHeaderTiming').textContent = timingHeader;
    document.getElementById('lcResponseBody').innerHTML = `<code>${JSON.stringify(data, null, 2)}</code>`;

    showToast(`Lifecycle trace completed: ${res.status}`);
    refreshServerLogs();
  } catch (err) {
    document.getElementById('lcResponseBody').innerHTML = `<code style="color: #f87171;">Trace error: ${err.message}</code>`;
  } finally {
    runBtn.disabled = false;
  }
}

/* ==========================================================================
   Viva Examination Questions & Oral Prep (Section 7)
   ========================================================================== */

function initVivaQuestions() {
  allVivaQuestions = [
    {
      id: 1,
      category: 'Runtime',
      q: 'What is Node.js?',
      a: 'Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser. It is built on Google Chrome\'s V8 JavaScript engine and uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.'
    },
    {
      id: 2,
      category: 'Runtime',
      q: 'What is the Node.js runtime environment?',
      a: 'The Node.js runtime is the execution environment that provides everything needed to run JavaScript on the server. It includes the V8 engine (compiles JS to machine code), libuv (C library providing the event loop, thread pool, and asynchronous I/O), and core C++ bindings and built-in modules.'
    },
    {
      id: 3,
      category: 'Modules',
      q: 'What are CommonJS modules in Node.js?',
      a: 'CommonJS (CJS) is the module specification traditionally used in Node.js. In CommonJS, each JavaScript file is treated as a separate module with its own private scope. Modules are loaded synchronously using the require() function and expose functions/objects using module.exports.'
    },
    {
      id: 4,
      category: 'Modules',
      q: 'What do require() and module.exports do?',
      a: 'require(path) is used to synchronously import modules, JSON files, or local files. It evaluates the module code once and caches the result. module.exports is a special object that defines what a module publicly exposes to other files when imported.'
    },
    {
      id: 5,
      category: 'Core',
      q: 'What is the purpose of the built-in fs module?',
      a: 'The fs (File System) module allows Node.js applications to interact with the file system to read, write, update, delete, and watch files and directories. In modern code, fs.promises provides Promise-based asynchronous methods for clean async/await syntax.'
    },
    {
      id: 6,
      category: 'Core',
      q: 'What is the difference between fs.readFileSync and fs.promises.readFile?',
      a: 'fs.readFileSync() is synchronous and blocking; it halts the entire Node.js event loop and freezes the server until the file is read. In contrast, fs.promises.readFile() is asynchronous and non-blocking; Node delegates the read operation to the libuv thread pool and continues serving other client requests.'
    },
    {
      id: 7,
      category: 'Core',
      q: 'What is the purpose of the path module?',
      a: 'The path module provides cross-platform utilities for working with file and directory paths. Windows uses backslashes (\\) while Unix/Linux/macOS uses forward slashes (/). Using path.join() or path.resolve() ensures code runs reliably across all operating systems without path formatting bugs.'
    },
    {
      id: 8,
      category: 'Core',
      q: 'What is the process object in Node.js?',
      a: 'The process object is a global object that provides information about, and control over, the current running Node.js process. It gives access to environment variables (process.env), process architecture (process.arch), platform (process.platform), current working directory (process.cwd()), uptime (process.uptime()), and exit controls.'
    },
    {
      id: 9,
      category: 'Modules',
      q: 'What is npm and what is package.json?',
      a: 'npm (Node Package Manager) is the default package manager for the JavaScript ecosystem. package.json is the manifest file at the root of a Node.js project that holds metadata about the project, script commands (e.g., npm start), and lists dependencies and devDependencies with version ranges.'
    },
    {
      id: 10,
      category: 'HTTP',
      q: 'What is an HTTP server?',
      a: 'An HTTP server is a software program that listens on a specific network port for incoming HTTP requests from clients (such as web browsers or mobile apps), processes the request, and sends back an HTTP response containing status codes, headers, and payload data (HTML, JSON, text, images).'
    },
    {
      id: 11,
      category: 'HTTP',
      q: 'What is the difference between a raw HTTP server and Express.js?',
      a: 'A raw HTTP server uses Node\'s native http.createServer() requiring manual URL parsing, tedious nested if-else checks for routing, manual JSON stringification, and manual stream buffering. Express.js is a lightweight web framework that abstracts these low-level details into declarative routes, built-in middleware, parameter parsing, and centralized error handling.'
    },
    {
      id: 12,
      category: 'Express',
      q: 'What is Express.js?',
      a: 'Express.js is a minimal and flexible web application framework for Node.js. It provides a robust set of features for web and mobile applications, including declarative HTTP routing, middleware pipeline integration, templating, and automated request/response handling.'
    },
    {
      id: 13,
      category: 'Express',
      q: 'What is routing in Express?',
      a: 'Routing refers to how an application responds to a client request to a particular endpoint, which is a URI (or path) and a specific HTTP request method (GET, POST, PUT, DELETE). Routes are defined using methods like app.get(\'/path\', handler) or express.Router().'
    },
    {
      id: 14,
      category: 'Express',
      q: 'What is middleware in Express?',
      a: 'Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle (next). Middleware can execute code, modify req and res, end the cycle, or call next() to pass control to the next handler.'
    },
    {
      id: 15,
      category: 'Express',
      q: 'What does the next() function do?',
      a: 'next() passes control to the next middleware function in the stack. If a middleware does not end the request-response cycle (e.g., via res.send() or res.json()) and does not call next(), the client request will be left hanging. Calling next(error) skips all remaining normal middleware and routes to error handlers.'
    },
    {
      id: 16,
      category: 'Express',
      q: 'What is the request–response cycle?',
      a: 'The request–response cycle begins when a client sends an HTTP request to the server. The request moves through registered middleware in order of registration. A route handler processes the data and sends a response back to the client using res.send(), res.json(), etc., ending the cycle.'
    },
    {
      id: 17,
      category: 'HTTP',
      q: 'Why do we use HTTP status codes?',
      a: 'HTTP status codes are standardized 3-digit integers that indicate whether a specific HTTP request has been successfully completed. 2xx indicates success (200 OK, 201 Created), 4xx indicates client error (400 Bad Request, 404 Not Found), and 5xx indicates server error (500 Internal Server Error).'
    },
    {
      id: 18,
      category: 'Express',
      q: 'What is express.json()?',
      a: 'express.json() is a built-in middleware function in Express based on body-parser. It parses incoming HTTP requests with JSON payloads (Content-Type: application/json) and populates req.body with the parsed JavaScript object.'
    },
    {
      id: 19,
      category: 'Express',
      q: 'How does error-handling middleware work in Express?',
      a: 'Error-handling middleware functions are defined with four arguments instead of three: (err, req, res, next). Express detects this 4-argument signature and automatically forwards any error passed via next(err) or uncaught exceptions directly to this handler.'
    },
    {
      id: 20,
      category: 'Express',
      q: 'What is the difference between req.params, req.query, and req.body?',
      a: 'req.params contains route parameters specified in the path pattern (e.g., /api/notes/:id gives req.params.id). req.query contains parsed URL query string parameters after the ? mark (e.g., /search?q=node gives req.query.q). req.body contains data submitted in the HTTP request body (e.g. POST JSON payload).'
    }
  ];

  renderVivaAccordion();
}

function renderVivaAccordion(questionsToRender = allVivaQuestions) {
  const container = document.getElementById('vivaAccordionContainer');
  if (questionsToRender.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        No matching questions found. Try another search keyword!
      </div>
    `;
    return;
  }

  container.innerHTML = questionsToRender.map(item => `
    <div class="viva-item" id="viva-${item.id}">
      <div class="viva-header" onclick="toggleViva(${item.id})">
        <div class="viva-q-title">
          <span class="viva-num">Q${item.id}</span>
          <span>${escapeHtml(item.q)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="viva-tag-pill">${escapeHtml(item.category)}</span>
          <svg class="viva-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="viva-body">
        <p>${escapeHtml(item.a)}</p>
      </div>
    </div>
  `).join('');
}

function toggleViva(id) {
  const item = document.getElementById(`viva-${id}`);
  if (item) {
    item.classList.toggle('open');
  }
}

function expandAllViva() {
  document.querySelectorAll('.viva-item').forEach(item => item.classList.add('open'));
}

function collapseAllViva() {
  document.querySelectorAll('.viva-item').forEach(item => item.classList.remove('open'));
}

function filterVivaByCategory(category) {
  activeVivaCategory = category;
  document.querySelectorAll('.tag-chip').forEach(chip => chip.classList.remove('active'));

  const activeChip = Array.from(document.querySelectorAll('.tag-chip')).find(c => 
    c.getAttribute('onclick')?.includes(category)
  );
  if (activeChip) activeChip.classList.add('active');

  filterVivaQuestions();
}

function filterVivaQuestions() {
  const search = document.getElementById('vivaSearchInput').value.toLowerCase().trim();
  
  const filtered = allVivaQuestions.filter(item => {
    const matchesCategory = activeVivaCategory === 'all' || item.category === activeVivaCategory;
    const matchesSearch = !search || 
      item.q.toLowerCase().includes(search) || 
      item.a.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  renderVivaAccordion(filtered);
}

/* ==========================================================================
   Utilities
   ========================================================================== */

function copyCode(btn) {
  const codeBox = btn.closest('.code-box');
  const code = codeBox ? codeBox.querySelector('code').innerText : '';
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1800);
    showToast('Code copied to clipboard');
  }).catch(() => {
    showToast('Failed to copy code', 'error');
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.background = '#991b1b';
  } else if (type === 'success') {
    toast.style.background = '#065f46';
  }
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function escapeHtml(text) {
  if (typeof text !== 'string') return String(text);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
