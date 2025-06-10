import { useState } from 'react';
import { useRouter } from 'next/router';
import { Heart, Mail, Lock } from 'lucide-react';
import styles from '@/styles/Signin.module.css';
import authService from '../services/authService';
import { useNotification } from '@/contexts/NotificationContext';
import { useEffect } from 'react';


export default function Signin() {
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  // Add this useEffect for auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Role-based redirection
        switch (user.role) {
          case 'DOCTOR':
            router.replace('/doctor-dashboard');
            break;
          case 'ADMIN':
            router.replace('/admin-dashboard');
            break;
          case 'PATIENT':
          default:
            router.replace('/patient-dashboard');
            break;
        }
      } catch (e) {
        // If parsing fails, clear localStorage and stay on signin
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [router]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleSignUp = () => {
    router.push('/signup');
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
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  // Helper function for role-based redirection
  const redirectBasedOnRole = (user) => {
    switch (user.role) {
      case 'DOCTOR':
        router.push('/doctor-dashboard');
        break;
      case 'ADMIN':
        router.push('/admin-dashboard');
        break;
      case 'PATIENT':
      default:
        router.push('/patient-dashboard');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const result = await authService.signin({
          email: formData.email,
          password: formData.password
        });

        if (result.success) {
          const user = result.data.user;
          
          // Check if user needs email verification
          if (user.status === 'PENDING_VERIFICATION' || !user.emailVerified) {
            showError('Please verify your email first. Check your inbox for verification code.');
            setShowVerification(true);
            setVerificationData(prev => ({
              ...prev,
              email: formData.email
            }));
            return;
          }

          // Check if account is suspended or inactive
          if (user.status === 'SUSPENDED') {
            showError('Your account has been suspended. Please contact support.');
            setIsLoading(false);
            return;
          }

          if (user.status === 'INACTIVE') {
            showError('Your account is inactive. Please contact support.');
            setIsLoading(false);
            return;
          }

          // Success message with personalized greeting
          showSuccess(`Welcome back, ${user.name}!`);
          
          // Role-based redirection
          redirectBasedOnRole(user);
          
        } else {
          showError(result.message || 'Signin failed. Please try again.');
        }
      } catch (error) {
        console.error('Signin error:', error);
        showError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
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
        setShowVerification(false);

        // Get updated user data
        const user = result.data.user || authService.getCurrentUser();

        if (user) {
          // Update user data in localStorage
          user.emailVerified = true;
          user.status = 'ACTIVE';
          authService.updateUserData(user);

          // Role-based redirection after verification
          redirectBasedOnRole(user);
        } else {
          // Fallback redirection
          router.push('/patient/dashboard');
        }
      } else {
        // Show notification for wrong OTP or other errors
        showError(result.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      // Always show a notification for any error
      showError(
        error?.response?.data?.message ||
        error?.message ||
        'Verification failed. Please check your OTP and try again.'
      );
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

      {/* Signin Section */}
      <div className={styles.signinSection}>
        <div className={styles.signinContainer}>
          {/* Left Side - Welcome Message */}
          <div className={styles.welcomeSide}>
            <div className={styles.welcomeContent}>
              <h2 className={styles.welcomeTitle}>
                Welcome Back to
                <span className={styles.welcomeAccent}>RapidCare</span>
              </h2>
              <p className={styles.welcomeDescription}>
                Sign in to access your healthcare dashboard and continue your journey 
                towards better health management.
              </p>
            </div>
          </div>

          {/* Right Side - Signin Form */}
          <div className={styles.formSide}>
            <div className={styles.formContainer}>
              <h1 className={styles.formTitle}>
                {showVerification ? 'Verify Your Email' : 'Sign In'}
              </h1>
              <p className={styles.formSubtitle}>
                {showVerification 
                  ? 'Enter the verification code sent to your email'
                  : 'Access your RapidCare account'
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

                  {/* Forgot Password Link */}
                  <div className={styles.forgotPassword}>
                    <button type="button" className={styles.forgotBtn}>
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* Sign Up Link */}
              <div className={styles.signUpLink}>
                <p>Don't have an account? 
                  <button className={styles.linkBtn} onClick={handleSignUp}>Sign Up</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}