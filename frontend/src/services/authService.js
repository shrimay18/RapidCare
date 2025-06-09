import api from '../lib/api';

export const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // Store user data and token after successful signup
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
      }
      
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.token
        },
        message: response.data.message || 'Account created successfully!'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.'
      };
    }
  },

  signin: async (credentials) => {
    try {
      const response = await api.post('/api/auth/signin', credentials);
      
      // Store user data and token after successful signin
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
      }

      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.token
        },
        message: response.data.message || 'Welcome back!'
      };
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Signin failed. Please try again.'
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