import { Router } from "express";
import {
  addWatchHistory,
  getWatchHistory,
  removeFromHistory,
  clearWatchHistory,
} from "../controllers/watchHistory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/").get(getWatchHistory);

router.route("/add").post(addWatchHistory);

router.route("/remove/:videoId").delete(removeFromHistory);

router.route("/clear").delete(clearWatchHistory);

export default router;
