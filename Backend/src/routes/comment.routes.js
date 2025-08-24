import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getVideoComments,
  togglePinComment,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(createComment);

router.route("/:id/pin").patch(togglePinComment);

router.route("/:id").patch(updateComment).delete(deleteComment);

export default router;
