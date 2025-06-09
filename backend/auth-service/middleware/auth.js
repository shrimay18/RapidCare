// middleware/auth.js
const User = require('../models/User');
const tokenService = require('../services/tokenService');
const { errorResponse } = require('../utils/responses');
// const logger = require('../utils/logger');

// Authenticate user with JWT
const authenticate = async (req, res, next) => {
  try {
    const token = tokenService.extractTokenFromRequest(req);

    if (!token) {
      return errorResponse(res, 'Access token required', 401);
    }

    // Verify token
    const decoded = tokenService.verifyAccessToken(token);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return errorResponse(res, 'Account is not active', 403);
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return errorResponse(res, 'Password recently changed. Please log in again.', 401);
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid access token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401);
    }
    
    console.error('Authentication error:', error);
    return errorResponse(res, 'Authentication failed', 500);
  }
};

// Authorize user based on roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = tokenService.extractTokenFromRequest(req);

    if (token) {
      const decoded = tokenService.verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      
      if (user && user.status === 'ACTIVE' && !user.changedPasswordAfter(decoded.iat)) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

// Check if user owns resource
const checkOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.role === 'ADMIN') {
      // Admins can access any resource
      return next();
    }

    if (req.user._id.toString() !== resourceUserId) {
      return errorResponse(res, 'Access denied: You can only access your own resources', 403);
    }

    next();
  };
};

// Check email verification
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  if (!req.user.isEmailVerified) {
    return errorResponse(res, 'Email verification required', 403, {
      requiresVerification: true
    });
  }

  next();
};

// Check account status
const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  if (req.user.status === 'SUSPENDED') {
    return errorResponse(res, 'Account suspended. Contact support.', 403);
  }

  if (req.user.status === 'INACTIVE') {
    return errorResponse(res, 'Account inactive. Please activate your account.', 403);
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership,
  requireEmailVerification,
  requireActiveAccount
};