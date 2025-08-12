import axiosInstance from "../lib/axios";
import { WATCH_LATER_ENDPOINTS } from "./endpoints";

// Get user's watch later list
export const getWatchLaterList = async (page = 1, limit = 20, sortBy = "addedAt", sortOrder = "desc") => {
  const response = await axiosInstance.get(WATCH_LATER_ENDPOINTS.GET_WATCH_LATER, {
    params: { page, limit, sortBy, sortOrder }
  });
  return response.data;
};

// Get watch later statistics
export const getWatchLaterStats = async () => {
  const response = await axiosInstance.get(WATCH_LATER_ENDPOINTS.GET_WATCH_LATER_STATS);
  return response.data;
};

// Get watch later batch (for infinite scroll)
export const getWatchLaterBatch = async (offset = 0, batchSize = 10) => {
  const response = await axiosInstance.get(WATCH_LATER_ENDPOINTS.GET_WATCH_LATER_BATCH, {
    params: { offset, batchSize }
  });
  return response.data;
};

// Add video to watch later
export const addToWatchLater = async (videoId, notes = "") => {
  const response = await axiosInstance.post(WATCH_LATER_ENDPOINTS.ADD_TO_WATCH_LATER(videoId), {
    notes
  });
  return response.data;
};

// Remove video from watch later
export const removeFromWatchLater = async (videoId) => {
  const response = await axiosInstance.delete(WATCH_LATER_ENDPOINTS.REMOVE_FROM_WATCH_LATER(videoId));
  return response.data;
};

// Toggle video in watch later (add/remove)
export const toggleWatchLater = async (videoId, notes = "") => {
  const response = await axiosInstance.post(WATCH_LATER_ENDPOINTS.TOGGLE_WATCH_LATER(videoId), {
    notes
  });
  return response.data;
};

// Check if video is in watch later
export const checkWatchLaterStatus = async (videoId) => {
  const response = await axiosInstance.get(WATCH_LATER_ENDPOINTS.CHECK_WATCH_LATER_STATUS(videoId));
  return response.data;
};

// Update notes for a watch later item
export const updateWatchLaterNotes = async (videoId, notes) => {
  const response = await axiosInstance.patch(WATCH_LATER_ENDPOINTS.UPDATE_WATCH_LATER_NOTES(videoId), {
    notes
  });
  return response.data;
};

// Reorder watch later list
export const reorderWatchLater = async (videoIds) => {
  const response = await axiosInstance.patch(WATCH_LATER_ENDPOINTS.REORDER_WATCH_LATER, {
    videoIds
  });
  return response.data;
};

// Clear all watch later items
export const clearWatchLater = async () => {
  const response = await axiosInstance.delete(WATCH_LATER_ENDPOINTS.CLEAR_WATCH_LATER);
  return response.data;
};
