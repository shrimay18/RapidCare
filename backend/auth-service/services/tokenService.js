// services/tokenService.js
const jwt = require('jsonwebtoken');

class TokenService {
  // Generate access token
  generateAccessToken(user) {
    try {
      const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: 'rapidcare-auth',
        audience: 'rapidcare-client'
      });
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Token generation failed');
    }
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'rapidcare-auth',
        audience: 'rapidcare-client'
      });
    } catch (error) {
      console.error('Error verifying access token:', error);
      throw error;
    }
  }

  // Generate password reset token
  generatePasswordResetToken(user) {
    try {
      const payload = {
        id: user._id,
        email: user.email,
        purpose: 'password-reset',
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30m',
        issuer: 'rapidcare-auth',
        audience: 'rapidcare-password-reset'
      });
    } catch (error) {
      console.error('Error generating password reset token:', error);
      throw new Error('Password reset token generation failed');
    }
  }

  // Verify password reset token
  verifyPasswordResetToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'rapidcare-auth',
        audience: 'rapidcare-password-reset'
      });
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      throw error;
    }
  }

  // Extract token from request
  extractTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    return null;
  }

  // Decode token without verification (for expired token info)
  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Get token expiration time
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) {
        return null;
      }
      
      return new Date(decoded.payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Refresh token if close to expiry
  shouldRefreshToken(token, thresholdMinutes = 5) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.payload.exp - currentTime;
      const thresholdSeconds = thresholdMinutes * 60;
      
      return timeUntilExpiry < thresholdSeconds;
    } catch (error) {
      return true;
    }
  }
}

module.exports = new TokenService();
