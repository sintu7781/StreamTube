import { Router } from "express";
import {
  getLikeCounts,
  getUserLikeVideos,
  toggleLike,
  getUserLikedVideos,
  getUserLikedComments,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/count").get(getLikeCounts);

router.use(verifyJWT);

router.route("/toggle").post(toggleLike);

router.route("/all-likes").get(getUserLikeVideos);

router.route("/liked-videos").get(getUserLikedVideos);

router.route("/liked-comments").get(getUserLikedComments);

export default router;
