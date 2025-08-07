import axiosInstance from "../lib/axios";
import { CHANNEL_ENDPOINTS } from "./endpoints";

export const getChannelByHandle = async (handle) => {
  const response = await axiosInstance.get(CHANNEL_ENDPOINTS.GET_CHANNEL(handle));
  return response.data;
};

export const getChannelVideos = async (handle) => {
  const response = await axiosInstance.get(CHANNEL_ENDPOINTS.GET_CHANNEL_VIDEOS(handle));
  return response.data;
};

export const createChannel = async (channelData) => {
  const response = await axiosInstance.post(CHANNEL_ENDPOINTS.CREATE_CHANNEL, channelData);
  return response.data;
};

export const updateChannel = async (channelData) => {
  const response = await axiosInstance.post(CHANNEL_ENDPOINTS.UPDATE_CHANNEL, channelData);
  return response.data;
};

export const getMyChannel = async () => {
  const response = await axiosInstance.get("/api/v1/channels");
  return response.data;
};
