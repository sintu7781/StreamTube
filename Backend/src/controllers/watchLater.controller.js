import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import WatchLater from "../models/watchLater.model.js";
import Video from "../models/video.model.js";

// Add video to watch later
const addToWatchLater = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { notes = "" } = req.body;
  const userId = req.user._id;

  // Check if video exists and is public
  const video = await Video.findOne({ _id: videoId, visibility: "public" });
  if (!video) {
    throw new ApiError(404, "Video not found or not accessible");
  }

  // Add to watch later using static method
  const result = await WatchLater.addToWatchLater(userId, videoId, notes);
  
  if (!result.success) {
    throw new ApiError(400, result.message);
  }

  // Populate the created item for response
  const populatedItem = await WatchLater.findById(result.data._id).populate({
    path: "video",
    populate: {
      path: "channel",
      select: "name handle stats",
      populate: {
        path: "owner",
        select: "profile",
      },
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedItem, "Video added to watch later successfully")
    );
});

// Remove video from watch later
const removeFromWatchLater = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const result = await WatchLater.removeFromWatchLater(userId, videoId);
  
  if (!result.success) {
    throw new ApiError(404, result.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, result.message));
});

// Get user's watch later list
const getWatchLaterList = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = "addedAt",
    sortOrder = "desc",
  } = req.query;

  const userId = req.user._id;

  const result = await WatchLater.getUserWatchLater(
    userId,
    page,
    limit,
    sortBy,
    sortOrder
  );

  if (!result.success) {
    throw new ApiError(500, result.message);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, result.data, "Watch later list retrieved successfully")
    );
});

// Check if video is in watch later
const checkWatchLaterStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const isInWatchLater = await WatchLater.isInWatchLater(userId, videoId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isInWatchLater }, "Watch later status checked")
    );
});

// Toggle video in watch later (add if not present, remove if present)
const toggleWatchLater = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { notes = "" } = req.body;
  const userId = req.user._id;

  // Check if video exists and is public
  const video = await Video.findOne({ _id: videoId, visibility: "public" });
  if (!video) {
    throw new ApiError(404, "Video not found or not accessible");
  }

  // Check current status
  const isInWatchLater = await WatchLater.isInWatchLater(userId, videoId);

  let result;
  let message;
  let statusCode;

  if (isInWatchLater) {
    // Remove from watch later
    result = await WatchLater.removeFromWatchLater(userId, videoId);
    message = "Video removed from watch later";
    statusCode = 200;
  } else {
    // Add to watch later
    result = await WatchLater.addToWatchLater(userId, videoId, notes);
    message = "Video added to watch later";
    statusCode = 201;
  }

  if (!result.success) {
    throw new ApiError(400, result.message);
  }

  let responseData = { isInWatchLater: !isInWatchLater };

  // If added, return the populated item
  if (!isInWatchLater && result.data) {
    const populatedItem = await WatchLater.findById(result.data._id).populate({
      path: "video",
      populate: {
        path: "channel",
        select: "name handle stats",
        populate: {
          path: "owner",
          select: "profile",
        },
      },
    });
    responseData.watchLaterItem = populatedItem;
  }

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, responseData, message));
});

// Reorder watch later list
const reorderWatchLater = asyncHandler(async (req, res) => {
  const { videoIds } = req.body;
  const userId = req.user._id;

  if (!Array.isArray(videoIds) || videoIds.length === 0) {
    throw new ApiError(400, "Video IDs array is required");
  }

  // Verify all videos belong to user's watch later list
  const userWatchLaterItems = await WatchLater.find({ 
    user: userId, 
    video: { $in: videoIds } 
  });

  if (userWatchLaterItems.length !== videoIds.length) {
    throw new ApiError(400, "Some videos are not in your watch later list");
  }

  const result = await WatchLater.reorderWatchLater(userId, videoIds);
  
  if (!result.success) {
    throw new ApiError(500, result.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, result.message));
});

// Clear all watch later items
const clearWatchLater = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await WatchLater.clearWatchLater(userId);
  
  if (!result.success) {
    throw new ApiError(500, result.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, result.message));
});

// Get watch later statistics
const getWatchLaterStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await WatchLater.getWatchLaterStats(userId);
  
  if (!result.success) {
    throw new ApiError(500, result.message);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, result.data, "Watch later statistics retrieved")
    );
});

// Update notes for a watch later item
const updateWatchLaterNotes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { notes } = req.body;
  const userId = req.user._id;

  if (notes && notes.length > 500) {
    throw new ApiError(400, "Notes cannot exceed 500 characters");
  }

  const watchLaterItem = await WatchLater.findOneAndUpdate(
    { user: userId, video: videoId },
    { notes: notes || "" },
    { new: true }
  ).populate({
    path: "video",
    populate: {
      path: "channel",
      select: "name handle stats",
      populate: {
        path: "owner",
        select: "profile",
      },
    },
  });

  if (!watchLaterItem) {
    throw new ApiError(404, "Video not found in watch later list");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, watchLaterItem, "Notes updated successfully")
    );
});

// Get watch later items by batch (for mobile optimization)
const getWatchLaterBatch = asyncHandler(async (req, res) => {
  const { offset = 0, batchSize = 10 } = req.query;
  const userId = req.user._id;

  const watchLaterItems = await WatchLater.find({ user: userId })
    .populate({
      path: "video",
      populate: {
        path: "channel",
        select: "name handle stats",
        populate: {
          path: "owner",
          select: "profile",
        },
      },
    })
    .sort({ addedAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(batchSize));

  // Filter out items where video might be null (deleted videos)
  const validItems = watchLaterItems.filter(item => item.video !== null);

  const hasMore = watchLaterItems.length === parseInt(batchSize);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200, 
        { 
          videos: validItems, 
          hasMore,
          nextOffset: parseInt(offset) + validItems.length
        }, 
        "Watch later batch retrieved successfully"
      )
    );
});

export {
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
};
