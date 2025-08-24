import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addToWatchLater,
  removeFromWatchLater,
  getWatchLaterList,
  checkWatchLaterStatus,
  toggleWatchLater,
  reorderWatchLater,
  clearWatchLater,
  getWatchLaterStats,
  updateWatchLaterNotes,
  getWatchLaterBatch,
} from "../controllers/watchLater.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Main watch later operations
router.route("/").get(getWatchLaterList);

router.route("/stats").get(getWatchLaterStats);

router.route("/batch").get(getWatchLaterBatch);

router.route("/clear").delete(clearWatchLater);

router.route("/reorder").patch(reorderWatchLater);

// Individual video operations
router.route("/:videoId/status").get(checkWatchLaterStatus);

router.route("/:videoId/toggle").post(toggleWatchLater);

router.route("/:videoId/notes").patch(updateWatchLaterNotes);

router.route("/:videoId").post(addToWatchLater).delete(removeFromWatchLater);

export default router;
