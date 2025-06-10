// controllers/authController.js
const User = require('../models/User');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const emailService = require('../services/emailService');
const tokenService = require('../services/tokenService');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { successResponse, errorResponse } = require('../utils/responses');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, { errors: errors.array() });
      }

      const { name, email, mobile, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return errorResponse(res, 'User already exists with this email', 400);
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        mobile,
        password,
        role
      });

      // Generate OTP for email verification using the model method
      const otp = user.generateEmailVerificationOTP();
      await user.save();

      console.log('✅ OTP generated and saved:', {
        otp: otp,
        emailVerificationOTP: user.emailVerificationOTP,
        emailVerificationExpires: user.emailVerificationExpires
      });

      // Send verification email
      await emailService.sendOTPEmail(email, otp, name, 'verification');

      // Generate tokens
      const accessToken = tokenService.generateAccessToken(user);

      return successResponse(res, 'Registration successful', 201, {
        user: user.toJSON(),
        token: accessToken
      });  
    } catch (error) {
      console.error('Registration error:', error);
      return errorResponse(res, 'Registration failed', 500);
    }
  }

  // Verify email with OTP
  async verifyEmail(req, res) {
    try {
      console.log('🔍 Verifying email with OTP:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return errorResponse(res, 'Validation failed', 400, { errors: errors.array() });
      }
      
      console.log('✅ Validation passed');
      const { email, otp } = req.body;
      console.log('📧 Email:', email);
      console.log('🔢 OTP received:', otp, 'Type:', typeof otp);

      const user = await User.findOne({ email }).select('+emailVerificationOTP +emailVerificationExpires');
      if (!user) {
        console.log('❌ User not found for email:', email);
        return errorResponse(res, 'User not found', 404);
      }
      
      console.log('✅ User found:', {
        id: user._id,
        email: user.email,
        emailVerified: user.emailVerified,
        emailVerificationOTP: user.emailVerificationOTP,
        emailVerificationExpires: user.emailVerificationExpires,
        expiresDate: new Date(user.emailVerificationExpires),
        currentDate: new Date()
      });

      if (user.emailVerified) {
        console.log('❌ Email already verified');
        return errorResponse(res, 'Email already verified', 400);
      }

      // Use the model method to verify OTP
      const isOTPValid = user.verifyEmailOTP(otp);
      
      console.log('🔢 OTP Verification:', {
        storedOTP: user.emailVerificationOTP,
        receivedOTP: otp,
        expiresAt: user.emailVerificationExpires,
        currentTime: new Date(),
        isValid: isOTPValid
      });

      if (!isOTPValid) {
        console.log('❌ Invalid or expired OTP');
        return errorResponse(res, 'Invalid or expired OTP', 400);
      }
      
      console.log('✅ OTP is valid and not expired');

      // Update user verification status
      user.emailVerified = true;
      user.status = 'ACTIVE';
      user.emailVerificationOTP = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      console.log('✅ User verification status updated');

      // Send welcome email
      await emailService.sendWelcomeEmail(email, user.name, user.role);
      console.log('✅ Welcome email sent');
      
      return successResponse(res, 'Email verified successfully', 200, {
        user: user.toJSON()
      });
    } catch (error) {
      console.error('❌ Email verification error:', error);
      return errorResponse(res, 'Email verification failed', 500);
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, { errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      // Check if account is locked
      if (user.isLocked) {
        return errorResponse(res, 'Account is locked. Try again later.', 403);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      // Update login info
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();

      // Generate tokens
      const accessToken = tokenService.generateAccessToken(user);

      return successResponse(res, 'Login successful', 200, {
        user: user.toJSON(),
        token: accessToken
      });
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, 'Login failed', 500);
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const token = tokenService.extractTokenFromRequest(req);
      if (!token) {
        return errorResponse(res, 'Access token required', 401);
      }

      // Verify token
      const decoded = tokenService.verifyAccessToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return errorResponse(res, 'User not found', 401);
      }

      // Generate new token
      const accessToken = tokenService.generateAccessToken(user);

      return successResponse(res, 'Token refreshed successfully', 200, {
        accessToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return errorResponse(res, 'Token refresh failed', 500);
    }
  }

  // Resend verification OTP
  async resendVerificationOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, { errors: errors.array() });
      }

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      if (user.emailVerified) {
        return errorResponse(res, 'Email already verified', 400);
      }

      // Generate new OTP using the model method
      const otp = user.generateEmailVerificationOTP();
      await user.save();

      // Send verification email
      await emailService.sendOTPEmail(email, otp, user.name, 'verification');

      return successResponse(res, 'Verification OTP sent successfully');
    } catch (error) {
      console.error('Resend verification OTP error:', error);
      return errorResponse(res, 'Failed to resend verification OTP', 500);
    }
  }

  // Verify session
  async verifySession(req, res) {
    try {
      return successResponse(res, 'Session is valid', 200, {
        user: req.user.toJSON()
      });
    } catch (error) {
      console.error('Session verification error:', error);
      return errorResponse(res, 'Session verification failed', 500);
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      return successResponse(res, 'Profile retrieved successfully', 200, {
        user: req.user.toJSON()
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(res, 'Failed to get profile', 500);
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      // In a real application, you might want to blacklist the token
      // or implement a token revocation mechanism
      return successResponse(res, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      return errorResponse(res, 'Logout failed', 500);
    }
  }

  // Logout from all devices
  async logoutAll(req, res) {
    try {
      // In a real application, you might want to invalidate all tokens
      // or implement a token revocation mechanism
      return successResponse(res, 'Logged out from all devices successfully');
    } catch (error) {
      console.error('Logout all error:', error);
      return errorResponse(res, 'Logout from all devices failed', 500);
    }
  }

  // Get user sessions
  async getSessions(req, res) {
    try {
      return successResponse(res, 'Sessions retrieved successfully', 200, {
        sessions: req.user.loginHistory || []
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      return errorResponse(res, 'Failed to get sessions', 500);
    }
  }

  // Revoke specific session
  async revokeSession(req, res) {
    try {
      const { sessionId } = req.params;

      // In a real application, you would implement session revocation logic
      // This could involve blacklisting tokens or removing session records

      return successResponse(res, 'Session revoked successfully');
    } catch (error) {
      console.error('Revoke session error:', error);
      return errorResponse(res, 'Failed to revoke session', 500);
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, { errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id).select('+password');

      // Check current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return errorResponse(res, 'Current password is incorrect', 400);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Send security alert email
      await emailService.sendSecurityAlertEmail(
        user.email,
        user.name,
        'Password Changed',
        {
          timestamp: new Date(),
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      return successResponse(res, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return errorResponse(res, 'Failed to change password', 500);
    }
  }

  // Get all users (Admin only)
  async getAllUsers(req, res) {
    try {
      const users = await User.find();
      return successResponse(res, 'Users retrieved successfully', 200, {
        users: users.map(user => user.toJSON())
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return errorResponse(res, 'Failed to get users', 500);
    }
  }

  // Get user by ID (Admin only)
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, 'User retrieved successfully', 200, {
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      return errorResponse(res, 'Failed to get user', 500);
    }
  }

  // Update user status (Admin only)
  async updateUserStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, { errors: errors.array() });
      }

      const { userId } = req.params;
      const { status } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      user.status = status;
      await user.save();

      // Send security alert email
      await emailService.sendSecurityAlertEmail(
        user.email,
        user.name,
        'Account Status Changed',
        {
          newStatus: status,
          timestamp: new Date(),
          changedBy: req.user.email
        }
      );

      return successResponse(res, 'User status updated successfully', 200, {
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Update user status error:', error);
      return errorResponse(res, 'Failed to update user status', 500);
    }
  }

  // Forgot password - send reset token
  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, { errors: errors.array() });
      }

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not for security
        return successResponse(res, 'If an account with that email exists, we have sent a password reset link');
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send password reset email
      await emailService.sendPasswordResetEmail(email, user.name, resetToken);

      return successResponse(res, 'Password reset email sent successfully');
    } catch (error) {
      console.error('Forgot password error:', error);
      return errorResponse(res, 'Failed to send password reset email', 500);
    }
  }

  // Reset password with token
  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, { errors: errors.array() });
      }

      const { token, newPassword } = req.body;

      // Hash the token to compare with stored version
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      }).select('+passwordResetToken +passwordResetExpires');

      if (!user) {
        return errorResponse(res, 'Invalid or expired reset token', 400);
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Send confirmation email
      await emailService.sendSecurityAlertEmail(
        user.email,
        user.name,
        'Password Reset Successful',
        {
          timestamp: new Date(),
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      return successResponse(res, 'Password reset successful');
    } catch (error) {
      console.error('Reset password error:', error);
      return errorResponse(res, 'Failed to reset password', 500);
    }
  }
}

module.exports = new AuthController();