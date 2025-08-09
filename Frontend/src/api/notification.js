import axiosInstance from "../lib/axios";
import { NOTIFICATION_ENDPOINTS } from "./endpoints";

export const getNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await axiosInstance.get(
      NOTIFICATION_ENDPOINTS.GET_NOTIFICATION(page, limit)
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get(
      NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNT
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

// Mark notifications as read
export const markAsRead = async (notificationIds) => {
  try {
    const response = await axiosInstance.patch(
      NOTIFICATION_ENDPOINTS.MARK_AS_READ,
      {
        notificationIds,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await axiosInstance.patch(
      NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ
    );
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosInstance.delete(
      NOTIFICATION_ENDPOINTS.DELETE_NOTIFICATION(notificationId)
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Get notification by ID
export const getNotificationById = async (notificationId) => {
  try {
    const response = await axiosInstance.get(
      NOTIFICATION_ENDPOINTS.GET_NOTIFICATION_BY_ID(notificationId)
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notification:", error);
    throw error;
  }
};
