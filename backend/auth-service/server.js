// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

// Import routes
const authRoutes = require('./routes/auth');

// Import middleware
const rateLimiter = require('./middleware/rateLimiter');
const { errorResponse, serverErrorResponse } = require('./utils/responses');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Add both variations
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-Device-Name', 'X-Device-Type', 'X-Browser', 'X-OS']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Global rate limiting
app.use(rateLimiter.global);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip} - ${req.get('User-Agent')}`);
  next();
});

// Health check endpoint (before routes)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'RapidCare Auth Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'rapidcare-auth-service',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to RapidCare Authentication & Authorization Service',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return errorResponse(res, `${field} '${value}' already exists`, 409);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (error.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // Mongoose CastError
  if (error.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 400);
  }

  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return errorResponse(res, 'CORS policy violation', 403);
  }

  // Default to 500 server error
  return serverErrorResponse(res, 'Something went wrong', error);
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);

    // Database event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');

    // Close server
    if (server) {
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;