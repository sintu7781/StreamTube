import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add or update watch history
export const addWatchHistory = async (watchData) => {
  try {
    const response = await api.post('/watch-history/add', watchData);
    return response.data;
  } catch (error) {
    console.error('Error adding watch history:', error);
    throw error.response?.data || error;
  }
};

// Get user watch history
export const getWatchHistory = async (params = {}) => {
  try {
    const response = await api.get('/watch-history', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching watch history:', error);
    throw error.response?.data || error;
  }
};

// Remove video from watch history
export const removeFromWatchHistory = async (videoId) => {
  try {
    const response = await api.delete(`/watch-history/remove/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from watch history:', error);
    throw error.response?.data || error;
  }
};

// Clear entire watch history
export const clearWatchHistory = async () => {
  try {
    const response = await api.delete('/watch-history/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing watch history:', error);
    throw error.response?.data || error;
  }
};
