#!/usr/bin/env node

/**
 * Empire of Fire - Recording Studio Server
 * A simple HTTP server for serving the recording studio application
 * Designed to work in Termux and other minimal environments
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Construct file path
    const filePath = path.join(__dirname, pathname);
    
    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read and serve file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║        Empire of Fire - Recording Studio              ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🎵 Server running on http://${HOST}:${PORT}`);
    console.log('');
    console.log('📱 For Termux users:');
    console.log(`   - Local access: http://localhost:${PORT}`);
    console.log(`   - Network access: http://[your-device-ip]:${PORT}`);
    console.log('');
    console.log('🌐 To find your device IP on Termux:');
    console.log('   Run: ifconfig wlan0 or ip addr show wlan0');
    console.log('');
    console.log('⚠️  Note: Make sure your browser supports Web Audio API');
    console.log('   (Chrome, Firefox, Edge recommended)');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
        console.error(`   Try a different port: PORT=3001 node server.js`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server gracefully...');
    server.close(() => {
        console.log('✅ Server stopped.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Shutting down server gracefully...');
    server.close(() => {
        console.log('✅ Server stopped.');
        process.exit(0);
    });
});
