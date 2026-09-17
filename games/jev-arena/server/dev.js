import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import handler from '../api/decision.js';
const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
http.createServer(async (req, res) => {
  try {
    if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host)) { res.writeHead(403); return res.end('Invalid host'); }
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/api/decision') {
      let raw = '', size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 16384) { res.writeHead(413); return res.end('{"error":"body_too_large"}'); } raw += chunk; }
      req.body = raw;
      return await handler(req, res);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    const pathname = decodeURIComponent(url.pathname);
    // Only public assets are served, never server/, api/, dotfiles or env files.
    if (!(pathname === '/' || pathname === '/index.html' || /^\/src\/[a-z-]+\.(js|css)$/.test(pathname))) { res.writeHead(404); return res.end('Not found'); }
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    const bytes = await readFile(path.join(root, name));
    res.writeHead(200, { 'Content-Type': types[path.extname(name)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'" });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { if (!res.headersSent) res.writeHead(500); res.end('Request failed'); }
}).listen(port, '127.0.0.1', () => console.log(`Tank duel: http://127.0.0.1:${port}`));
