// Kasb Co. — headquarters server.
// Serves the live company dashboard and runs the autonomous work cycle
// on a 24/7 timer. Humans can watch, but they don't have to.

import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createState, tick, snapshot, resetState, persist } from './lib/engine.js';
import { providerDirectory, brainStatus } from './lib/brain.js';
import { env } from './lib/env.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(env('PORT')) || 8787;
const TICK_MS = Number(env('KASB_TICK_MS')) || 5000; // one work cycle every 5s

const state = createState();

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/state') {
      return json(res, 200, snapshot(state));
    }
    if (url.pathname === '/api/providers') {
      return json(res, 200, { brain: brainStatus(), providers: providerDirectory() });
    }
    if (url.pathname === '/api/reset' && req.method === 'POST') {
      const fresh = resetState();
      Object.assign(state, fresh);
      return json(res, 200, { ok: true, cycle: state.cycle });
    }
    if (url.pathname === '/api/tick' && req.method === 'POST') {
      await tick(state);
      return json(res, 200, { ok: true, cycle: state.cycle });
    }

    // Static dashboard
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    const full = path.join(HERE, 'public', filePath);
    if (full.startsWith(path.join(HERE, 'public')) && existsSync(full) && full.endsWith('.html')) {
      const html = readFileSync(full, 'utf8');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(html);
    }
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    json(res, 500, { error: String(err && err.message || err) });
  }
});

// --- The24/7 work loop -------------------------------------------------------

let busy = false;
async function workCycle() {
  if (busy) return; // never overlap cycles
  busy = true;
  try {
    await tick(state);
  } catch (err) {
    console.error('[kasb] cycle error:', err);
  } finally {
    busy = false;
  }
}

const timer = setInterval(workCycle, TICK_MS);

function shutdown() {
  clearInterval(timer);
  persist(state);
  server.close(() => process.exit(0));
  // Fallback exit if connections linger.
  setTimeout(() => process.exit(0), 1500).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Kasb Co. headquarters listening on http://0.0.0.0:${PORT}`);
  console.log(`Work cycle every ${TICK_MS}ms · brain: ${brainStatus().mode}`);
  workCycle();
});
