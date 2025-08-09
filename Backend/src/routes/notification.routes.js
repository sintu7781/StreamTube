import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
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
} from "../controllers/notification.controller.js";

const router = Router();

// All notification routes require authentication
router.use(verifyJWT);

// GET /api/notifications - Get user's notifications with pagination and filtering
router.route("/").get(getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.route("/unread-count").get(getUnreadCount);

// GET /api/notifications/stats - Get notification statistics
router.route("/stats").get(getNotificationStats);

// POST /api/notifications/mark-read - Mark notifications as read (bulk or all)
router.route("/mark-read").post(markAsRead);

// PATCH /api/notifications/:notificationId/read - Mark single notification as read
router.route("/:notificationId/read").patch(markSingleAsRead);

// DELETE /api/notifications/:notificationId - Delete a specific notification
router.route("/:notificationId").delete(deleteNotification);

// DELETE /api/notifications - Delete all notifications for the user
router.route("/").delete(deleteAllNotifications);

// GET /api/notifications/preferences - Get notification preferences
router.route("/preferences").get(getNotificationPreferences);

// PUT /api/notifications/preferences - Update notification preferences
router.route("/preferences").put(updateNotificationPreferences);

// POST /api/notifications/test - Create test notification (development only)
if (process.env.NODE_ENV === "development") {
  router.route("/test").post(createTestNotification);
}

export default router;
