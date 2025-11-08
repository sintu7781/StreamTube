import { Router } from "express";
import {
  getLikeCounts,
  getUserLikeVideo,
  toggleLike,
  getUserLikedVideos,
  getUserLikedComments,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/count").get(getLikeCounts);

router.use(verifyJWT);

router.route("/toggle").post(toggleLike);

router.route("/like").post(getUserLikeVideo);

router.route("/liked-videos").get(getUserLikedVideos);

router.route("/liked-comments").get(getUserLikedComments);

export default router;
