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

// Get user's liked videos
const getUserLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;

  const likedVideos = await Like.find({
    user: userId,
    targetType: "Video",
    value: 1, // Only likes, not dislikes
  })
    .populate({
      path: "target",
      select: "title description thumbnail media visibility tags createdAt metadata",
      populate: {
        path: "channel",
        select: "name handle stats",
        populate: {
          path: "owner",
          select: "profile",
        },
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalLikedVideos = await Like.countDocuments({
    user: userId,
    targetType: "Video",
    value: 1,
  });

  // Filter out any null targets (deleted videos)
  const validLikedVideos = likedVideos.filter(like => like.target !== null);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likedVideos: validLikedVideos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalLikedVideos / limit),
          totalItems: totalLikedVideos,
          hasNextPage: skip + validLikedVideos.length < totalLikedVideos,
          hasPrevPage: page > 1,
        },
      },
      "Liked videos fetched successfully"
    )
  );
});

// Get user's liked comments
const getUserLikedComments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;

  const likedComments = await Like.find({
    user: userId,
    targetType: "Comment",
    value: 1, // Only likes, not dislikes
  })
    .populate({
      path: "target",
      select: "content createdAt metadata",
      populate: [
        {
          path: "user",
          select: "profile username fullName",
        },
        {
          path: "video",
          select: "title thumbnail",
          populate: {
            path: "channel",
            select: "name handle",
          },
        },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalLikedComments = await Like.countDocuments({
    user: userId,
    targetType: "Comment",
    value: 1,
  });

  // Filter out any null targets (deleted comments)
  const validLikedComments = likedComments.filter(like => like.target !== null);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likedComments: validLikedComments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalLikedComments / limit),
          totalItems: totalLikedComments,
          hasNextPage: skip + validLikedComments.length < totalLikedComments,
          hasPrevPage: page > 1,
        },
      },
      "Liked comments fetched successfully"
    )
  );
});

export { 
  toggleLike, 
  getLikeCounts, 
  getUserLikeVideos, 
  getUserLikedVideos,
  getUserLikedComments 
};
