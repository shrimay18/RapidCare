import { useState } from 'react';
import { useRouter } from 'next/router';
import { Heart, User, Mail, Phone, UserCheck, Lock } from 'lucide-react';
import styles from '@/styles/Signup.module.css';
import { authService } from '../services/authService';


export default function Signup() {
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      try {
        const result = await authService.signup({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          mobile: formData.mobile || null,
          password: formData.password
        });

        if (result.success) {
          alert(`Welcome ${result.data.user.name}! Account created successfully.`);
          
          if (result.data.user.role === 'PATIENT') {
            router.push('/patient-dashboard');
          } else if (result.data.user.role === 'DOCTOR') {
            router.push('/coming-soon?role=doctor');
          } else if (result.data.user.role === 'ADMIN') {
            router.push('/coming-soon?role=admin');
          } else {
            router.push('/signin'); // Fallback
          }
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Signup error:', error);
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

      {/* Signup Section */}
      <div className={styles.signupSection}>
        <div className={styles.signupContainer}>
          {/* Left Side - Slogan */}
          <div className={styles.sloganSide}>
            <div className={styles.sloganContent}>
              <h2 className={styles.slogan}>
                Join the Future of
                <span className={styles.sloganAccent}>Healthcare</span>
              </h2>
              <p className={styles.sloganDescription}>
                Whether you're a healthcare provider or seeking quality care, 
                RapidCare connects you to a comprehensive healthcare ecosystem 
                designed for the modern world.
              </p>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className={styles.formSide}>
            <div className={styles.formContainer}>
              <h1 className={styles.formTitle}>Sign Up</h1>
              <p className={styles.formSubtitle}>Create your RapidCare account</p>

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
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
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
                <button type="submit" className={styles.submitBtn}>
                  Create Account
                </button>
              </form>

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