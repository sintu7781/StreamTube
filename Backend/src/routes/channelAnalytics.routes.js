import { Router } from "express";
import {
  createOrUpdateAnalytics,
  getChannelAnalytics,
  getAnalyticsOverview,
  getAudienceDemographics,
  deleteAnalytics,
  bulkUpdateAnalytics,
} from "../controllers/channelAnalytics.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Create or update analytics for a specific date
router.post("/:channelId", createOrUpdateAnalytics);

// Get analytics for a date range
router.get("/:channelId", getChannelAnalytics);

// Get analytics overview for dashboard
router.get("/:channelId/overview", getAnalyticsOverview);

// Get audience demographics
router.get("/:channelId/demographics", getAudienceDemographics);

// Delete analytics for a specific date
router.delete("/:channelId/:date", deleteAnalytics);

// Bulk update analytics
router.put("/:channelId/bulk", bulkUpdateAnalytics);

export default router;
