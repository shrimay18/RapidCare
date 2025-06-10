import { useState } from 'react';
import { useRouter } from 'next/router';
import { Heart, User, Mail, Phone, UserCheck, Lock } from 'lucide-react';
import styles from '@/styles/Signup.module.css';
import authService from '../services/authService';
import { useNotification } from '@/contexts/NotificationContext';

export default function Signup() {
  const { showSuccess, showError } = useNotification();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({
    email: '',
    otp: ''
  });

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVerificationInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const result = await authService.signup({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          mobile: formData.mobile.trim() || undefined, // Send undefined instead of null
          password: formData.password
        });

        if (result.success) {
          // Store the user's role for potential use after verification
          localStorage.setItem('pendingUserRole', formData.role);
          
          // Success notification
          showSuccess('Account created successfully! Please check your email for verification.');
          
          // Set verification email and show verification form
          setVerificationData({
            email: formData.email,  // ← This is the key fix!
            otp: ''
          });
          
          // Show verification form instead of redirecting
          setShowVerification(true);
          
          // Clear form but keep email for verification
          setFormData({
            name: '',
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
            role: ''
          });
          
        } else {
          // Handle different types of errors
          if (result.message && result.message.includes('already exists')) {
            showError('Account already exists with this email. Redirecting to sign in...');
            setTimeout(() => {
              router.push('/signin');
            }, 2000);
          } else {
            showError(result.message || 'Registration failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('Registration error:', error);
        
        // Check if it's a 400 error with user already exists message
        if (error.response?.status === 400) {
          const errorData = error.response.data;
          if (errorData.message && errorData.message.includes('already exists')) {
            showError('Account already exists with this email. Redirecting to sign in...');
            setTimeout(() => {
              router.push('/signin');
            }, 2000);
          } else {
            showError(errorData.message || 'Registration failed. Please try again.');
          }
        } else {
          showError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  // Helper function for role-based redirection after verification
  const redirectBasedOnRole = (userRole) => {
    switch (userRole) {
      case 'DOCTOR':
        router.push('/doctor/dashboard');
        break;
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'PATIENT':
      default:
        router.push('/patient/dashboard');
        break;
    }
  };

  // Enhanced handleVerifyEmail with proper error handling
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    
    if (!verificationData.otp.trim()) {
      showError('Please enter the verification code');
      return;
    }

    if (verificationData.otp.length !== 6) {
      showError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 Attempting email verification...', {
        email: verificationData.email,
        otp: verificationData.otp
      });

      const result = await authService.verifyEmail(
        verificationData.email, 
        verificationData.otp
      );

      console.log('✅ Verification result:', result);

      if (result.success) {
        showSuccess('Email verified successfully! Redirecting...');
        
        // Clear verification data
        setVerificationData({ email: '', otp: '' });
        setShowVerification(false);
        
        // Get user role for redirect
        const userRole = result.data?.user?.role || localStorage.getItem('pendingUserRole') || 'PATIENT';
        
        // Clear pending role from localStorage
        localStorage.removeItem('pendingUserRole');
        
        // Redirect based on role
        setTimeout(() => {
          switch (userRole.toLowerCase()) {
            case 'doctor':
              router.push('/doctor/dashboard');
              break;
            case 'patient':
              router.push('/patient/dashboard');
              break;
            case 'admin':
              router.push('/admin/dashboard');
              break;
            default:
              router.push('/patient/dashboard');
          }
        }, 1500);
      } else {
        // Handle unsuccessful verification
        console.log('❌ Verification failed:', result.message);
        showError(result.message || 'Email verification failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      
      // Handle different types of errors gracefully
      let errorMessage = 'Email verification failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid verification code. Please check and try again.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found. Please register again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Request setup error:', error.message);
        errorMessage = 'Request failed. Please try again.';
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced handleResendOTP with proper error handling
  const handleResendOTP = async () => {
    if (!verificationData.email) {
      showError('Email address not found. Please register again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Resending OTP to:', verificationData.email);
      
      const result = await authService.resendVerificationOTP(verificationData.email);
      
      if (result.success) {
        showSuccess('Verification code sent successfully! Please check your email.');
        // Clear current OTP input
        setVerificationData(prev => ({ ...prev, otp: '' }));
      } else {
        showError(result.message || 'Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      
      let errorMessage = 'Failed to resend verification code. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navContent}>
            {/* Logo */}
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <Heart className={styles.heartIcon} />
              </div>
              <span className={styles.logoText}>RapidCare</span>
            </div>
            
            {/* Back to Home */}
            <div className={styles.navLinks}>
              <button className={styles.backBtn} onClick={handleBackToHome}>
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Signup Section */}
      <div className={styles.signupSection}>
        <div className={styles.signupContainer}>
          {/* Left Side - Slogan */}
          <div className={styles.sloganSide}>
            <div className={styles.sloganContent}>
              <h2 className={styles.slogan}>
                Join RapidCare
                <span className={styles.sloganAccent}>Your Health, Our Priority</span>
              </h2>
              <p className={styles.sloganDescription}>
                Create your account and take the first step towards better healthcare management.
                We're here to make your healthcare journey smoother and more efficient.
              </p>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className={styles.formSide}>
            <div className={styles.formContainer}>
              <h1 className={styles.formTitle}>
                {showVerification ? 'Verify Your Email' : 'Sign Up'}
              </h1>
              <p className={styles.formSubtitle}>
                {showVerification 
                  ? 'Enter the verification code sent to your email'
                  : 'Create your RapidCare account'
                }
              </p>

              {showVerification ? (
                <form onSubmit={handleVerifyEmail} className={styles.form}>
                  {/* OTP Field */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <Mail className={styles.labelIcon} />
                      Verification Code *
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={verificationData.otp}
                      onChange={handleVerificationInputChange}
                      className={styles.input}
                      placeholder="Enter 6-digit verification code"
                      maxLength={6}
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </button>

                  {/* Resend OTP Link */}
                  <div className={styles.resendOTP}>
                    <button 
                      type="button" 
                      className={styles.resendBtn}
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      Resend Verification Code
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  {/* Name Field */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <User className={styles.labelIcon} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                  </div>

                  {/* Email Field */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <Mail className={styles.labelIcon} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                  </div>

                  {/* Role Selection */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <UserCheck className={styles.labelIcon} />
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`${styles.select} ${errors.role ? styles.inputError : ''}`}
                    >
                      <option value="">Select your role</option>
                      <option value="PATIENT">Patient</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    {errors.role && <span className={styles.errorText}>{errors.role}</span>}
                  </div>

                  {/* Password Field */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <Lock className={styles.labelIcon} />
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                      placeholder="Enter your password"
                    />
                    {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                  </div>

                  {/* Confirm Password Field */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <Lock className={styles.labelIcon} />
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                  </div>

                  {/* Mobile Number (Optional) */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <Phone className={styles.labelIcon} />
                      Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Enter your mobile number"
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}

              {/* Sign In Link */}
              <div className={styles.signInLink}>
                <p>Already have an account? 
                  <button className={styles.linkBtn} onClick={handleSignIn}>Sign In</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}