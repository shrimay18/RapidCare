const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  signin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email and password'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user needs email verification
      if (user.status === 'PENDING_VERIFICATION' || !user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email first',
          requiresVerification: true
        });
      }

      // Check if account is suspended or inactive
      if (user.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.'
        });
      }

      if (user.status === 'INACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive. Please contact support.'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return success response
      res.json({
        success: true,
        message: 'Signin successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          }
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during signin'
      });
    }
  },

  signup: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'PATIENT',
        status: 'PENDING_VERIFICATION',
        emailVerified: false
      });

      await user.save();

      // TODO: Send verification email

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          }
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during signup'
      });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { email, otp } = req.body;

      // Validate input
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email and OTP'
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // TODO: Verify OTP
      // For now, just mark as verified
      user.emailVerified = true;
      user.status = 'ACTIVE';
      await user.save();

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          }
        }
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during email verification'
      });
    }
  },

  resendVerificationOTP: async (req, res) => {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email'
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // TODO: Generate and send new OTP

      res.json({
        success: true,
        message: 'Verification code sent successfully'
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while resending verification code'
      });
    }
  }
};

module.exports = authController; 