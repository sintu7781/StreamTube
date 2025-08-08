import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import channelRoute from "./routes/channel.routes.js";
import videoRoute from "./routes/video.routes.js";
import commentRoute from "./routes/comment.routes.js";
import likeRoute from "./routes/like.routes.js";
import channelAnalyticsRoute from "./routes/channelAnalytics.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

app.use("/api/v1/auth", authRoute);

app.use("/api/v1/users", userRoute);

app.use("/api/v1/channels", channelRoute);

app.use("/api/v1/videos", videoRoute);

app.use("/api/v1/comments", commentRoute);

app.use("/api/v1/likes", likeRoute);

app.use("/api/v1/analytics", channelAnalyticsRoute);

app.use(errorHandler);

export default app;
