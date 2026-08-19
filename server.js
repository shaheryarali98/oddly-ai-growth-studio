const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);

  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}).end('Not found');
      return;
    }

    const contentType = mime[path.extname(filePath)] || 'application/octet-stream';
    const range = request.headers.range;

    if (contentType === 'video/mp4' && range) {
      const [startText, endText] = range.replace('bytes=', '').split('-');
      const start = Number(startText);
      const end = endText ? Math.min(Number(endText), stats.size - 1) : stats.size - 1;

      if (!Number.isFinite(start) || start < 0 || start > end) {
        response.writeHead(416, {'Content-Range': `bytes */${stats.size}`}).end();
        return;
      }

      response.writeHead(206, {
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      });
      if (request.method === 'HEAD') response.end();
      else fs.createReadStream(filePath, {start, end}).pipe(response);
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Accept-Ranges': contentType === 'video/mp4' ? 'bytes' : 'none',
      'Cache-Control': 'public, max-age=300'
    });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filePath).pipe(response);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Oddly is live at http://localhost:${port}`);
});
