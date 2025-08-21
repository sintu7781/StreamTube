import Subscription from "../models/subscription.model.js";
import Channel from "../models/channel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const subscribeToChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  const channel = await Channel.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  if (channel.owner.equals(userId)) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const subscription = await Subscription.create({
    user: userId,
    channel: channelId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subscription, "Subscribed successfully"));
});

const unsubscribeFromChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const subscription = await Subscription.findOneAndDelete({
    user: userId,
    channel: channelId,
  });

  if (!subscription) {
    throw new ApiError(404, "Not subscribed to this channel");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
});

const checkSubscriptionStatus = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const subscription = await Channel.findOne({
    user: userId,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribed: !!subscription },
        "Check subscription status fetched successfully"
      )
    );
});

const getUserSubscriptions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const subscriptions = await Subscription.find({ user: userId })
    .populate("channel", "handle name stats owner")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data: subscriptions, count: subscriptions.lenght },
        "User subscription fetched successfully"
      )
    );
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("user", "username fullName profile")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data: subscribers, count: subscribers.length },
        "Channel subscribers fetched successfully"
      )
    );
});

export {
  subscribeToChannel,
  unsubscribeFromChannel,
  checkSubscriptionStatus,
  getUserSubscriptions,
  getChannelSubscribers,
};
