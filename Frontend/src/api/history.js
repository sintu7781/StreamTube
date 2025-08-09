import axiosInstance from "../lib/axios";
import { WATCH_HISTORY_ENDPOINTS } from "./endpoints";

// Get user's watch history
export const getWatchHistory = async (params = {}) => {
  try {
    const response = await axiosInstance.get(WATCH_HISTORY_ENDPOINTS.GET_HISTORY, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add video to watch history
export const addToHistory = async (watchData) => {
  try {
    const response = await axiosInstance.post(WATCH_HISTORY_ENDPOINTS.ADD_HISTORY, watchData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove video from watch history
export const removeFromHistory = async (videoId) => {
  try {
    const response = await axiosInstance.delete(WATCH_HISTORY_ENDPOINTS.REMOVE_FROM_HISTORY(videoId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Clear all watch history
export const clearHistory = async () => {
  try {
    const response = await axiosInstance.delete(WATCH_HISTORY_ENDPOINTS.CLEAR_HISTORY);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search watch history
export const searchHistory = async (query) => {
  try {
    const response = await axiosInstance.get(WATCH_HISTORY_ENDPOINTS.GET_HISTORY, { 
      params: { q: query } 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
