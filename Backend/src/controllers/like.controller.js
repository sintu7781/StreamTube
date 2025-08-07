import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js";
import Video from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleLike = asyncHandler(async (req, res) => {
  const { targetType, targetId, value } = req.body;

  const userId = req.user._id;

  const targetModel = targetType === "Video" ? Video : Comment;

  const targetExists = await targetModel.exists({ _id: targetId });

  if (!targetExists) {
    throw new ApiError(400, `${targetType} not found`);
  }

  const result = await Like.toggleLike(userId, targetType, targetId, value);

  if (!result) {
    throw new ApiError(500, "Like not toggle");
  }

  return res.status(200).json(new ApiResponse(200, result, "Like is toggle"));
});

const getLikeCounts = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query;

  if (!targetType || !targetId) {
    throw new ApiError(400, "targetType and targetId is required");
  }

  if (!["Video", "Comment"].includes(targetType)) {
    throw new ApiError(400, "targetType must be either 'video' or 'comment'");
  }

  const TargetModel = targetType === "Video" ? Video : Comment;
  const targetExists = await TargetModel.exists({ _id: targetId });
  if (!targetExists) {
    throw new ApiError(400, `${targetType} not found`);
  }

  // Get counts
  const counts = await Like.getLikesCount(targetType, targetId);

  return res
    .status(200)
    .json(new ApiResponse(200, counts, "Like counts fetched successfully"));
});

const getUserLikeVideos = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.body;

  const userId = req.user._id;

  const like = await Like.getUserVote(userId, targetType, targetId);

  return res
    .status(200)
    .json(new ApiResponse(200, like, "All like fetched successfully"));
});

export { toggleLike, getLikeCounts, getUserLikeVideos };
