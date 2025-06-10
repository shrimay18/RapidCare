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

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await authService.verifyEmail(
        verificationData.email,
        verificationData.otp
      );

      if (result.success) {
        showSuccess('Email verified successfully! Welcome to RapidCare.');
        
        // Get user data to determine role
        const user = result.data.user || authService.getCurrentUser();
        const userRole = user?.role || localStorage.getItem('pendingUserRole') || 'PATIENT';
        
        // Clear pending role from localStorage
        localStorage.removeItem('pendingUserRole');
        
        // Role-based redirection after verification
        redirectBasedOnRole(userRole);
        
      } else {
        showError(result.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      showError('Verification failed. Please check your OTP and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const result = await authService.resendVerificationOTP(verificationData.email);
      
      if (result.success) {
        showSuccess('Verification code sent to your email.');
      } else {
        showError(result.message || 'Failed to resend verification code.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showError('Failed to resend verification code. Please try again.');
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