// redirects to the actual server in the subdirectory
const path = require('path');
const childProcess = require('child_process');

// Change directory to final-year-project and run server.cjs
const serverProcess = childProcess.spawn('node', 
  [path.join(__dirname, 'final-year-project', 'server.cjs')], 
  { stdio: 'inherit' }
);

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});