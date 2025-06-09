// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/responses');

// Create rate limiter with custom error response
const createLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 5, // 5 requests per window default
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      return errorResponse(res, options.message || 'Too many requests, please try again later', 429, {
        retryAfter: Math.round(options.windowMs / 1000) || 900
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  });
};

// Strict rate limiter for sensitive operations
const strictLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts per 15 minutes
  message: 'Too many attempts, please try again in 15 minutes'
});

// Standard rate limiter for general auth operations
const standardLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many requests, please try again later'
});

// Lenient rate limiter for less sensitive operations
const lenientLimiter = createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per 5 minutes
  message: 'Rate limit exceeded, please slow down'
});

// Specific rate limiters for different endpoints

// Registration - moderate limiting
const register = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour
  message: 'Too many registration attempts, please try again in an hour'
});

// Login - strict limiting to prevent brute force
const login = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again in 15 minutes'
});

// Email verification - moderate limiting
const verifyEmail = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 verification attempts per 15 minutes
  message: 'Too many verification attempts, please try again later'
});

// Resend verification - strict limiting
const resendVerification = createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 resend attempts per 5 minutes
  message: 'Too many resend requests, please wait before requesting again'
});

// Password reset - strict limiting
const passwordReset = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again in an hour'
});

// Token refresh - lenient limiting
const refreshToken = createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 refresh attempts per 5 minutes (for active sessions)
  message: 'Too many token refresh requests, please slow down'
});

// Change password - moderate limiting
const changePassword = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password changes per hour
  message: 'Too many password change attempts, please try again later'
});

// Profile operations - lenient limiting
const profile = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 profile requests per 15 minutes
  message: 'Too many profile requests, please slow down'
});

// Session management - moderate limiting
const sessions = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 session requests per 15 minutes
  message: 'Too many session requests, please slow down'
});

// IP-based rate limiter for suspicious activity
const suspiciousActivity = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Only 1 request per hour if flagged as suspicious
  message: 'Suspicious activity detected, access temporarily restricted'
});

// Global rate limiter (fallback)
const global = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes globally
  message: 'Global rate limit exceeded, please slow down'
});

module.exports = {
  strictLimiter,
  standardLimiter,
  lenientLimiter,
  register,
  login,
  verifyEmail,
  resendVerification,
  passwordReset,
  refreshToken,
  changePassword,
  profile,
  sessions,
  suspiciousActivity,
  global
};