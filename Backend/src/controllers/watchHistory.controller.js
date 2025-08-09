import WatchHistory from "../models/watchHistory.model.js";
import Video from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Add or update watch history entry
const addWatchHistory = asyncHandler(async (req, res) => {
  const { videoId, watchDuration, watchPercentage, completed } = req.body;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Get device info from request
  const deviceInfo = {
    userAgent: req.get("User-Agent"),
    ipAddress: req.ip || req.connection.remoteAddress,
    deviceType: getDeviceType(req.get("User-Agent")),
  };

  const watchData = {
    watchDuration: watchDuration || 0,
    watchPercentage: watchPercentage || 0,
    completed: completed || false,
    deviceInfo,
  };

  const history = await WatchHistory.addOrUpdateWatchHistory(
    userId,
    videoId,
    watchData
  );

  return res
    .status(200)
    .json(new ApiResponse(200, history, "Watch history updated successfully"));
});

// Get user's watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, sortBy = "watchedAt", sortOrder = "desc" } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  };

  const result = await WatchHistory.getUserWatchHistory(userId, options);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Watch history fetched successfully")
    );
});

// Remove specific video from watch history
const removeFromHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const result = await WatchHistory.removeFromHistory(userId, videoId);

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Video not found in watch history");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Video removed from watch history successfully")
    );
});

// Clear entire watch history
const clearWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await WatchHistory.clearUserHistory(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        "Watch history cleared successfully"
      )
    );
});

// Helper function to determine device type
function getDeviceType(userAgent) {
  if (!userAgent) return "desktop";
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  } else if (ua.includes("smart-tv") || ua.includes("smarttv")) {
    return "tv";
  }
  
  return "desktop";
}

export {
  addWatchHistory,
  getWatchHistory,
  removeFromHistory,
  clearWatchHistory,
};
