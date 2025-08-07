import { Router } from "express";
import {
  loginUser,
  signupUser,
  logoutUser,
  refreshAccessToken,
  forgetPassword,
  resetPassword,
  googleLogin,
  githubLogin,
  googleCallback,
  googleSignup,
  githubSignup,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(signupUser);

router.route("/google/signup").post(googleSignup);

router.route("/github/signup").get(githubSignup);

router.route("/verify-email/:token").get(verifyEmail);

router.route("/login").post(loginUser);

router.route("/google/login").post(googleLogin);

router.route("/google/callback").get(googleCallback);

router.route("/github/callback").get(githubLogin);

router.route("/forget-password").post(forgetPassword);

router.route("/reset-password/:token").post(resetPassword);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(verifyJWT, refreshAccessToken);

export default router;
