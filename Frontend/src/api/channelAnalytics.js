import axiosInstance from "../lib/axios";
import { CHANNEL_ANALYTICS_ENDPOINTS } from "./endpoints";

export const getAnalyticsOverview = async (channelId) => {
  const response = await axiosInstance.get(
    CHANNEL_ANALYTICS_ENDPOINTS.GET_ANALYTICS_OVERVIEW(channelId)
  );
  console.log(`getAnalyticsOverview: ${response}`);
  return response.data;
};
export const getChannelAnalytics = async (channelId, params = {}) => {
  const response = await axiosInstance.get(
    CHANNEL_ANALYTICS_ENDPOINTS.GET_CHANNEL_ANALYTICS(channelId),
    { params }
  );
  console.log(`getChannelAnalytics: ${response}`);
  return response.data;
};
export const getAudienceDemographics = async (channelId) => {
  const response = await axiosInstance.get(
    CHANNEL_ANALYTICS_ENDPOINTS.GET_AUDIENCE_DEMOGRAPHICS(channelId)
  );
  console.log(`getAudienceDemographics: ${response}`);
  return response.data;
};
export const bulkUpdateAnalytics = async (channelId, analytics) => {
  const response = await axiosInstance.put(
    CHANNEL_ANALYTICS_ENDPOINTS.BULK_UPDATE_ANALYTICS(channelId),
    { analytics }
  );
  return response.data;
};
export const deleteAnalytics = async (channelId, date) => {
  const response = await axiosInstance.get(
    CHANNEL_ANALYTICS_ENDPOINTS.DELETE_ANALYTICS(channelId, date)
  );
  return response.data;
};
