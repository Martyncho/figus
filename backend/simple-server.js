#!/usr/bin/env node

const http = require('http');
const port = process.env.PORT || 3000;

console.log('Starting simple server...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Respond with 200 OK to all requests
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'OK',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server listening on 0.0.0.0:${port}`);
  console.log('Ready to accept requests');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

