import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Video from "../models/video.model.js";
import Channel from "../models/channel.model.js";
import WatchHistory from "../models/watchHistory.model.js";

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
  const userId = req.user?._id;

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

  // Increment views with proper unique view tracking
  const viewData = {
    userId,
    sessionId: req.sessionID || req.headers['x-session-id'],
    ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    duration: 0,
    watchedPercentage: 0
  };
  
  await video.incrementViews(viewData);

  // Add to watch history if user is authenticated
  if (userId) {
    try {
      const deviceInfo = {
        userAgent: req.get("User-Agent"),
        ipAddress: req.ip || req.connection.remoteAddress,
        deviceType: getDeviceType(req.get("User-Agent")),
      };
      
      await WatchHistory.addOrUpdateWatchHistory(userId, id, {
        watchDuration: 0,
        watchPercentage: 0,
        completed: false,
        deviceInfo,
      });
    } catch (error) {
      console.error("Error adding to watch history:", error);
      // Don't fail the request if watch history fails
    }
  }

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

// Get related videos based on tags, channel, and popularity
const getVideosByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  // Build the query filter
  let filter = { visibility: "public" };

  // If category is not "all", filter by category in tags
  if (category && category !== "all") {
    // Create case-insensitive regex for category matching
    const categoryRegex = new RegExp(category, "i");
    filter.tags = { $in: [categoryRegex] };
  }

  const videos = await Video.find(filter)
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

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalVideos / limit),
          totalVideos,
          hasNextPage: skip + videos.length < totalVideos,
          hasPrevPage: page > 1,
        },
      },
      `Videos in ${category} category fetched successfully`
    )
  );
});

const getRelatedVideos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 12 } = req.query;

  const currentVideo = await Video.findById(id).select("tags channel title");
  if (!currentVideo) {
    throw new ApiError(404, "Video not found");
  }

  // Build aggregation pipeline for related videos
  const pipeline = [
    {
      $match: {
        _id: { $ne: currentVideo._id },
        visibility: "public",
        $or: [
          // Same channel videos (highest priority)
          { channel: currentVideo.channel },
          // Videos with matching tags
          { tags: { $in: currentVideo.tags } },
        ],
      },
    },
    {
      $addFields: {
        relevanceScore: {
          $add: [
            // Same channel bonus
            { $cond: [{ $eq: ["$channel", currentVideo.channel] }, 10, 0] },
            // Tag match bonus
            {
              $multiply: [
                { $size: { $setIntersection: ["$tags", currentVideo.tags] } },
                2,
              ],
            },
            // Popularity bonus (views normalized)
            { $divide: ["$metadata.views", 1000] },
            // Recency bonus
            {
              $divide: [
                { $subtract: [new Date(), "$createdAt"] },
                86400000, // 1 day in milliseconds
              ],
            },
          ],
        },
      },
    },
    { $sort: { relevanceScore: -1, "metadata.views": -1, createdAt: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: "channels",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{ $project: { profile: 1 } }],
            },
          },
          { $unwind: "$owner" },
          { $project: { name: 1, handle: 1, stats: 1, owner: 1 } },
        ],
      },
    },
    { $unwind: "$channel" },
    {
      $project: {
        relevanceScore: 0, // Remove from final output
      },
    },
  ];

  const relatedVideos = await Video.aggregate(pipeline);

  // If we don't have enough related videos, fetch popular videos
  if (relatedVideos.length < parseInt(limit)) {
    const remainingLimit = parseInt(limit) - relatedVideos.length;
    const relatedVideoIds = relatedVideos.map(v => v._id);
    
    const popularVideos = await Video.find({
      _id: { $nin: [...relatedVideoIds, currentVideo._id] },
      visibility: "public",
    })
      .populate({
        path: "channel",
        select: "name handle stats",
        populate: {
          path: "owner",
          select: "profile",
        },
      })
      .sort({ "metadata.views": -1, createdAt: -1 })
      .limit(remainingLimit);

    relatedVideos.push(...popularVideos);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, relatedVideos, "Related videos fetched successfully")
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

const incrementViews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const { duration = 0, watchedPercentage = 0 } = req.body;

  const video = await Video.findById(id);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const viewData = {
    userId,
    sessionId: req.sessionID || req.headers['x-session-id'],
    ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    duration,
    watchedPercentage
  };
  
  const updatedViews = await video.incrementViews(viewData);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedViews, "Views updated successfully"));
});

export {
  uploadVideo,
  getSingleVideo,
  getChannelVideos,
  updateVideo,
  getAllVideos,
  searchVideos,
  getVideosByCategory,
  getRelatedVideos,
  incrementViews,
};
