import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ChannelAnalytics from "../models/channelAnalytics.model.js";
import Channel from "../models/channel.model.js";
import Video from "../models/video.model.js";

// 🔹 Utility: Normalize date to start of the day
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Create or update channel analytics for a specific date
const createOrUpdateAnalytics = async (channelId, updates = {}) => {
  try {
    const { date, views, subscribers, videos } = updates;

    if (!channelId) throw new ApiError(400, "Channel ID is required");

    const channel = await Channel.findById(channelId);

    if (!channel) throw new ApiError(404, "Channel not found");

    const analyticsDate = normalizeDate(date || new Date());

    let analytics = await ChannelAnalytics.findOne({
      channel: channelId,
      date: analyticsDate,
    });

    if (analytics) {
      analytics.views = Math.max(0, analytics.views + (updates.views || 0));
      analytics.subscribers = Math.max(
        0,
        analytics.subscribers + (updates.subscribers || 0)
      );
      analytics.videos = Math.max(0, analytics.videos + (updates.videos || 0));
    } else {
      analytics = new ChannelAnalytics({
        channel: channelId,
        date: analyticsDate,
        views: Math.max(0, updates.views || 0),
        subscribers: Math.max(0, updates.subscribers || 0),
        videos: Math.max(0, updates.videos || 0),
      });
    }

    await analytics.save();
  } catch (error) {
    console.error("Error updating channel analytics:", error);
  }
};

// Get channel analytics for a specific date range
const getChannelAnalytics = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { startDate, endDate, period = "30" } = req.query;

  if (!channelId) throw new ApiError(400, "Channel ID is required");

  const channel = await Channel.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view analytics for your own channel");
  }

  // Build date filter
  let query = { channel: channelId };
  if (startDate && endDate) {
    query.date = {
      $gte: normalizeDate(startDate),
      $lte: normalizeDate(endDate),
    };
  } else {
    const days = parseInt(period);
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - days);
    query.date = { $gte: normalizeDate(past), $lte: normalizeDate(now) };
  }

  const analytics = await ChannelAnalytics.find(query).sort({ date: 1 });

  // Fetch videos once
  const videos = await Video.find({ channel: channelId });
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.comments || 0), 0);

  const currentSubs = channel.subscribers || 0;
  const currentVideos = videos.length;

  // Growth calculations
  let viewsGrowth = 0,
    subscribersGrowth = 0,
    likesGrowth = 0,
    commentsGrowth = 0;
  if (analytics.length >= 2) {
    const first = analytics[0];
    const last = analytics[analytics.length - 1];

    if (first.views > 0)
      viewsGrowth = ((last.views - first.views) / first.views) * 100;
    if (first.subscribers > 0)
      subscribersGrowth =
        ((last.subscribers - first.subscribers) / first.subscribers) * 100;
    if (totalLikes > 0)
      likesGrowth = ((totalLikes - first.likes) / first.likes) * 100 || 0;
    if (totalComments > 0)
      commentsGrowth =
        ((totalComments - first.comments) / first.comments) * 100 || 0;
  }

  const result = {
    overview: {
      totalViews,
      totalSubscribers: currentSubs,
      totalVideos: currentVideos,
      totalLikes,
      totalComments,
    },
    trends: {
      viewsGrowth: Number(viewsGrowth.toFixed(2)),
      subscribersGrowth: Number(subscribersGrowth.toFixed(2)),
      likesGrowth: Number(likesGrowth.toFixed(2)),
      commentsGrowth: Number(commentsGrowth.toFixed(2)),
      viewsChange: viewsGrowth >= 0 ? "up" : "down",
      subscribersChange: subscribersGrowth >= 0 ? "up" : "down",
      likesChange: likesGrowth >= 0 ? "up" : "down",
      commentsChange: commentsGrowth >= 0 ? "up" : "down",
    },
    recentData: analytics.map((a) => ({
      date: a.date,
      views: a.views,
      subscribers: a.subscribers,
      videos: a.videos,
    })),
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Channel analytics retrieved successfully")
    );
});

// Get analytics overview for dashboard
const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) throw new ApiError(400, "Channel ID is required");

  const channel = await Channel.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view analytics for your own channel");
  }

  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 7);

  const recentAnalytics = await ChannelAnalytics.find({
    channel: channelId,
    date: { $gte: normalizeDate(past), $lte: normalizeDate(now) },
  }).sort({ date: 1 });

  const videos = await Video.find({ channel: channelId });
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.comments || 0), 0);

  const topVideos = await Video.find({ channel: channelId })
    .sort({ views: -1 })
    .limit(5)
    .select("title views likes comments duration");

  const engagementRate =
    totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

  const result = {
    overview: {
      totalViews,
      totalSubscribers: channel.subscribers || 0,
      totalVideos: videos.length,
      totalLikes,
      totalComments,
      engagementRate: Number(engagementRate.toFixed(2)),
    },
    recentData: recentAnalytics.map((a) => ({
      date: a.date,
      views: a.views,
      subscribers: a.subscribers,
      videos: a.videos,
    })),
    topVideos,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Analytics overview retrieved successfully")
    );
});

// Get audience demographics (mock data for now)
const getAudienceDemographics = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) throw new ApiError(400, "Channel ID is required");

  const channel = await Channel.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view analytics for your own channel");
  }

  const demographics = {
    ageGroups: [
      { age: "18-24", percentage: 35 },
      { age: "25-34", percentage: 28 },
      { age: "35-44", percentage: 20 },
      { age: "45-54", percentage: 12 },
      { age: "55+", percentage: 5 },
    ],
    countries: [
      { country: "United States", percentage: 45 },
      { country: "United Kingdom", percentage: 15 },
      { country: "Canada", percentage: 12 },
      { country: "Australia", percentage: 8 },
      { country: "Germany", percentage: 6 },
      { country: "Others", percentage: 14 },
    ],
    devices: [
      { device: "Desktop", percentage: 60 },
      { device: "Mobile", percentage: 35 },
      { device: "Tablet", percentage: 5 },
    ],
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { audience: demographics },
        "Audience demographics retrieved successfully"
      )
    );
});

// Delete analytics for a specific date
const deleteAnalytics = asyncHandler(async (req, res) => {
  const { channelId, date } = req.params;
  if (!channelId) throw new ApiError(400, "Channel ID is required");
  if (!date) throw new ApiError(400, "Date is required");

  const channel = await Channel.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You can only delete analytics for your own channel"
    );
  }

  const analytics = await ChannelAnalytics.findOneAndDelete({
    channel: channelId,
    date: normalizeDate(date),
  });

  if (!analytics)
    throw new ApiError(404, "Analytics not found for the specified date");

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Analytics deleted successfully"));
});

// Bulk update analytics (import)
const bulkUpdateAnalytics = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { analytics } = req.body;

  if (!channelId) throw new ApiError(400, "Channel ID is required");
  if (!analytics || !Array.isArray(analytics)) {
    throw new ApiError(400, "Analytics array is required");
  }

  const channel = await Channel.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You can only update analytics for your own channel"
    );
  }

  const operations = analytics.map((item) => ({
    updateOne: {
      filter: {
        channel: channelId,
        date: normalizeDate(item.date),
      },
      update: {
        $set: {
          views: item.views || 0,
          subscribers: item.subscribers || 0,
          videos: item.videos || 0,
        },
      },
      upsert: true,
    },
  }));

  const result = await ChannelAnalytics.bulkWrite(operations);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Analytics bulk updated successfully"));
});

export {
  createOrUpdateAnalytics,
  getChannelAnalytics,
  getAnalyticsOverview,
  getAudienceDemographics,
  deleteAnalytics,
  bulkUpdateAnalytics,
};
