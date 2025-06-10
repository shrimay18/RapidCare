import api, { apiHelpers } from '../lib/api';

const doctorService = {
  // Get all doctors with search and filtering
  getAllDoctors: async (searchParams = {}) => {
    try {
      const { 
        search, 
        specialization, 
        page = 1, 
        limit = 12,
        sortBy = 'name',
        sortOrder = 'asc',
        minFee,
        maxFee
      } = searchParams;
      
      // Build query parameters
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (specialization && specialization !== 'All') params.specialization = specialization;
      params.page = page.toString();
      params.limit = limit.toString();
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
      if (minFee) params.minFee = minFee.toString();
      if (maxFee) params.maxFee = maxFee.toString();

      console.log('🔍 Fetching doctors with params:', params);
      
      // Use the helper function for cleaner code
      const response = await apiHelpers.doctors.getAll(params);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Get doctors error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctors',
        data: { doctors: [] },
        pagination: { currentPage: 1, totalPages: 1, totalDoctors: 0 }
      };
    }
  },

  // Get available specializations
  getSpecializations: async () => {
    try {
      console.log('🔍 Fetching specializations...');
      const response = await apiHelpers.doctors.getSpecializations();
      
      return {
        success: true,
        data: response.data.data.specializations,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Get specializations error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch specializations',
        data: ['All'] // Fallback
      };
    }
  },

  // Update doctor profile (for logged-in doctors)
  updateProfile: async (profileData) => {
    try {
      console.log('🔄 Updating doctor profile...', profileData);
      const response = await apiHelpers.doctors.updateProfile(profileData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Update doctor profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },

  // Get doctor by ID
  getDoctorById: async (doctorId) => {
    try {
      console.log(`🔍 Fetching doctor details for ID: ${doctorId}`);
      const response = await apiHelpers.doctors.getById(doctorId);
      
      return {
        success: true,
        data: response.data.data.doctor,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Get doctor by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor details'
      };
    }
  },

  // Get doctor statistics
  getDoctorStats: async () => {
    try {
      console.log('📊 Fetching doctor statistics...');
      const response = await apiHelpers.doctors.getStats();
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Get doctor stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor statistics'
      };
    }
  },

  // Search doctors with advanced filters
  searchDoctors: async (filters) => {
    try {
      const {
        query = '',
        specialization = 'All',
        location = '',
        minFee = '',
        maxFee = '',
        minExperience = '',
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        limit = 12
      } = filters;

      const searchParams = {
        search: query,
        specialization,
        page,
        limit,
        sortBy,
        sortOrder
      };

      // Add optional filters
      if (location.trim()) searchParams.location = location;
      if (minFee) searchParams.minFee = minFee;
      if (maxFee) searchParams.maxFee = maxFee;
      if (minExperience) searchParams.minExperience = minExperience;

      return await doctorService.getAllDoctors(searchParams);
    } catch (error) {
      console.error('❌ Search doctors error:', error);
      return {
        success: false,
        message: 'Failed to search doctors',
        data: { doctors: [] },
        pagination: { currentPage: 1, totalPages: 1, totalDoctors: 0 }
      };
    }
  },

  // Get doctors by specialization (quick lookup)
  getDoctorsBySpecialization: async (specialization, limit = 10) => {
    try {
      const response = await doctorService.getAllDoctors({
        specialization,
        limit,
        page: 1
      });

      return {
        success: response.success,
        data: response.data.doctors,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Get doctors by specialization error:', error);
      return {
        success: false,
        message: 'Failed to fetch doctors by specialization',
        data: []
      };
    }
  },

  // Utility functions
  utils: {
    // Format doctor data for display
    formatDoctorData: (doctor) => {
      return {
        ...doctor,
        displayName: doctor.name,
        displaySpecialization: doctor.specialization || 'General Physician',
        displayExperience: doctor.experience || '0 years',
        displayPrice: doctor.price || '$100',
        displayLocation: doctor.location || 'Location not specified',
        displayPhone: doctor.phone || 'Not provided',
        isAvailable: doctor.isActive !== false
      };
    },

    // Create search query string
    createSearchQuery: (params) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] && params[key] !== 'All') {
          searchParams.append(key, params[key]);
        }
      });
      return searchParams.toString();
    },

    // Parse consultation fee
    parseFee: (feeString) => {
      if (typeof feeString === 'number') return feeString;
      return parseFloat(feeString?.replace(/[^\d.]/g, '')) || 0;
    },

    // Parse experience
    parseExperience: (expString) => {
      if (typeof expString === 'number') return expString;
      return parseInt(expString?.replace(/[^\d]/g, '')) || 0;
    },

    // Validate doctor profile data
    validateProfileData: (profileData) => {
      const errors = [];

      if (profileData.specialization && profileData.specialization.length < 2) {
        errors.push('Specialization must be at least 2 characters long');
      }

      if (profileData.experience) {
        const exp = doctorService.utils.parseExperience(profileData.experience);
        if (exp < 0 || exp > 50) {
          errors.push('Experience must be between 0 and 50 years');
        }
      }

      if (profileData.consultationFee) {
        const fee = doctorService.utils.parseFee(profileData.consultationFee);
        if (fee < 0 || fee > 10000) {
          errors.push('Consultation fee must be between $0 and $10,000');
        }
      }

      if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone)) {
        errors.push('Please enter a valid phone number');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    },

    // Format display text
    formatDisplayText: {
      experience: (years) => {
        if (!years || years === 0) return '0 years';
        return years === 1 ? '1 year' : `${years} years`;
      },
      
      fee: (amount) => {
        if (!amount || amount === 0) return '$0';
        return `${amount}`;
      },
      
      rating: (rating) => {
        return parseFloat(rating || 4.5).toFixed(1);
      },
      
      joinedDate: (date) => {
        if (!date) return 'Recently joined';
        const joinDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return 'Recently joined';
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
      }
    }
  }
};

export default doctorService;