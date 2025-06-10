const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minLength: [2, 'Name must be at least 2 characters'],
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  
  mobile: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        if (v && v.trim() !== '') {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        }
        return true;
      },
      message: 'Please enter a valid mobile number'
    },
    set: function(v) {
      if (v === '' || v === null || v === undefined) {
        return undefined;
      }
      return v.trim();
    }
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['PATIENT', 'DOCTOR', 'ADMIN'],
      message: 'Role must be either PATIENT, DOCTOR, or ADMIN'
    },
    default: 'PATIENT'
  },
  
  status: {
    type: String,
    enum: {
      values: ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
      message: 'Invalid status value'
    },
    default: 'PENDING_VERIFICATION'
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationOTP: {
    type: String,
    select: false
  },
  
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  profile: {
    avatar: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: false
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  doctorInfo: {
    specialization: {
      type: String,
      default: null
    },
    qualifications: [{
      degree: String,
      institution: String,
      year: Number
    }],
    experience: {
      type: Number,
      default: 0
    },
    license: {
      number: String,
      issuedBy: String,
      expiryDate: Date
    },
    consultationFee: {
      type: Number,
      default: 0
    },
    availableSlots: [{
      day: {
        type: String,
        enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      startTime: String,
      endTime: String
    }]
  },
  
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  lastLoginAt: {
    type: Date,
    default: null
  },
  
  loginCount: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
  
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationOTP;
      delete ret.emailVerificationExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true 
  }
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Virtual for profile completion
userSchema.virtual('profileCompletion').get(function() {
  let completion = 0;
  const fields = ['name', 'email', 'mobile', 'profile.dateOfBirth', 'profile.gender'];
  
  fields.forEach(field => {
    const value = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj?.[key], this)
      : this[field];
    
    if (value) completion += 20;
  });
  
  return Math.min(completion, 100);
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'doctorInfo.specialization': 1, 'status': 1 });
userSchema.index({ 'doctorInfo.consultationFee': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate email verification OTP
userSchema.methods.generateEmailVerificationOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP = otp;
  this.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  return otp;
};

// Instance method to verify email OTP
userSchema.methods.verifyEmailOTP = function(otp) {
  return (
    this.emailVerificationOTP === otp &&
    this.emailVerificationExpires &&
    this.emailVerificationExpires > new Date()
  );
};

// Static method to find active doctors
userSchema.statics.findActiveDoctors = function() {
  return this.find({ 
    role: 'DOCTOR', 
    status: 'ACTIVE',
    emailVerified: true 
  });
};

// Static method to find doctors by specialization
userSchema.statics.findDoctorsBySpecialization = function(specialization) {
  return this.find({ 
    role: 'DOCTOR', 
    status: 'ACTIVE',
    emailVerified: true,
    'doctorInfo.specialization': specialization 
  });
};

// Remove password when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;