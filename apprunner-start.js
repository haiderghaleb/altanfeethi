#!/usr/bin/env node

// App Runner startup script for Next.js standalone
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure static files are available
const staticSource = path.join(__dirname, '.next', 'static');
const staticTarget = path.join(__dirname, '.next', 'standalone', '.next', 'static');

if (fs.existsSync(staticSource) && !fs.existsSync(staticTarget)) {
  console.log('Copying static files for App Runner...');
  try {
    fs.cpSync(staticSource, staticTarget, { recursive: true });
    console.log('Static files copied successfully');
  } catch (error) {
    console.warn('Warning: Could not copy static files:', error.message);
  }
}

// Start the Next.js standalone server
const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
const port = process.env.PORT || 3000;

console.log(`Starting Next.js server on port ${port}...`);

const server = spawn('node', [serverPath], {
  env: { ...process.env, PORT: port },
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});