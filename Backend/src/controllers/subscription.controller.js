import Subscription from "../models/subscription.model.js";
import Channel from "../models/channel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createOrUpdateAnalytics } from "./channelAnalytics.controller.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user?._id;

    console.log("➡️ Toggle subscription request", { userId, channelId });

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    // ✅ check if channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      console.error("❌ Channel not found:", channelId);
      throw new ApiError(401, "Channel not found");
    }

    // ✅ check existing subscription
    let subscription = await Subscription.findOne({
      user: userId,
      channel: channelId,
    });

    if (subscription) {
      console.log("🔄 Already subscribed, unsubscribing...");
      await subscription.deleteOne();
      await createOrUpdateAnalytics(channelId, { subscribers: -1 });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { subscribed: false },
            "Channel unsubscribed sucessfully"
          )
        );
    } else {
      console.log("➕ Creating subscription...");
      subscription = new Subscription({ user: userId, channel: channelId });
      await subscription.save();

      await createOrUpdateAnalytics(channelId, { subscribers: 1 });

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { subscribed: true },
            "Channel subscribed successfully"
          )
        );
    }
  } catch (error) {
    console.error("🔥 Subscription toggle error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
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
    .populate({
      path: "channel",
      select: "handle name owner stats",
      populate: {
        path: "owner",
        select: "profile username",
      },
    })
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
  toggleSubscription,
  checkSubscriptionStatus,
  getUserSubscriptions,
  getChannelSubscribers,
};
