import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createChannel,
  customizeChannel,
  getChannel,
  getChannelByHandle,
} from "../controllers/channel.controller.js";
import { getChannelVideos } from "../controllers/video.controller.js";

const router = Router();

// Public routes
router.route("/:handle").get(getChannelByHandle);
router.route("/:handle/videos").get(getChannelVideos);

// Protected routes
router.use(verifyJWT);
router.route("/").get(getChannel);
router.route("/create").post(createChannel);
router.route("/customize").post(customizeChannel);

export default router;
