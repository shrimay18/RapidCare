// frontend/src/lib/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // Changed from 5000 to 3001
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Response error:', error);
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
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
          // Store the new token
          localStorage.setItem('token', response.data.token);

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        // If refresh token fails, logout the user
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;