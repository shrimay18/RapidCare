// models/RefreshToken.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Token details
  token: {
    type: String,
    required: true,
    unique: true
  },
  hashedToken: {
    type: String,
    required: true,
    unique: true
  },
  
  // Device and session info
  deviceId: {
    type: String,
    required: true
  },
  deviceName: String,
  deviceType: {
    type: String,
    enum: ['WEB', 'MOBILE', 'TABLET', 'DESKTOP'],
    default: 'WEB'
  },
  userAgent: String,
  ipAddress: String,
  
  // Status and timing
  status: {
    type: String,
    enum: ['ACTIVE', 'REVOKED', 'EXPIRED', 'USED'],
    default: 'ACTIVE'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  lastUsedAt: Date,
  revokedAt: Date,
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revokedReason: String,
  
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: 100 // Maximum number of times this token can be used
  },
  
  // Security
  family: {
    type: String,
    required: true // Token family for rotation detection
  },
  previousTokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RefreshToken'
  },
  
  // Metadata
  metadata: {
    location: {
      country: String,
      city: String,
      region: String
    },
    browser: String,
    os: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
refreshTokenSchema.index({ userId: 1, status: 1 });
refreshTokenSchema.index({ hashedToken: 1 });
refreshTokenSchema.index({ deviceId: 1 });
refreshTokenSchema.index({ family: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

// Pre-save middleware to hash token
refreshTokenSchema.pre('save', async function(next) {
  if (!this.isModified('token')) return next();
  
  try {
    // Hash the token for secure storage
    this.hashedToken = crypto.createHash('sha256').update(this.token).digest('hex');
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return this.status === 'ACTIVE' && 
         this.expiresAt > new Date() && 
         this.usageCount < this.maxUsage;
};

// Instance method to use token
refreshTokenSchema.methods.use = async function() {
  if (!this.isValid()) {
    throw new Error('Token is not valid');
  }
  
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  
  // If usage count reaches max, revoke the token
  if (this.usageCount >= this.maxUsage) {
    this.status = 'USED';
  }
  
  await this.save();
  return this;
};

// Instance method to revoke token
refreshTokenSchema.methods.revoke = async function(revokedBy, reason) {
  this.status = 'REVOKED';
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revokedReason = reason;
  
  await this.save();
  return this;
};

// Static method to generate secure token
refreshTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(64).toString('hex');
};

// Static method to create new refresh token
refreshTokenSchema.statics.createToken = async function(userId, deviceInfo, options = {}) {
  try {
    const token = this.generateToken();
    const family = options.family || crypto.randomUUID();
    const expiresAt = new Date(Date.now() + (options.expiryDays || 7) * 24 * 60 * 60 * 1000);
    
    const refreshToken = new this({
      userId,
      token,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType || 'WEB',
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      expiresAt,
      family,
      previousTokenId: options.previousTokenId,
      metadata: deviceInfo.metadata || {},
      maxUsage: options.maxUsage || 100
    });
    
    await refreshToken.save();
    
    return {
      success: true,
      token,
      tokenId: refreshToken._id,
      expiresAt,
      family
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create refresh token',
      error: error.message
    };
  }
};

// Static method to verify token
refreshTokenSchema.statics.verifyToken = async function(token) {
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const refreshToken = await this.findOne({
      hashedToken,
      status: 'ACTIVE'
    }).populate('userId');
    
    if (!refreshToken) {
      return { success: false, message: 'Invalid or expired token' };
    }
    
    if (!refreshToken.isValid()) {
      await refreshToken.revoke(null, 'Token expired or max usage reached');
      return { success: false, message: 'Token expired or max usage reached' };
    }
    
    return {
      success: true,
      token: refreshToken,
      user: refreshToken.userId
    };
  } catch (error) {
    return {
      success: false,
      message: 'Token verification failed',
      error: error.message
    };
  }
};

// Static method to rotate token (create new and revoke old)
refreshTokenSchema.statics.rotateToken = async function(oldToken, deviceInfo) {
  try {
    const verification = await this.verifyToken(oldToken);
    
    if (!verification.success) {
      return verification;
    }
    
    const oldTokenDoc = verification.token;
    
    // Create new token in the same family
    const newTokenResult = await this.createToken(
      oldTokenDoc.userId._id,
      deviceInfo,
      {
        family: oldTokenDoc.family,
        previousTokenId: oldTokenDoc._id
      }
    );
    
    if (!newTokenResult.success) {
      return newTokenResult;
    }
    
    // Revoke old token
    await oldTokenDoc.revoke(oldTokenDoc.userId._id, 'Token rotated');
    
    return {
      success: true,
      token: newTokenResult.token,
      tokenId: newTokenResult.tokenId,
      expiresAt: newTokenResult.expiresAt,
      user: oldTokenDoc.userId
    };
  } catch (error) {
    return {
      success: false,
      message: 'Token rotation failed',
      error: error.message
    };
  }
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, revokedBy, reason) {
  try {
    const result = await this.updateMany(
      { 
        userId, 
        status: 'ACTIVE' 
      },
      {
        $set: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedBy,
          revokedReason: reason || 'All tokens revoked'
        }
      }
    );
    
    return {
      success: true,
      revokedCount: result.modifiedCount
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to revoke tokens',
      error: error.message
    };
  }
};

// Static method to revoke tokens by device
refreshTokenSchema.statics.revokeDeviceTokens = async function(userId, deviceId, revokedBy, reason) {
  try {
    const result = await this.updateMany(
      { 
        userId, 
        deviceId,
        status: 'ACTIVE' 
      },
      {
        $set: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedBy,
          revokedReason: reason || 'Device tokens revoked'
        }
      }
    );
    
    return {
      success: true,
      revokedCount: result.modifiedCount
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to revoke device tokens',
      error: error.message
    };
  }
};

// Static method to cleanup expired tokens
refreshTokenSchema.statics.cleanupExpired = async function() {
  try {
    const result = await this.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: { $in: ['REVOKED', 'EXPIRED', 'USED'] } }
      ]
    });
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

// Static method to get user's active sessions
refreshTokenSchema.statics.getUserSessions = async function(userId) {
  try {
    const sessions = await this.find({
      userId,
      status: 'ACTIVE'
    }).select('deviceName deviceType userAgent ipAddress lastUsedAt createdAt metadata').sort({ lastUsedAt: -1 });
    
    return sessions;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

// Static method to detect token reuse (security feature)
refreshTokenSchema.statics.detectTokenReuse = async function(family) {
  try {
    const familyTokens = await this.find({ family }).sort({ createdAt: 1 });
    
    // If there are multiple active tokens in the same family, it's a potential security issue
    const activeTokens = familyTokens.filter(token => token.status === 'ACTIVE');
    
    if (activeTokens.length > 1) {
      // Revoke all tokens in this family
      await this.updateMany(
        { family },
        {
          $set: {
            status: 'REVOKED',
            revokedAt: new Date(),
            revokedReason: 'Token reuse detected - security breach'
          }
        }
      );
      
      return {
        reuseDetected: true,
        revokedCount: familyTokens.length
      };
    }
    
    return { reuseDetected: false };
  } catch (error) {
    console.error('Error detecting token reuse:', error);
    return { reuseDetected: false, error: error.message };
  }
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);