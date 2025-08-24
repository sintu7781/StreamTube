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
// import { validateObjectId } from "../middlewares/validateObjectId.js"; // optional

const router = Router();

router.use(verifyJWT);

router.get("/:channelId/overview", getAnalyticsOverview);

router.get("/:channelId/demographics", getAudienceDemographics);

router.put("/:channelId/bulk", bulkUpdateAnalytics);

router.post("/:channelId", createOrUpdateAnalytics);

router.get("/:channelId", getChannelAnalytics);

router.delete("/:channelId/:date", deleteAnalytics);

export default router;
