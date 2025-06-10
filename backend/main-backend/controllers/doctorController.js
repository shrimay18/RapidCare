const User = require('../models/User');
const { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  notFoundResponse 
} = require('../utils/responses');

class DoctorController {
  // Get all active doctors with search and filtering
  async getAllDoctors(req, res) {
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
      } = req.query;

      console.log('🔍 Getting doctors with filters:', { 
        search, 
        specialization, 
        page, 
        limit,
        sortBy,
        sortOrder,
        minFee,
        maxFee
      });

      // Build query for active, verified doctors
      let query = {
        role: 'DOCTOR',
        status: 'ACTIVE',
        emailVerified: true
      };

      // Add search filter
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: searchRegex },
          { 'doctorInfo.specialization': searchRegex }
        ];
      }

      // Add specialization filter
      if (specialization && specialization !== 'All' && specialization.trim()) {
        query['doctorInfo.specialization'] = new RegExp(specialization.trim(), 'i');
      }

      // Add fee range filter
      if (minFee || maxFee) {
        query['doctorInfo.consultationFee'] = {};
        if (minFee) query['doctorInfo.consultationFee'].$gte = Number(minFee);
        if (maxFee) query['doctorInfo.consultationFee'].$lte = Number(maxFee);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions = {};
      
      // Handle different sort options
      if (sortBy === 'experience') {
        sortOptions['doctorInfo.experience'] = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'fee') {
        sortOptions['doctorInfo.consultationFee'] = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'joined') {
        sortOptions['createdAt'] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Execute query with aggregation for better performance
      const doctors = await User.find(query)
        .select('name email profile doctorInfo createdAt mobile')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Transform data for frontend
      const transformedDoctors = doctors.map(doctor => ({
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.doctorInfo?.specialization || 'General Physician',
        experience: doctor.doctorInfo?.experience ? `${doctor.doctorInfo.experience} years` : '0 years',
        experienceYears: doctor.doctorInfo?.experience || 0,
        price: doctor.doctorInfo?.consultationFee ? `$${doctor.doctorInfo.consultationFee}` : '$100',
        consultationFee: doctor.doctorInfo?.consultationFee || 100,
        rating: 4.5, // Default rating - implement rating system later
        location: doctor.profile?.address?.city || 
                 doctor.profile?.address?.state || 
                 'Location not specified',
        phone: doctor.mobile || 'Not provided',
        image: doctor.profile?.avatar || null,
        qualifications: doctor.doctorInfo?.qualifications || [],
        availableSlots: doctor.doctorInfo?.availableSlots || [],
        joinedDate: doctor.createdAt,
        isActive: doctor.status === 'ACTIVE'
      }));

      // Get total count for pagination
      const totalDoctors = await User.countDocuments(query);
      const totalPages = Math.ceil(totalDoctors / limit);

      const pagination = {
        currentPage: parseInt(page),
        totalPages,
        totalDoctors,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit: parseInt(limit)
      };

      console.log(`✅ Found ${transformedDoctors.length} doctors out of ${totalDoctors} total`);

      return paginatedResponse(res, 'Doctors retrieved successfully', {
        doctors: transformedDoctors
      }, pagination);

    } catch (error) {
      console.error('❌ Get doctors error:', error);
      return errorResponse(res, 'Failed to retrieve doctors', 500, {
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get unique specializations for filter dropdown
  async getSpecializations(req, res) {
    try {
      console.log('🔍 Getting available specializations...');

      const specializations = await User.distinct('doctorInfo.specialization', {
        role: 'DOCTOR',
        status: 'ACTIVE',
        emailVerified: true,
        'doctorInfo.specialization': { $exists: true, $ne: null, $ne: '' }
      });

      // Clean and sort specializations
      const cleanSpecializations = ['All', ...specializations
        .filter(s => s && s.trim() !== '')
        .map(s => s.trim())
        .sort()
      ];

      console.log(`✅ Found ${cleanSpecializations.length - 1} unique specializations`);

      return successResponse(res, 'Specializations retrieved successfully', 200, {
        specializations: cleanSpecializations
      });
    } catch (error) {
      console.error('❌ Get specializations error:', error);
      return errorResponse(res, 'Failed to retrieve specializations', 500);
    }
  }

  // Update doctor profile (for doctors)
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const {
        specialization,
        experience,
        consultationFee,
        qualifications,
        hospital,
        location,
        phone,
        availability,
        languages
      } = req.body;

      console.log(`🔄 Updating doctor profile for user: ${userId}`);

      // Find the doctor
      const doctor = await User.findOne({ _id: userId, role: 'DOCTOR' });
      if (!doctor) {
        return notFoundResponse(res, 'Doctor');
      }

      // Parse experience (remove "years" if present)
      let experienceYears = 0;
      if (experience) {
        if (typeof experience === 'string') {
          experienceYears = parseInt(experience.replace(/[^\d]/g, '')) || 0;
        } else {
          experienceYears = parseInt(experience) || 0;
        }
      }

      // Parse consultation fee (remove "$" if present)
      let fee = 0;
      if (consultationFee) {
        if (typeof consultationFee === 'string') {
          fee = parseFloat(consultationFee.replace(/[^\d.]/g, '')) || 0;
        } else {
          fee = parseFloat(consultationFee) || 0;
        }
      }

      // Parse qualifications
      let qualificationsArray = [];
      if (qualifications) {
        if (typeof qualifications === 'string') {
          qualificationsArray = qualifications.split(',').map(q => ({
            degree: q.trim(),
            institution: 'Not specified',
            year: new Date().getFullYear()
          }));
        } else if (Array.isArray(qualifications)) {
          qualificationsArray = qualifications;
        }
      }

      // Update doctor info
      doctor.doctorInfo = {
        ...doctor.doctorInfo,
        specialization: specialization || doctor.doctorInfo?.specialization,
        experience: experienceYears,
        consultationFee: fee,
        qualifications: qualificationsArray
      };

      // Update profile info
      if (!doctor.profile) doctor.profile = {};
      if (!doctor.profile.address) doctor.profile.address = {};
      
      if (location) {
        doctor.profile.address.city = location;
      }

      // Update mobile if provided
      if (phone && phone.trim()) {
        doctor.mobile = phone.trim();
      }

      // Save changes
      await doctor.save();

      console.log('✅ Doctor profile updated successfully');

      // Return updated profile data
      const updatedProfile = {
        specialization: doctor.doctorInfo.specialization,
        experience: `${doctor.doctorInfo.experience} years`,
        consultationFee: `${doctor.doctorInfo.consultationFee}`,
        qualifications: doctor.doctorInfo.qualifications,
        location: doctor.profile.address.city,
        phone: doctor.mobile
      };

      return successResponse(res, 'Profile updated successfully', 200, {
        doctor: updatedProfile
      });

    } catch (error) {
      console.error('❌ Update doctor profile error:', error);
      return errorResponse(res, 'Failed to update profile', 500, {
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get doctor by ID (public endpoint)
  async getDoctorById(req, res) {
    try {
      const { doctorId } = req.params;

      console.log(`🔍 Getting doctor details for ID: ${doctorId}`);

      // Validate ObjectId format
      if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
        return errorResponse(res, 'Invalid doctor ID format', 400);
      }

      const doctor = await User.findOne({
        _id: doctorId,
        role: 'DOCTOR',
        status: 'ACTIVE',
        emailVerified: true
      }).select('name email profile doctorInfo createdAt mobile').lean();

      if (!doctor) {
        return notFoundResponse(res, 'Doctor');
      }

      const transformedDoctor = {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        avatar: doctor.profile?.avatar,
        specialization: doctor.doctorInfo?.specialization || 'General Physician',
        experience: doctor.doctorInfo?.experience || 0,
        experienceText: doctor.doctorInfo?.experience ? `${doctor.doctorInfo.experience} years` : '0 years',
        consultationFee: doctor.doctorInfo?.consultationFee || 100,
        consultationFeeText: doctor.doctorInfo?.consultationFee ? `${doctor.doctorInfo.consultationFee}` : '$100',
        qualifications: doctor.doctorInfo?.qualifications || [],
        availableSlots: doctor.doctorInfo?.availableSlots || [],
        location: doctor.profile?.address?.city || 'Location not specified',
        phone: doctor.mobile || 'Not provided',
        joinedDate: doctor.createdAt,
        rating: 4.5 // Default rating
      };

      console.log(`✅ Found doctor: ${transformedDoctor.name}`);

      return successResponse(res, 'Doctor retrieved successfully', 200, {
        doctor: transformedDoctor
      });
    } catch (error) {
      console.error('❌ Get doctor by ID error:', error);
      return errorResponse(res, 'Failed to retrieve doctor details', 500);
    }
  }

  // Get doctor statistics (for admin or analytics)
  async getDoctorStats(req, res) {
    try {
      console.log('📊 Getting doctor statistics...');

      const stats = await User.aggregate([
        {
          $match: { role: 'DOCTOR', emailVerified: true }
        },
        {
          $group: {
            _id: null,
            totalDoctors: { $sum: 1 },
            activeDoctors: {
              $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
            },
            pendingDoctors: {
              $sum: { $cond: [{ $eq: ['$status', 'PENDING_VERIFICATION'] }, 1, 0] }
            },
            avgConsultationFee: { $avg: '$doctorInfo.consultationFee' },
            avgExperience: { $avg: '$doctorInfo.experience' }
          }
        }
      ]);

      // Get specialization distribution
      const specializationStats = await User.aggregate([
        {
          $match: { 
            role: 'DOCTOR', 
            status: 'ACTIVE', 
            emailVerified: true,
            'doctorInfo.specialization': { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$doctorInfo.specialization',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const result = {
        overview: stats[0] || {
          totalDoctors: 0,
          activeDoctors: 0,
          pendingDoctors: 0,
          avgConsultationFee: 0,
          avgExperience: 0
        },
        specializations: specializationStats
      };

      console.log('✅ Doctor statistics generated');

      return successResponse(res, 'Doctor statistics retrieved successfully', 200, result);
    } catch (error) {
      console.error('❌ Get doctor stats error:', error);
      return errorResponse(res, 'Failed to retrieve doctor statistics', 500);
    }
  }
}

module.exports = new DoctorController();