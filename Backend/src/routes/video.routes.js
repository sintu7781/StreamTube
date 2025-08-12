import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllVideos,
  getSingleVideo,
  updateVideo,
  uploadVideo,
  searchVideos,
  getVideosByCategory,
  getRelatedVideos,
  incrementViews,
} from "../controllers/video.controller.js";

const router = Router();

// Public routes
router.route("/").get(getAllVideos);
router.route("/search").get(searchVideos);
router.route("/category/:category").get(getVideosByCategory);
router.route("/:id").get(getSingleVideo);
router.route("/:id/related").get(getRelatedVideos);

// Protected routes
router.use(verifyJWT);
router.route("/upload").post(
  upload.fields([
    { name: "video", maxCount: 1 },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

router.route("/update-video/:id").post(upload.single("thumbnail"), updateVideo);
router.route("/:id/views").post(incrementViews);

export default router;
