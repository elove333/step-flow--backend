const express = require('express');
const cors = require('cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const folderRoutes = require('./routes/folderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/folders', folderRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'STEPFLOW Backend API is running' });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'STEPFLOW Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      folders: '/api/folders'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
