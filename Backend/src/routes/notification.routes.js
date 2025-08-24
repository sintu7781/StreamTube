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

router.use(verifyJWT);

router.route("/").get(getNotifications);

router.route("/unread-count").get(getUnreadCount);

router.route("/stats").get(getNotificationStats);

router.route("/mark-read").post(markAsRead);

router.route("/:notificationId/read").patch(markSingleAsRead);

router.route("/:notificationId").delete(deleteNotification);

router.route("/").delete(deleteAllNotifications);

router
  .route("/preferences")
  .get(getNotificationPreferences)
  .put(updateNotificationPreferences);

if (process.env.NODE_ENV === "development") {
  router.route("/test").post(createTestNotification);
}

export default router;
