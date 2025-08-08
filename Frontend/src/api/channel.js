import axiosInstance from "../lib/axios";

export const getUserChannel = async () => {
  const response = await axiosInstance.get("/v1/channels/me");
  return response.data;
};

export const createChannel = async (channelData) => {
  const response = await axiosInstance.post("/v1/channels", channelData);
  return response.data;
};

export const getChannelByHandle = async (handle) => {
  const response = await axiosInstance.get(`/v1/channels/${handle}`);
  return response.data;
};

export const updateChannel = async (channelData) => {
  const response = await axiosInstance.patch("/v1/channels/me", channelData);
  return response.data;
};

export const deleteChannel = async () => {
  const response = await axiosInstance.delete("/v1/channels/me");
  return response.data;
};
