import Comment from "../models/comment.model.js";
import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createComment = asyncHandler(async (req, res) => {
  const { content, parentCommentId } = req.body;

  const { videoId } = req.params;

  const userId = req.user._id;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  let parentComment;

  if (parentCommentId) {
    parentComment = await Comment.findById(parentCommentId);

    if (!parentComment) {
      throw new ApiError(400, "Parent comment not found");
    }
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    user: userId,
    parentComment: parentComment || null,
  });

  await comment.populate("user", "username profile fullName");

  if (!comment) {
    throw new ApiError(500, "Comment not create");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment create successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const page = parseInt(req.query.page) || 1;

  const limit = parseInt(req.query.limit) || 10;

  const includeReplies = req.query.includeReplies === "true";

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video doesn't exists");
  }

  const [comments, topComments, totalComments] = await Promise.all([
    Comment.findByVideo(videoId, page, limit, includeReplies),
    Comment.getCommentCountByVideo(videoId),
    Comment.getTotalCommentCount(videoId, includeReplies),
  ]);

  const totalPages = Math.ceil(totalComments / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        pagination: {
          totalComments,
          topComments,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Comments fetched successfully"
    )
  );
});

const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { content } = req.body;

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  if (!content) {
    throw new ApiError(400, "Content is requiredd");
  }

  const userId = req.user._id;

  if (comment.user.toString() !== userId.toString()) {
    throw new ApiError(401, "Not authorized to update this comment");
  }

  comment.content = content;
  comment.isEdited = true;

  const updatedComment = await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment update succesfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userId = req.user._id;

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  if (comment.user.toString() !== userId.toString()) {
    throw new ApiError(401, "Not authorize to delete this comment");
  }

  await comment.softDelete();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment delete successfully"));
});

const togglePinComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userId = req.user._id;

  const comment = await Comment.findById(id).populate({
    path: "video",
    populate: { path: "channel", populate: { path: "owner", select: "_id" } },
  });

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  if (comment.video.channel.owner._id.toString() !== userId.toString()) {
    throw new ApiError(401, "Not authorize to pin this comment");
  }

  comment.isPinned = !comment.isPinned;
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(400, "Comment pin toggle successfully"));
});

export {
  createComment,
  getVideoComments,
  updateComment,
  deleteComment,
  togglePinComment,
};
