import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Video from "../models/video.model.js";
import Channel from "../models/channel.model.js";

const fileUpload = async (path, resource_type, folder) => {
  if (!path) {
    throw new ApiError(400, `${folder} file is missing`);
  }

  const uploadPath = await uploadOnCloudinary(path, resource_type, folder);

  if (!uploadPath || uploadPath.resource_type !== resource_type) {
    throw new ApiError(500, `${folder} upload failed`);
  }

  return uploadPath;
};

const uploadVideo = asyncHandler(async (req, res) => {
  const {
    title,
    description = "",
    tags = [],
    visibility = "public",
  } = req.body;

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const videoUpload = await fileUpload(videoLocalPath, "video", "videos");

  let uploadthumbnail = null;
  if (thumbnailLocalPath) {
    uploadthumbnail = await fileUpload(
      thumbnailLocalPath,
      "image",
      "thumbnails"
    );
  }

  const video = await Video.create({
    title,
    description,
    channel: req.user.channel,
    tags:
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags,
    visibility,
    media: {
      original: {
        url: videoUpload.secure_url,
        key: videoUpload.public_id,
      },
      duration: videoUpload.duration,
      aspectRatio: videoUpload.aspect_ratio,
    },
    thumbnail: uploadthumbnail
      ? {
          url: uploadthumbnail.secure_url,
          key: uploadthumbnail.public_id,
        }
      : undefined,
  });

  if (!video) {
    throw new ApiError(500, "Video uploading failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getSingleVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id).populate({
    path: "channel",
    select: "name handle stats",
    populate: {
      path: "owner",
      select: "profile",
    },
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Increment views using the proper method
  video.views += 1;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { handle } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const channel = await Channel.findOne({ handle }).populate("owner");

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const skip = (page - 1) * limit;

  const videos = await Video.find({
    channel: channel._id,
    visibility: "public",
  })
    .populate({
      path: "channel",
      select: "name handle stats",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalVideos = await Video.countDocuments({
    channel: channel._id,
    visibility: "public",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        channel,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalVideos / limit),
          totalVideos,
          hasNextPage: skip + videos.length < totalVideos,
          hasPrevPage: page > 1,
        },
      },
      "Channel videos fetched successfully"
    )
  );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { title, description, tags, visibility } = req.body;

  const updates = {};

  if (title) {
    updates.title = title;
  }

  if (description) {
    updates.description = description;
  }

  if (tags) {
    updates.tags =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags;
  }

  if (visibility) {
    updates.visibility = visibility;
  }

  const thumbnailLocalPath = req.file?.path;

  if (thumbnailLocalPath) {
    const uploadthumbnail = await fileUpload(
      thumbnailLocalPath,
      "image",
      "thumbnails"
    );

    updates["thumbnail.url"] = uploadthumbnail.secure_url;
    updates["thumbnail.key"] = uploadthumbnail.public_id;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    id,
    {
      $set: updates,
    },
    { new: true, runValidators: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Video not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const videos = await Video.find({ visibility: "public" })
    .populate({
      path: "channel",
      select: "name handle stats",
      populate: {
        path: "owner",
        select: "profile",
      },
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const totalVideos = await Video.countDocuments({ visibility: "public" });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalVideos / limit),
          totalVideos,
          hasNextPage: skip + videos.length < totalVideos,
          hasPrevPage: page > 1,
        },
      },
      "All videos fetched successfully"
    )
  );
});

const searchVideos = asyncHandler(async (req, res) => {
  const { q: query, page = 1, limit = 10 } = req.query;

  if (!query || query.trim() === "") {
    throw new ApiError(400, "Search query is required");
  }

  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(query, "i");

  const videos = await Video.find({
    $and: [
      { visibility: "public" },
      {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
        ],
      },
    ],
  })
    .populate({
      path: "channel",
      select: "name handle stats",
      populate: {
        path: "owner",
        select: "profile",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalVideos = await Video.countDocuments({
    $and: [
      { visibility: "public" },
      {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
        ],
      },
    ],
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        query,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalVideos / limit),
          totalVideos,
          hasNextPage: skip + videos.length < totalVideos,
          hasPrevPage: page > 1,
        },
      },
      "Search results fetched successfully"
    )
  );
});

export {
  uploadVideo,
  getSingleVideo,
  getChannelVideos,
  updateVideo,
  getAllVideos,
  searchVideos,
};
