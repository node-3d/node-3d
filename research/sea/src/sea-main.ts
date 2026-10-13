const { createRequire } = require('node:module');
const path = require('node:path');

// The injected SEA entry can load built-ins only. Transfer control to a real
// file beside the executable so Node3D retains normal package-relative paths.
const entry = path.join(path.dirname(process.execPath), 'app', 'entry.cjs');
createRequire(entry)(entry);
