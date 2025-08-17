import { Router } from "express";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createChannel,
  customizeChannel,
  getChannel,
  getUserChannel,
  getChannelByHandle,
  searchChannels,
  deleteChannel,
  updateChannelAvatar,
  removeChannelAvatar,
} from "../controllers/channel.controller.js";
import { getChannelVideos } from "../controllers/video.controller.js";

const router = Router();

// Public routes
router.route("/search").get(searchChannels);
router.route("/:handle").get(getChannelByHandle);
// This route uses optional authentication to determine if user is channel owner
router.route("/:handle/videos").get(optionalAuth, getChannelVideos);

// Protected routes
router.route("/me").get(verifyJWT, getUserChannel).patch(verifyJWT, upload.single("avatar"), customizeChannel).delete(verifyJWT, deleteChannel);
router.route("/").post(verifyJWT, createChannel);

router
  .route("/me/avatar")
  .patch(verifyJWT, upload.single("channelAvatar"), updateChannelAvatar)
  .delete(verifyJWT, removeChannelAvatar);

export default router;
