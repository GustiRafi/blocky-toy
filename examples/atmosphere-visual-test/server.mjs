import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(__dirname, 'output');
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

  if (req.method === 'POST' && url.pathname === '/save-frame') {
    const rawName = path.basename(url.searchParams.get('name') || 'frame.png');
    if (!/^[a-zA-Z0-9_.-]+\.png$/.test(rawName)) {
      res.writeHead(400).end('Invalid filename');
      return;
    }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      const b64 = body.replace(/^data:image\/png;base64,/, '');
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      const outPath = path.join(OUTPUT_DIR, rawName);
      fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ saved: outPath }));
    });
    return;
  }

  let relPath = decodeURIComponent(url.pathname);
  if (relPath === '/') relPath = '/examples/atmosphere-visual-test/index.html';
  const filePath = path.resolve(REPO_ROOT, '.' + relPath);
  if (!filePath.startsWith(REPO_ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404).end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Visual atmosphere test server listening on http://127.0.0.1:${PORT}/examples/atmosphere-visual-test/index.html`);
});
