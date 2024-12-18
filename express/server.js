require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/userRoutes');
const wishRoutes = require('./routes/wishRoutes');
const statsRoutes = require('./routes/statsRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const rateRoutes = require('./routes/rateRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
};

console.log('CORS configuration:', corsOptions);

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Start server before MongoDB connection
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API URL:', process.env.CORS_ORIGIN);
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/make-a-wish');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Server will continue running without MongoDB. Some features may be limited.');
  }
};

// Initial connection attempt
connectDB();

// Monitor MongoDB connection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/wishes', wishRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

// Test endpoint that doesn't require MongoDB
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working',
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use((req, res) => {
  console.log('404 - Route not found:', req.url);
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  
  // Close server
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close MongoDB connection if it exists
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }

  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});
