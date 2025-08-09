import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createChannel = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  // Check if user already has a channel
  if (req.user.channel) {
    throw new ApiError(400, "User already has a channel");
  }

  const channel = await Channel.create({
    name,
    description,
    owner: req.user._id,
  });

  // Update user's channel field
  await User.findByIdAndUpdate(req.user._id, { channel: channel._id });

  return res
    .status(201)
    .json(new ApiResponse(201, channel, "Channel created successfully"));
});

const customizeChannel = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const updates = {};

  if (!req.user.channel) {
    throw new ApiError(404, "Channel not found");
  }

  if (name) {
    updates.name = name;
  }

  if (description) {
    updates.description = description;
  }

  // Handle avatar upload
  if (req.file) {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(
      avatarLocalPath,
      "image",
      "channel_avatars"
    );

    if (!avatar.secure_url) {
      throw new ApiError(500, "Error while uploading avatar");
    }

    updates.avatar = {
      url: avatar.secure_url,
      key: avatar.public_id,
    };
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No updates provided");
  }

  const updatedChannel = await Channel.findByIdAndUpdate(
    req.user.channel,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  ).populate({
    path: "owner",
    select: "profile",
  });

  if (!updatedChannel) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedChannel, "Channel customized successfully")
    );
});

const getChannel = asyncHandler(async (req, res) => {
  if (!req.user.channel) {
    throw new ApiError(404, "Channel not found");
  }
  const channel = await Channel.findById(req.user.channel).populate({
    path: "owner",
    select: "profile",
  });

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel fetched successfully"));
});

const getChannelByHandle = asyncHandler(async (req, res) => {
  const { handle } = req.params;

  if (!handle) {
    throw new ApiError(400, "Channel handle is required");
  }

  const channel = await Channel.findOne({ handle }).populate({
    path: "owner",
    select: "profile",
  });

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel fetched successfully"));
});

const searchChannels = asyncHandler(async (req, res) => {
  const { q: query, page = 1, limit = 10 } = req.query;

  if (!query || query.trim() === "") {
    throw new ApiError(400, "Search query is required");
  }

  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(query, "i");

  const channels = await Channel.find({
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { handle: searchRegex },
    ],
  })
    .populate({
      path: "owner",
      select: "profile",
    })
    .sort({ "stats.subscribers": -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalChannels = await Channel.countDocuments({
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { handle: searchRegex },
    ],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        channels,
        query,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalChannels / limit),
          totalChannels,
          hasNextPage: skip + channels.length < totalChannels,
          hasPrevPage: page > 1,
        },
      }, "Search results fetched successfully")
    );
});

// Alias for getChannel for clarity
const getUserChannel = getChannel;

const deleteChannel = asyncHandler(async (req, res) => {
  if (!req.user.channel) {
    throw new ApiError(404, "Channel not found");
  }
  const channelId = req.user.channel;
  // Remove the channel
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  // Remove channel reference from user
  await User.findByIdAndUpdate(req.user._id, { $unset: { channel: "" } });
  // Remove the channel document (soft delete if you want)
  await channel.remove();
  return res.status(200).json(new ApiResponse(200, {}, "Channel deleted successfully"));
});

// Upload/update channel avatar
const updateChannelAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Channel avatar file is required");
  }

  if (!req.user.channel) {
    throw new ApiError(404, "Channel not found");
  }

  const avatarLocalPath = req.file.path;
  const avatar = await uploadOnCloudinary(
    avatarLocalPath,
    "image",
    "channel_avatars"
  );

  if (!avatar.secure_url) {
    throw new ApiError(500, "Error while uploading channel avatar");
  }

  const updatedChannel = await Channel.findByIdAndUpdate(
    req.user.channel,
    {
      $set: {
        avatar: {
          url: avatar.secure_url,
          key: avatar.public_id,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate({
    path: "owner",
    select: "profile",
  });

  if (!updatedChannel) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedChannel, "Channel avatar updated successfully")
    );
});

// Remove channel avatar
const removeChannelAvatar = asyncHandler(async (req, res) => {
  if (!req.user.channel) {
    throw new ApiError(404, "Channel not found");
  }

  const updatedChannel = await Channel.findByIdAndUpdate(
    req.user.channel,
    {
      $unset: {
        avatar: "",
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate({
    path: "owner",
    select: "profile",
  });

  if (!updatedChannel) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedChannel, "Channel avatar removed successfully")
    );
});

export { 
  createChannel, 
  customizeChannel, 
  getChannel, 
  getUserChannel, 
  getChannelByHandle, 
  searchChannels, 
  deleteChannel,
  updateChannelAvatar,
  removeChannelAvatar 
};
