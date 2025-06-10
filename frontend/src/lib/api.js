import axios from 'axios';

// API URLs for different services
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3001';
const MAIN_API_URL = process.env.NEXT_PUBLIC_MAIN_API_URL || 'http://localhost:5000';

// Legacy API_URL for existing code compatibility
const API_URL = AUTH_API_URL + '/api';

// Create axios instance for auth-service (your existing service)
const authApi = axios.create({
  baseURL: AUTH_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for main-backend (new generic backend)
const mainApi = axios.create({
  baseURL: MAIN_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to add auth token to config
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Helper function to handle token refresh
const handleTokenRefresh = async (originalRequest) => {
  try {
    console.log('🔄 Attempting token refresh...');
    
    const response = await axios.post(
      `${API_URL}/auth/refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true
      }
    );

    if (response.data.token) {
      console.log('✅ Token refreshed successfully');
      localStorage.setItem('token', response.data.token);
      
      // Update the original request with new token
      originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
      return originalRequest;
    }
  } catch (refreshError) {
    console.error('❌ Token refresh failed:', refreshError);
    // If refresh token fails, logout the user
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Only redirect if we're not already on signin page
    if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
      window.location.href = '/signin';
    }
    throw refreshError;
  }
};

// Request interceptor for auth-service
authApi.interceptors.request.use(
  (config) => {
    const configWithAuth = addAuthToken(config);
    console.log('📡 Auth API Request:', configWithAuth.method?.toUpperCase(), configWithAuth.url);
    return configWithAuth;
  },
  (error) => {
    console.error('❌ Auth API Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for auth-service
authApi.interceptors.response.use(
  (response) => {
    console.log('✅ Auth API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ Auth API Response error:', error.response?.status, error.config?.url);
    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const updatedRequest = await handleTokenRefresh(originalRequest);
        return authApi(updatedRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Request interceptor for main-backend
mainApi.interceptors.request.use(
  (config) => {
    const configWithAuth = addAuthToken(config);
    console.log('📡 Main API Request:', configWithAuth.method?.toUpperCase(), configWithAuth.url);
    return configWithAuth;
  },
  (error) => {
    console.error('❌ Main API Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for main-backend
mainApi.interceptors.response.use(
  (response) => {
    console.log('✅ Main API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ Main API Response error:', error.response?.status, error.config?.url);
    const originalRequest = error.config;

    // Handle 401 errors with token refresh (using auth-service)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const updatedRequest = await handleTokenRefresh(originalRequest);
        return mainApi(updatedRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Smart API router - automatically chooses the right service
const createSmartApi = () => {
  return {
    get: (url, config = {}) => {
      if (url.startsWith('/api/doctors')) {
        // Doctor-related requests go to main-backend
        return mainApi.get(url, config);
      } else {
        // All other requests go to auth-service
        return authApi.get(url, config);
      }
    },
    
    post: (url, data, config = {}) => {
      if (url.startsWith('/api/doctors')) {
        return mainApi.post(url, data, config);
      } else {
        return authApi.post(url, data, config);
      }
    },
    
    put: (url, data, config = {}) => {
      if (url.startsWith('/api/doctors')) {
        return mainApi.put(url, data, config);
      } else {
        return authApi.put(url, data, config);
      }
    },
    
    delete: (url, config = {}) => {
      if (url.startsWith('/api/doctors')) {
        return mainApi.delete(url, config);
      } else {
        return authApi.delete(url, config);
      }
    },
    
    patch: (url, data, config = {}) => {
      if (url.startsWith('/api/doctors')) {
        return mainApi.patch(url, data, config);
      } else {
        return authApi.patch(url, data, config);
      }
    }
  };
};

// Create the smart API instance
const api = createSmartApi();

// Export individual service APIs for specific use cases
export { authApi, mainApi };

// Export API_URL for backward compatibility
export { API_URL };

// Export the smart API as default
export default api;

// Helper functions for specific services
export const apiHelpers = {
  // Auth service helpers
  auth: {
    login: (credentials) => authApi.post('/api/auth/login', credentials),
    register: (userData) => authApi.post('/api/auth/register', userData),
    verifyEmail: (data) => authApi.post('/api/auth/verify-email', data),
    forgotPassword: (email) => authApi.post('/api/auth/forgot-password', { email }),
    resetPassword: (data) => authApi.post('/api/auth/reset-password', data),
    refreshToken: () => authApi.post('/api/auth/refresh-token'),
    logout: () => authApi.post('/api/auth/logout'),
    getProfile: () => authApi.get('/api/auth/profile'),
    updateProfile: (data) => authApi.put('/api/auth/profile', data)
  },
  
  // Doctor service helpers
  doctors: {
    getAll: (params) => mainApi.get('/api/doctors', { params }),
    getById: (id) => mainApi.get(`/api/doctors/${id}`),
    getSpecializations: () => mainApi.get('/api/doctors/specializations'),
    updateProfile: (data) => mainApi.put('/api/doctors/profile', data),
    getStats: () => mainApi.get('/api/doctors/stats')
  },
  
  // Utility functions
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};