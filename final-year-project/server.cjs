const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for any unmatched routes (support client-side routing)
app.get('*', (req, res) => {
  console.log(`Serving index.html for path: ${req.url}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});