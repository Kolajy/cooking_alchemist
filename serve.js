const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const DIRECTORY = path.join(__dirname, 'godot_web_dist');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.pck': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(DIRECTORY, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0]);
    
    // Safety check to prevent directory traversal
    if (filePath !== DIRECTORY && !filePath.startsWith(DIRECTORY + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Set Godot 4 SharedArrayBuffer headers
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
                'Cache-Control': 'no-store'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`Local Godot server running at http://localhost:${PORT}/`);
    console.log(`==================================================\n`);
});
