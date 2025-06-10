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
let doctorController;
try {
  doctorController = require('../controllers/doctorController');
  console.log('✅ Doctor controller loaded');
} catch (error) {
  console.error('❌ Error loading doctor controller:', error.message);
  // Create dummy controller for testing
  doctorController = {
    getAllDoctors: (req, res) => res.json({ message: 'Controller not loaded' }),
    getSpecializations: (req, res) => res.json({ message: 'Controller not loaded' }),
    getDoctorById: (req, res) => res.json({ message: 'Controller not loaded' }),
    updateProfile: (req, res) => res.json({ message: 'Controller not loaded' }),
    getDoctorStats: (req, res) => res.json({ message: 'Controller not loaded' })
  };
}

// Validation middleware for query parameters
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number'
    });
  }
  
  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  next();
};

// Route logging middleware
router.use((req, res, next) => {
  console.log(`📡 Doctor Route: ${req.method} ${req.originalUrl}`);
  next();
});

// Static routes first (order matters in Express)
router.get('/test/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor routes are working!',
    timestamp: new Date().toISOString()
  });
});

router.get('/specializations', (req, res, next) => {
  try {
    doctorController.getSpecializations(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', optionalAuth, (req, res, next) => {
  try {
    doctorController.getDoctorStats(req, res);
  } catch (error) {
    next(error);
  }
});

// Root route
router.get('/', validatePagination, (req, res, next) => {
  try {
    doctorController.getAllDoctors(req, res);
  } catch (error) {
    next(error);
  }
});

// Protected routes (require authentication)
router.put('/profile', auth, authorize('DOCTOR'), (req, res, next) => {
  try {
    doctorController.updateProfile(req, res);
  } catch (error) {
    next(error);
  }
});

// Dynamic routes last (order matters in Express)
router.get('/:doctorId', (req, res, next) => {
  try {
    // Validate doctorId format
    const { doctorId } = req.params;
    if (!doctorId || doctorId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }
    doctorController.getDoctorById(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;