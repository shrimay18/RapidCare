// models/OTP.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const otpSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  
  // OTP Details
  otp: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6
  },
  hashedOTP: {
    type: String,
    required: true
  },
  
  // OTP Type and Purpose
  type: {
    type: String,
    enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFICATION', 'PHONE_VERIFICATION'],
    required: true,
    uppercase: true
  },
  
  // Status and Attempts
  status: {
    type: String,
    enum: ['ACTIVE', 'USED', 'EXPIRED', 'BLOCKED'],
    default: 'ACTIVE',
    uppercase: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  
  // Timing
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  usedAt: Date,
  
  // Security
  ipAddress: String,
  userAgent: String,
  
  // Metadata
  metadata: {
    purpose: String,
    additionalData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better performance
otpSchema.index({ userId: 1, type: 1 });
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ hashedOTP: 1 });
otpSchema.index({ expiresAt: 1 });

// Pre-save middleware to hash OTP
otpSchema.pre('save', async function(next) {
  if (!this.isModified('otp')) return next();
  
  try {
    // Hash the OTP for secure storage
    this.hashedOTP = crypto.createHash('sha256').update(this.otp).digest('hex');
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to verify OTP
otpSchema.methods.verifyOTP = async function(candidateOTP) {
  // Check if OTP is expired
  if (this.expiresAt < new Date()) {
    this.status = 'EXPIRED';
    await this.save();
    return { success: false, message: 'OTP has expired' };
  }
  
  // Check if OTP is already used
  if (this.status === 'USED') {
    return { success: false, message: 'OTP has already been used' };
  }
  
  // Check if max attempts exceeded
  if (this.attempts >= 3) {
    this.status = 'BLOCKED';
    await this.save();
    return { success: false, message: 'Maximum OTP attempts exceeded' };
  }
  
  // Increment attempts
  this.attempts += 1;
  
  // Hash the candidate OTP and compare
  const hashedCandidate = crypto.createHash('sha256').update(candidateOTP).digest('hex');
  
  if (hashedCandidate === this.hashedOTP) {
    // OTP is correct
    this.status = 'USED';
    this.usedAt = new Date();
    await this.save();
    return { success: true, message: 'OTP verified successfully' };
  } else {
    // OTP is incorrect
    await this.save();
    const remainingAttempts = 3 - this.attempts;
    return { 
      success: false, 
      message: `Invalid OTP. ${remainingAttempts} attempts remaining` 
    };
  }
};

// Instance method to check if OTP is valid
otpSchema.methods.isValid = function() {
  return this.status === 'ACTIVE' && 
         this.expiresAt > new Date() && 
         this.attempts < 3;
};

// Static method to generate OTP
otpSchema.statics.generateOTP = function(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Static method to create new OTP
otpSchema.statics.createOTP = async function(userId, email, type, options = {}) {
  try {
    // Invalidate any existing active OTPs for this user and type
    await this.updateMany(
      { 
        userId, 
        type, 
        status: 'ACTIVE' 
      },
      { 
        status: 'EXPIRED' 
      }
    );
    
    // Generate new OTP
    const otpLength = options.length || 6;
    const expiryMinutes = options.expiryMinutes || 10;
    const otp = this.generateOTP(otpLength);
    
    // Create new OTP record
    const newOTP = new this({
      userId,
      email: email.toLowerCase(),
      otp,
      type,
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: options.metadata || {}
    });
    
    await newOTP.save();
    
    return {
      success: true,
      otp,
      otpId: newOTP._id,
      expiresAt: newOTP.expiresAt
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate OTP',
      error: error.message
    };
  }
};

// Static method to verify OTP by email and type
otpSchema.statics.verifyByEmail = async function(email, candidateOTP, type) {
  try {
    const otpRecord = await this.findOne({
      email: email.toLowerCase(),
      type,
      status: 'ACTIVE'
    }).sort({ createdAt: -1 }); // Get the latest OTP
    
    if (!otpRecord) {
      return { success: false, message: 'No active OTP found' };
    }
    
    return await otpRecord.verifyOTP(candidateOTP);
  } catch (error) {
    return {
      success: false,
      message: 'OTP verification failed',
      error: error.message
    };
  }
};

// Static method to cleanup expired OTPs
otpSchema.statics.cleanupExpired = async function() {
  try {
    const result = await this.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: { $in: ['USED', 'EXPIRED'] } }
      ]
    });
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
    return 0;
  }
};

// Static method to get OTP statistics
otpSchema.statics.getStats = async function(userId) {
  try {
    const stats = await this.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          used: {
            $sum: {
              $cond: [{ $eq: ['$status', 'USED'] }, 1, 0]
            }
          },
          expired: {
            $sum: {
              $cond: [{ $eq: ['$status', 'EXPIRED'] }, 1, 0]
            }
          },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    return stats;
  } catch (error) {
    console.error('Error getting OTP stats:', error);
    return [];
  }
};

module.exports = mongoose.model('OTP', otpSchema);