import { Router } from "express";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createChannel,
  customizeChannel,
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

router.route("/:handle/videos").get(optionalAuth, getChannelVideos);

router.route("/:handle").get(getChannelByHandle);

router.use(verifyJWT);

router
  .route("/")
  .get(getUserChannel)
  .post(createChannel)
  .patch(upload.single("avatar"), customizeChannel)
  .delete(deleteChannel);

router
  .route("/me/avatar")
  .patch(upload.single("channelAvatar"), updateChannelAvatar)
  .delete(removeChannelAvatar);

export default router;
