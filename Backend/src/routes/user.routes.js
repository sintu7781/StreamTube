import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/current-user").get(getCurrentUser);

router.route("/change-password").patch(changeCurrentPassword);

router
  .route("/update-account")
  .patch(upload.single("picture"), updateAccountDetails);

export default router;
