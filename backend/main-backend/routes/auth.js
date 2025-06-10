const express = require('express');
const router = express.Router();

// Import middleware
let auth, authorize, optionalAuth;
try {
  const middlewareAuth = require('../middleware/auth');
  auth = middlewareAuth.auth;
  authorize = middlewareAuth.authorize;
  optionalAuth = middlewareAuth.optionalAuth;
  console.log('✅ Auth middleware loaded');
} catch (error) {
  console.error('❌ Error loading auth middleware:', error.message);
  // Create dummy middleware for testing
  auth = (req, res, next) => next();
  authorize = () => (req, res, next) => next();
  optionalAuth = (req, res, next) => next();
}

// Import controller
let authController;
try {
  authController = require('../controllers/authController');
  console.log('✅ Auth controller loaded');
} catch (error) {
  console.error('❌ Error loading auth controller:', error.message);
  // Create dummy controller for testing
  authController = {
    signin: (req, res) => res.json({ message: 'Controller not loaded' }),
    signup: (req, res) => res.json({ message: 'Controller not loaded' }),
    verifyEmail: (req, res) => res.json({ message: 'Controller not loaded' }),
    resendVerificationOTP: (req, res) => res.json({ message: 'Controller not loaded' })
  };
}

// Route logging middleware
router.use((req, res, next) => {
  console.log(`📡 Auth Route: ${req.method} ${req.originalUrl}`);
  next();
});

// Public routes
router.post('/signin', (req, res, next) => {
  try {
    authController.signin(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/signup', (req, res, next) => {
  try {
    authController.signup(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', (req, res, next) => {
  try {
    authController.verifyEmail(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/resend-verification', (req, res, next) => {
  try {
    authController.resendVerificationOTP(req, res);
  } catch (error) {
    next(error);
  }
});

// Test route
router.get('/test/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 