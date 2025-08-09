import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Notification from "../models/notification.model.js";
import NotificationService from "../services/notification.service.js";

// Get user's notifications with pagination and filtering
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type } = req.query;
  const userId = req.user._id;

  try {
    const result = await Notification.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Notifications fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch notifications");
  }
});

// Get unread notification count
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const count = await NotificationService.getUnreadCount(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, { count }, "Unread count fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch unread count");
  }
});

// Mark notifications as read
const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationIds } = req.body;

  // Validate notification IDs if provided
  if (notificationIds && !Array.isArray(notificationIds)) {
    throw new ApiError(400, "notificationIds must be an array");
  }

  try {
    const result = await NotificationService.markNotificationsAsRead(
      userId,
      notificationIds
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { 
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount 
          },
          notificationIds 
            ? "Selected notifications marked as read"
            : "All notifications marked as read"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Failed to mark notifications as read");
  }
});

// Mark a single notification as read
const markSingleAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new ApiError(400, "Notification ID is required");
  }

  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    if (notification.status === "read") {
      return res
        .status(200)
        .json(new ApiResponse(200, notification, "Notification already read"));
    }

    await notification.markAsRead();

    return res
      .status(200)
      .json(new ApiResponse(200, notification, "Notification marked as read"));
  } catch (error) {
    throw new ApiError(500, "Failed to mark notification as read");
  }
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new ApiError(400, "Notification ID is required");
  }

  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Notification deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to delete notification");
  }
});

// Delete all notifications for user
const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const result = await Notification.deleteMany({ recipient: userId });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { deletedCount: result.deletedCount },
          "All notifications deleted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Failed to delete notifications");
  }
});

// Get notification statistics
const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const [
      totalCount,
      unreadCount,
      typeStats,
      recentCount
    ] = await Promise.all([
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, status: "unread" }),
      Notification.aggregate([
        { $match: { recipient: userId } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Notification.countDocuments({
        recipient: userId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    const stats = {
      total: totalCount,
      unread: unreadCount,
      read: totalCount - unreadCount,
      recent: recentCount,
      byType: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, "Notification statistics fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch notification statistics");
  }
});

// Get notification preferences (placeholder for future implementation)
const getNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const preferences = await NotificationService.getUserNotificationPreferences(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, preferences, "Notification preferences fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch notification preferences");
  }
});

// Update notification preferences (placeholder for future implementation)
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const preferences = req.body;

  // This would typically save to a user preferences model
  // For now, we'll just return the preferences as received

  return res
    .status(200)
    .json(new ApiResponse(200, preferences, "Notification preferences updated successfully"));
});

// Test notification creation (for development/testing purposes)
const createTestNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type, title, message, actionUrl, priority = "normal" } = req.body;

  if (!type || !title || !message) {
    throw new ApiError(400, "Type, title, and message are required");
  }

  try {
    const notification = await Notification.createNotification({
      recipient: userId,
      sender: userId,
      type,
      title,
      message,
      actionUrl,
      priority,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, notification, "Test notification created successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to create test notification");
  }
});

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markSingleAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
  getNotificationPreferences,
  updateNotificationPreferences,
  createTestNotification,
};
