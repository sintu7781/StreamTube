import { api } from "./endpoints";

// Get channel analytics overview
export const getChannelAnalyticsOverview = async (channelId) => {
  try {
    const response = await api.get(`/analytics/${channelId}/overview`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get channel analytics for a date range
export const getChannelAnalytics = async (channelId, params = {}) => {
  try {
    const response = await api.get(`/analytics/${channelId}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get audience demographics
export const getAudienceDemographics = async (channelId) => {
  try {
    const response = await api.get(`/analytics/${channelId}/demographics`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create or update analytics
export const createOrUpdateAnalytics = async (channelId, data) => {
  try {
    const response = await api.post(`/analytics/${channelId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete analytics for a specific date
export const deleteAnalytics = async (channelId, date) => {
  try {
    const response = await api.delete(`/analytics/${channelId}/${date}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Bulk update analytics
export const bulkUpdateAnalytics = async (channelId, analytics) => {
  try {
    const response = await api.put(`/analytics/${channelId}/bulk`, { analytics });
    return response.data;
  } catch (error) {
    throw error;
  }
};
