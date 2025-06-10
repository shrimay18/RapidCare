const User = require('../models/User');

class DoctorService {
  // Service layer for complex doctor operations
  
  async searchDoctors(filters) {
    try {
      const {
        search,
        specialization,
        location,
        minFee,
        maxFee,
        minExperience,
        availability
      } = filters;

      let query = {
        role: 'DOCTOR',
        status: 'ACTIVE',
        emailVerified: true
      };

      // Build complex search query
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { name: searchRegex },
          { 'doctorInfo.specialization': searchRegex },
          { 'profile.address.city': searchRegex }
        ];
      }

      if (specialization && specialization !== 'All') {
        query['doctorInfo.specialization'] = new RegExp(specialization, 'i');
      }

      if (location) {
        query['profile.address.city'] = new RegExp(location, 'i');
      }

      if (minFee || maxFee) {
        query['doctorInfo.consultationFee'] = {};
        if (minFee) query['doctorInfo.consultationFee'].$gte = Number(minFee);
        if (maxFee) query['doctorInfo.consultationFee'].$lte = Number(maxFee);
      }

      if (minExperience) {
        query['doctorInfo.experience'] = { $gte: Number(minExperience) };
      }

      return await User.find(query)
        .select('name email profile doctorInfo createdAt mobile')
        .lean();

    } catch (error) {
      throw new Error(`Doctor search failed: ${error.message}`);
    }
  }

  async updateDoctorProfile(doctorId, profileData) {
    try {
      const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR' });
      
      if (!doctor) {
        throw new Error('Doctor not found');
      }

      // Update fields
      Object.keys(profileData).forEach(key => {
        if (key.startsWith('doctorInfo.')) {
          const field = key.replace('doctorInfo.', '');
          if (!doctor.doctorInfo) doctor.doctorInfo = {};
          doctor.doctorInfo[field] = profileData[key];
        } else if (key.startsWith('profile.')) {
          const field = key.replace('profile.', '');
          if (!doctor.profile) doctor.profile = {};
          doctor.profile[field] = profileData[key];
        } else {
          doctor[key] = profileData[key];
        }
      });

      await doctor.save();
      return doctor;

    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  async getDoctorsBySpecialization(specialization, limit = 10) {
    try {
      return await User.find({
        role: 'DOCTOR',
        status: 'ACTIVE',
        emailVerified: true,
        'doctorInfo.specialization': new RegExp(specialization, 'i')
      })
      .select('name email profile doctorInfo')
      .limit(limit)
      .lean();

    } catch (error) {
      throw new Error(`Get doctors by specialization failed: ${error.message}`);
    }
  }

  async getDoctorStats() {
    try {
      const totalDoctors = await User.countDocuments({ role: 'DOCTOR' });
      const activeDoctors = await User.countDocuments({ 
        role: 'DOCTOR', 
        status: 'ACTIVE' 
      });
      const verifiedDoctors = await User.countDocuments({ 
        role: 'DOCTOR', 
        emailVerified: true 
      });

      return {
        totalDoctors,
        activeDoctors,
        verifiedDoctors,
        pendingVerification: totalDoctors - verifiedDoctors
      };
    } catch (error) {
      throw new Error(`Get doctor stats failed: ${error.message}`);
    }
  }

  async getTopSpecializations(limit = 10) {
    try {
      return await User.aggregate([
        {
          $match: {
            role: 'DOCTOR',
            status: 'ACTIVE',
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
        },
        {
          $limit: limit
        }
      ]);
    } catch (error) {
      throw new Error(`Get top specializations failed: ${error.message}`);
    }
  }

  async validateDoctorProfile(profileData) {
    const errors = [];

    if (profileData.specialization && profileData.specialization.length < 2) {
      errors.push('Specialization must be at least 2 characters long');
    }

    if (profileData.experience && profileData.experience < 0) {
      errors.push('Experience cannot be negative');
    }

    if (profileData.consultationFee && profileData.consultationFee < 0) {
      errors.push('Consultation fee cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new DoctorService();