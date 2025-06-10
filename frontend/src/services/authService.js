import api from '../lib/api';

export const authService = {
  signup: async (userData) => {
    try {
      console.log('🔍 Sending signup request:', userData);
      console.log('🔍 API Base URL:', api.defaults.baseURL);
      console.log('🔍 Full request URL:', `${api.defaults.baseURL}/api/auth/register`);
      
      const response = await api.post('/api/auth/register', userData);
      
      // Store user data and token after successful signup
      if (response.data.data && response.data.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Store token if provided
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
        }
      }
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Account created successfully!'
      };
    } catch (error) {
      console.error('❌ Signup error details:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', error.response?.data);
      console.error('Full Error:', error);
      
      // Extract error message from response
      let errorMessage = 'Signup failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          errorMessage = validationErrors.map(err => err.message || err.msg).join(', ');
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors
      };
    }
  },

  signin: async (credentials) => {
    try {
      console.log('Sending signin request:', credentials); // Debug log
      const response = await api.post('/api/auth/signin', credentials);
      
      // Store user data and token after successful signin
      if (response.data.data && response.data.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Store token if provided
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
        }
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Welcome back!'
      };
    } catch (error) {
      console.error('Signin error:', error.response?.data || error.message);
      
      // Extract error message from response
      let errorMessage = 'Signin failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // NEW: Email verification function
  verifyEmail: async (email, otp) => {
    try {
      console.log('🔍 Sending email verification request:', { email, otp });
      
      const response = await api.post('/api/auth/verify-email', {
        email,
        otp
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Email verified successfully!'
      };
    } catch (error) {
      console.error('❌ Email verification error:', error);
      
      let errorMessage = 'Email verification failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // NEW: Resend verification OTP function
  resendVerificationOTP: async (email) => {
    try {
      console.log('🔍 Sending resend OTP request for email:', email);
      
      const response = await api.post('/api/auth/resend-verification', {
        email
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Verification code sent successfully!'
      };
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      
      let errorMessage = 'Failed to resend verification code. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get current token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    return !!(user && token);
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },

  // Logout user
  logout: () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  // Update user data in localStorage (useful for profile updates)
  updateUserData: (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  }
};

export default authService;