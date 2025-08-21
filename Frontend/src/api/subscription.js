import axiosInstance from "../lib/axios";
import { SUBSCRIPTION_ENDPOINTS } from "./endpoints";

export const subscribeToChannel = async (channelId) => {
  const response = await axiosInstance.post(
    SUBSCRIPTION_ENDPOINTS.SUBSCRIBED_TO_CHANNEL(channelId)
  );
  return response.data;
};

export const unsubscribeFromChannel = async (channelId) => {
  const response = await axiosInstance.delete(
    SUBSCRIPTION_ENDPOINTS.UNSUBSCRIBED_FROM_CHANNEL(channelId)
  );
  return response.data;
};

export const checkSubscriptionStatus = async (channelId) => {
  const response = await axiosInstance.post(
    SUBSCRIPTION_ENDPOINTS.CHECH_SUBSCRIPTION_STATUS(channelId)
  );
  return response.data;
};
