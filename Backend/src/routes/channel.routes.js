import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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

// Protected routes
router.use(verifyJWT);
router.route("/me").get(getUserChannel).patch(upload.single("avatar"), customizeChannel).delete(deleteChannel);
router.route("/").post(createChannel);

router
  .route("/me/avatar")
  .patch(upload.single("channelAvatar"), updateChannelAvatar)
  .delete(removeChannelAvatar);

// Public routes (must come after /me to avoid conflict)
router.route("/:handle").get(getChannelByHandle);
router.route("/:handle/videos").get(getChannelVideos);

export default router;
