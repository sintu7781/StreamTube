import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserSubscriptions,
  checkSubscriptionStatus,
  getChannelSubscribers,
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:channelId/status").get(checkSubscriptionStatus);

router.route("/channel/:channelId").get(getChannelSubscribers);

router.route("/:channelId").post(toggleSubscription);

router.route("/me").get(getUserSubscriptions);

export default router;
