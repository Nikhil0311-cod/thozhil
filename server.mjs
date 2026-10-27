import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname === '/healthz' || pathname === '/api/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      ...SECURITY_HEADERS,
    });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'fairshift-sentinel',
        sdg: 'UN SDG 8 - Decent Work and Economic Growth',
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Prevent path traversal
  const safeSuffix = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  let filePath = path.join(DIST_DIR, safeSuffix);

  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, SECURITY_HEADERS);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const cacheControl =
        ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        ...SECURITY_HEADERS,
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback to index.html for client-side routes
    const indexPath = path.join(DIST_DIR, 'index.html');
    fs.readFile(indexPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
        res.end('FairShift Sentinel build artifacts not found. Run npm run build first.');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        ...SECURITY_HEADERS,
      });
      res.end(content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`FairShift Sentinel production server listening on http://${HOST}:${PORT}`);
});
