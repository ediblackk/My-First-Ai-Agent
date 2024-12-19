import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { router as userRoutes } from './routes/userRoutes.js';
import { router as wishRoutes } from './routes/wishRoutes.js';
import { router as adminRoutes } from './routes/adminRoutes.js';
import { router as statsRoutes } from './routes/statsRoutes.js';
import { router as transactionRoutes } from './routes/transactionRoutes.js';

// Load environment variables before any other imports
dotenv.config();

// Verify critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'ADMIN_WALLETS', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

console.log('\n=== Server Configuration ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Admin wallets:', process.env.ADMIN_WALLETS);
console.log('JWT secret:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/wishes', wishRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
