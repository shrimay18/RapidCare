import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Stethoscope, User, DollarSign, Award, MapPin, Clock, Languages } from 'lucide-react';

const DoctorProfileSetup = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    consultationFee: '',
    qualifications: '',
    hospital: '',
    location: '',
    phone: '',
    availability: '',
    languages: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      router.push('/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'DOCTOR') {
        router.push('/coming-soon?role=' + parsedUser.role.toLowerCase());
        return;
      }

      setUser(parsedUser);
      // Pre-fill email and phone if available
      setFormData(prev => ({
        ...prev,
        phone: parsedUser.mobile || ''
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/signin');
    }
  }, [router]);

  const specializations = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedic Surgeon',
    'Pediatrician',
    'Psychiatrist',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Radiologist',
    'Anesthesiologist',
    'Other'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    }

    if (!formData.consultationFee) {
      newErrors.consultationFee = 'Consultation fee is required';
    }

    if (!formData.qualifications) {
      newErrors.qualifications = 'Qualifications are required';
    }

    if (!formData.hospital) {
      newErrors.hospital = 'Hospital/Clinic name is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      // Save profile data to localStorage (in real app, send to backend)
      const updatedUser = {
        ...user,
        profile: formData,
        profileComplete: true
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Redirect to doctor dashboard
      router.push('/doctor-dashboard');
    } else {
      setErrors(newErrors);
    }
  };

  const handleSkip = () => {
    // Allow user to skip for now and complete later
    router.push('/doctor-dashboard');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.setupCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Stethoscope size={48} style={{ color: '#059669' }} />
          </div>
          <h1 style={styles.title}>Complete Your Doctor Profile</h1>
          <p style={styles.subtitle}>
            Help patients find you by completing your professional profile
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Specialization */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Award size={16} style={{ marginRight: '8px' }} />
                Specialization *
              </label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                style={styles.select}
              >
                <option value="">Select your specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              {errors.specialization && <span style={styles.error}>{errors.specialization}</span>}
            </div>

            {/* Experience */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Clock size={16} style={{ marginRight: '8px' }} />
                Years of Experience *
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                style={styles.input}
                placeholder="e.g., 12 years"
              />
              {errors.experience && <span style={styles.error}>{errors.experience}</span>}
            </div>

            {/* Consultation Fee */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <DollarSign size={16} style={{ marginRight: '8px' }} />
                Consultation Fee *
              </label>
              <input
                type="text"
                value={formData.consultationFee}
                onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                style={styles.input}
                placeholder="e.g., $150 or ₹1500"
              />
              {errors.consultationFee && <span style={styles.error}>{errors.consultationFee}</span>}
            </div>

            {/* Qualifications */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Award size={16} style={{ marginRight: '8px' }} />
                Qualifications *
              </label>
              <input
                type="text"
                value={formData.qualifications}
                onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                style={styles.input}
                placeholder="e.g., MD, FRCP, MBBS"
              />
              {errors.qualifications && <span style={styles.error}>{errors.qualifications}</span>}
            </div>

            {/* Hospital/Clinic */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <MapPin size={16} style={{ marginRight: '8px' }} />
                Hospital/Clinic Name *
              </label>
              <input
                type="text"
                value={formData.hospital}
                onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                style={styles.input}
                placeholder="e.g., City General Hospital"
              />
              {errors.hospital && <span style={styles.error}>{errors.hospital}</span>}
            </div>

            {/* Location */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <MapPin size={16} style={{ marginRight: '8px' }} />
                Location/Address *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                style={styles.input}
                placeholder="e.g., Downtown Medical Center, New York"
              />
              {errors.location && <span style={styles.error}>{errors.location}</span>}
            </div>

            {/* Phone */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={16} style={{ marginRight: '8px' }} />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={styles.input}
                placeholder="e.g., +1 (555) 123-4567"
              />
              {errors.phone && <span style={styles.error}>{errors.phone}</span>}
            </div>

            {/* Availability */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Clock size={16} style={{ marginRight: '8px' }} />
                Availability
              </label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                style={styles.input}
                placeholder="e.g., Mon-Fri: 9AM-5PM"
              />
            </div>

            {/* Languages */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Languages size={16} style={{ marginRight: '8px' }} />
                Languages Spoken
              </label>
              <input
                type="text"
                value={formData.languages}
                onChange={(e) => setFormData({...formData, languages: e.target.value})}
                style={styles.input}
                placeholder="e.g., English, Spanish, Hindi"
              />
            </div>
          </div>

          {/* Bio */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={16} style={{ marginRight: '8px' }} />
              Professional Bio (Optional)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              style={styles.textarea}
              placeholder="Brief description about your practice, expertise, and approach to patient care..."
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.primaryButton}>
              Complete Profile
            </button>
            <button type="button" onClick={handleSkip} style={styles.secondaryButton}>
              Skip for Now
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            You can update this information anytime from your dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loading: {
    fontSize: '18px',
    color: '#6b7280'
  },
  setupCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '800px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  iconContainer: {
    marginBottom: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
    margin: 0
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '16px',
    margin: 0
  },
  form: {
    width: '100%'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  error: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block'
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '32px',
    flexWrap: 'wrap'
  },
  primaryButton: {
    backgroundColor: '#059669',
    color: 'white',
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#374151',
    padding: '12px 32px',
    borderRadius: '8px',
    border: '2px solid #d1d5db',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px',
    transition: 'all 0.2s'
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  footerText: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0
  }
};

export default DoctorProfileSetup;