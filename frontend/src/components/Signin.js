import { useState } from 'react';
import { useRouter } from 'next/router';
import { Heart, Mail, Lock } from 'lucide-react';
import styles from '@/styles/Signin.module.css';
import { authService } from '../services/authService';


export default function Signin() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});

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

 const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const result = await authService.signin({
          email: formData.email,
          password: formData.password
        });

        if (result.success) {
          alert(`Welcome back, ${result.data.user.name}!`);
          
          // 🔥 ADD THIS PART - Redirect based on user role after signin
          if (result.data.user.role === 'PATIENT') {
            router.push('/patient-dashboard');
          } else if (result.data.user.role === 'DOCTOR') {
            router.push('/coming-soon?role=doctor');
          } else if (result.data.user.role === 'ADMIN') {
            router.push('/coming-soon?role=admin');
          } else {
            router.push('/'); // Fallback to home
          }
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Signin error:', error);
        alert('An unexpected error occurred. Please try again.');
      }
    } else {
      setErrors(newErrors);
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
              <h1 className={styles.formTitle}>Sign In</h1>
              <p className={styles.formSubtitle}>Access your RapidCare account</p>

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
                <button type="submit" className={styles.submitBtn}>
                  Sign In
                </button>
              </form>

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