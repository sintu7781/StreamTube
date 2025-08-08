import { api } from "./endpoints";

// Get user's watch history
export const getWatchHistory = async (params = {}) => {
  try {
    const response = await api.get("/history", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add video to watch history
export const addToHistory = async (videoId) => {
  try {
    const response = await api.post("/history", { videoId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove video from watch history
export const removeFromHistory = async (videoId) => {
  try {
    const response = await api.delete(`/history/${videoId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Clear all watch history
export const clearHistory = async () => {
  try {
    const response = await api.delete("/history");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search watch history
export const searchHistory = async (query) => {
  try {
    const response = await api.get("/history/search", { params: { q: query } });
    return response.data;
  } catch (error) {
    throw error;
  }
};
