import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  checkSubscriptionStatus,
  getChannelSubscribers,
  getUserSubscriptions,
  subscribeToChannel,
  unsubscribeFromChannel,
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:channelId")
  .post(subscribeToChannel)
  .delete(unsubscribeFromChannel);

router.route("/:channelId/status").get(checkSubscriptionStatus);

router.route("/me").get(getUserSubscriptions);

router.route("/channel/:channelId").get(getChannelSubscribers);

export default router;
