// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, authorize, requireEmailVerification } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('mobile')
    .isMobilePhone()
    .withMessage('Please provide a valid mobile number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .isIn(['PATIENT', 'DOCTOR', 'ADMIN'])
    .withMessage('Role must be either PATIENT, DOCTOR, or ADMIN')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const verifyEmailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const resendOTPValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// Public routes (no authentication required)

// Register new user
router.post('/register', 
  rateLimiter.register,
  registerValidation,
  authController.register
);

// Verify email with OTP
router.post('/verify-email',
  rateLimiter.verifyEmail,
  verifyEmailValidation,
  authController.verifyEmail
);

// Login user
router.post('/login',
  rateLimiter.login,
  loginValidation,
  authController.login
);

// Refresh access token
router.post('/refresh-token',
  rateLimiter.refreshToken,
  authController.refreshToken
);

// Resend verification OTP
router.post('/resend-verification',
  rateLimiter.resendVerification,
  resendOTPValidation,
  authController.resendVerificationOTP
);

// Verify session (check if token is valid)
router.get('/verify-session',
  authenticate,
  authController.verifySession
);

// Protected routes (authentication required)

// Get current user profile
router.get('/profile',
  authenticate,
  requireEmailVerification,
  authController.getProfile
);

// Logout user
router.post('/logout',
  authenticate,
  authController.logout
);

// Logout from all devices
router.post('/logout-all',
  authenticate,
  authController.logoutAll
);

// Get user sessions
router.get('/sessions',
  authenticate,
  requireEmailVerification,
  authController.getSessions
);

// Revoke specific session
router.delete('/sessions/:sessionId',
  authenticate,
  requireEmailVerification,
  authController.revokeSession
);

// Change password
router.put('/change-password',
  authenticate,
  requireEmailVerification,
  changePasswordValidation,
  authController.changePassword
);

// Admin only routes

// Get all users (Admin only)
router.get('/users',
  authenticate,
  authorize('ADMIN'),
  authController.getAllUsers
);

// Get user by ID (Admin only)
router.get('/users/:userId',
  authenticate,
  authorize('ADMIN'),
  authController.getUserById
);

// Update user status (Admin only)
router.patch('/users/:userId/status',
  authenticate,
  authorize('ADMIN'),
  [
    body('status')
      .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
      .withMessage('Status must be ACTIVE, INACTIVE, or SUSPENDED')
  ],
  authController.updateUserStatus
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
    service: 'rapidcare-auth-service',
    version: '1.0.0'
  });
});

module.exports = router;