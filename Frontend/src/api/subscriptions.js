import axiosInstance from "../lib/axios";
import { SUBSCRIPTION_ENDPOINTS } from "./endpoints";

export const toggleSubscription = async (channelId) => {
  const response = await axiosInstance.post(
    SUBSCRIPTION_ENDPOINTS.TOGGLE_SUBSCRIPTION(channelId)
  );
  return response.data;
};

export const checkSubscriptionStatus = async (channelId) => {
  const response = await axiosInstance.get(
    SUBSCRIPTION_ENDPOINTS.CHECK_SUBSCRIPTION_STATUS(channelId)
  );
  return response.data;
};

export const getUserSubscriptions = async () => {
  const res = await axiosInstance.get(
    SUBSCRIPTION_ENDPOINTS.GET_USER_SUBSCRIPTION
  );
  return res.data;
};

export const getChannelSubscribers = async (channelId) => {
  const res = await axiosInstance.get(
    SUBSCRIPTION_ENDPOINTS.GET_CHANNEL_SUBSCRIPTION(channelId)
  );
  return res.data;
};
