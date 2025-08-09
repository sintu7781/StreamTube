import { createContext, useContext, useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationById,
} from "../api/notification";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 20) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getNotifications(page, limit);
      if (page === 1) {
        setNotifications(response.data.notifications || []);
      } else {
        setNotifications((prev) => [
          ...prev,
          ...(response.data.notifications || []),
        ]);
      }
    } catch (error) {
      setError("Failed to fetch notifications");
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Mark notifications as read
  const markedRead = async (notificationIds) => {
    try {
      await markAsRead(notificationIds);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      const unreadToRead = notifications.filter(
        (n) => notificationIds.includes(n.id) && !n.isRead
      ).length;
      setUnreadCount((prev) => Math.max(0, prev - unreadToRead));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markedAllRead = async () => {
    try {
      await markAllAsRead();

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };

  // Delete notification
  const deletingNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);

      // Update local state
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Initialize notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markedRead,
    markedAllRead,
    deletingNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
