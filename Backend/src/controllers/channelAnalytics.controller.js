import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ChannelAnalytics from "../models/channelAnalytics.model.js";
import Channel from "../models/channel.model.js";
import Video from "../models/video.model.js";

// Create or update channel analytics for a specific date
const createOrUpdateAnalytics = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { date, views, subscribers, videos } = req.body;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Check if channel exists
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if user owns the channel
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update analytics for your own channel");
  }

  // Parse date or use current date
  const analyticsDate = date ? new Date(date) : new Date();
  analyticsDate.setHours(0, 0, 0, 0); // Set to start of day

  // Check if analytics already exists for this date
  let analytics = await ChannelAnalytics.findOne({
    channel: channelId,
    date: analyticsDate,
  });

  if (analytics) {
    // Update existing analytics
    analytics.views = views !== undefined ? views : analytics.views;
    analytics.subscribers = subscribers !== undefined ? subscribers : analytics.subscribers;
    analytics.videos = videos !== undefined ? videos : analytics.videos;
  } else {
    // Create new analytics
    analytics = new ChannelAnalytics({
      channel: channelId,
      date: analyticsDate,
      views: views || 0,
      subscribers: subscribers || 0,
      videos: videos || 0,
    });
  }

  await analytics.save();

  res.status(200).json(
    new ApiResponse(200, analytics, "Channel analytics updated successfully")
  );
});

// Get channel analytics for a specific date range
const getChannelAnalytics = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { startDate, endDate, period = "30" } = req.query;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Check if channel exists
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if user owns the channel
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view analytics for your own channel");
  }

  let query = { channel: channelId };

  // Add date range filter if provided
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Default to last N days based on period
    const days = parseInt(period);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    query.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const analytics = await ChannelAnalytics.find(query).sort({ date: 1 });

  // Calculate summary statistics
  const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
  const totalSubscribers = analytics.length > 0 ? analytics[analytics.length - 1].subscribers : 0;
  const totalVideos = analytics.reduce((sum, item) => sum + item.videos, 0);

  // Calculate growth rates
  let viewsGrowth = 0;
  let subscribersGrowth = 0;

  if (analytics.length >= 2) {
    const first = analytics[0];
    const last = analytics[analytics.length - 1];
    
    if (first.views > 0) {
      viewsGrowth = ((last.views - first.views) / first.views) * 100;
    }
    
    if (first.subscribers > 0) {
      subscribersGrowth = ((last.subscribers - first.subscribers) / first.subscribers) * 100;
    }
  }

  // Get current video count
  const currentVideoCount = await Video.countDocuments({ channel: channelId });

  // Get engagement metrics from videos
  const videos = await Video.find({ channel: channelId });
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0);
  const totalComments = videos.reduce((sum, video) => sum + (video.comments || 0), 0);

  const result = {
    analytics,
    summary: {
      totalViews,
      totalSubscribers,
      totalVideos: currentVideoCount,
      totalLikes,
      totalComments,
      viewsGrowth: Math.round(viewsGrowth * 100) / 100,
      subscribersGrowth: Math.round(subscribersGrowth * 100) / 100,
    },
    trends: {
      viewsChange: viewsGrowth >= 0 ? "up" : "down",
      subscribersChange: subscribersGrowth >= 0 ? "up" : "down",
    },
  };

  res.status(200).json(
    new ApiResponse(200, result, "Channel analytics retrieved successfully")
  );
});

// Get analytics overview for dashboard
const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Check if channel exists
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if user owns the channel
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view analytics for your own channel");
  }

  // Get last 7 days of analytics
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const recentAnalytics = await ChannelAnalytics.find({
    channel: channelId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  // Get video statistics
  const videos = await Video.find({ channel: channelId });
  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0);
  const totalComments = videos.reduce((sum, video) => sum + (video.comments || 0), 0);

  // Get top performing videos
  const topVideos = await Video.find({ channel: channelId })
    .sort({ views: -1 })
    .limit(5)
    .select("title views likes comments duration");

  // Calculate engagement rate
  const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

  const overview = {
    totalViews,
    totalSubscribers: channel.subscribers || 0,
    totalVideos: videos.length,
    totalLikes,
    totalComments,
    engagementRate: Math.round(engagementRate * 100) / 100,
    recentData: recentAnalytics.map(item => ({
      date: item.date,
      views: item.views,
      subscribers: item.subscribers,
      videos: item.videos,
    })),
    topVideos,
  };

  res.status(200).json(
    new ApiResponse(200, overview, "Analytics overview retrieved successfully")
  );
});

// Get audience demographics (mock data for now)
const getAudienceDemographics = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Check if channel exists
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if user owns the channel
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view analytics for your own channel");
  }

  // Mock demographics data (in a real app, this would come from analytics tracking)
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

  res.status(200).json(
    new ApiResponse(200, demographics, "Audience demographics retrieved successfully")
  );
});

// Delete analytics for a specific date
const deleteAnalytics = asyncHandler(async (req, res) => {
  const { channelId, date } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  // Check if channel exists
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if user owns the channel
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete analytics for your own channel");
  }

  const analyticsDate = new Date(date);
  analyticsDate.setHours(0, 0, 0, 0);

  const analytics = await ChannelAnalytics.findOneAndDelete({
    channel: channelId,
    date: analyticsDate,
  });

  if (!analytics) {
    throw new ApiError(404, "Analytics not found for the specified date");
  }

  res.status(200).json(
    new ApiResponse(200, {}, "Analytics deleted successfully")
  );
});

// Bulk update analytics (for importing data)
const bulkUpdateAnalytics = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { analytics } = req.body;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  if (!analytics || !Array.isArray(analytics)) {
    throw new ApiError(400, "Analytics array is required");
  }

  // Check if channel exists
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if user owns the channel
  if (channel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update analytics for your own channel");
  }

  const operations = analytics.map(item => ({
    updateOne: {
      filter: {
        channel: channelId,
        date: new Date(item.date),
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

  res.status(200).json(
    new ApiResponse(200, result, "Analytics bulk updated successfully")
  );
});

export {
  createOrUpdateAnalytics,
  getChannelAnalytics,
  getAnalyticsOverview,
  getAudienceDemographics,
  deleteAnalytics,
  bulkUpdateAnalytics,
};
