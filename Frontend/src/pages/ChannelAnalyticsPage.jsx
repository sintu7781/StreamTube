import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaChartLine,
  FaEye,
  FaUsers,
  FaVideo,
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaHeart,
  FaComment,
  FaShare,
} from "react-icons/fa";

const ChannelAnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // 7, 30, 90 days
  const [activeTab, setActiveTab] = useState("overview");

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalViews: 125000,
      totalSubscribers: 2500,
      totalVideos: 45,
      totalLikes: 8900,
      totalComments: 2300,
      totalShares: 1200,
    },
    trends: {
      viewsGrowth: 15.5,
      subscribersGrowth: 8.2,
      engagementGrowth: 12.1,
      viewsChange: "up",
      subscribersChange: "up",
      engagementChange: "up",
    },
    recentData: [
      { date: "2024-01-01", views: 1200, subscribers: 25, videos: 1 },
      { date: "2024-01-02", views: 1350, subscribers: 28, videos: 0 },
      { date: "2024-01-03", views: 1100, subscribers: 22, videos: 1 },
      { date: "2024-01-04", views: 1600, subscribers: 35, videos: 0 },
      { date: "2024-01-05", views: 1400, subscribers: 30, videos: 1 },
      { date: "2024-01-06", views: 1800, subscribers: 40, videos: 0 },
      { date: "2024-01-07", views: 1700, subscribers: 38, videos: 1 },
    ],
    topVideos: [
      {
        title: "How to Build a React App",
        views: 25000,
        likes: 1200,
        comments: 350,
        shares: 180,
        duration: "15:30",
      },
      {
        title: "JavaScript ES6 Features",
        views: 18000,
        likes: 890,
        comments: 220,
        shares: 95,
        duration: "22:15",
      },
      {
        title: "CSS Grid Layout Tutorial",
        views: 15000,
        likes: 750,
        comments: 180,
        shares: 85,
        duration: "18:45",
      },
    ],
    audience: {
      demographics: {
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
      },
    },
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getGrowthIcon = (change) => {
    return change === "up" ? (
      <FaArrowUp className="text-green-500" />
    ) : (
      <FaArrowDown className="text-red-500" />
    );
  };

  const getGrowthColor = (change) => {
    return change === "up" ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="text-center">
            <FaChartLine className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No analytics data available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Analytics data will appear here once you start uploading videos
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaChartLine className="text-2xl text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Channel Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Range:
              </span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your channel's performance and audience insights
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics.overview.totalViews)}
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analytics.trends.viewsChange)}
                  <span
                    className={`text-sm font-medium ml-1 ${getGrowthColor(
                      analytics.trends.viewsChange
                    )}`}
                  >
                    {analytics.trends.viewsGrowth}%
                  </span>
                </div>
              </div>
              <FaEye className="text-3xl text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Subscribers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics.overview.totalSubscribers)}
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analytics.trends.subscribersChange)}
                  <span
                    className={`text-sm font-medium ml-1 ${getGrowthColor(
                      analytics.trends.subscribersChange
                    )}`}
                  >
                    {analytics.trends.subscribersGrowth}%
                  </span>
                </div>
              </div>
              <FaUsers className="text-3xl text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Videos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.overview.totalVideos}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Published videos
                </p>
              </div>
              <FaVideo className="text-3xl text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Engagement Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.trends.engagementGrowth}%
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analytics.trends.engagementChange)}
                  <span
                    className={`text-sm font-medium ml-1 ${getGrowthColor(
                      analytics.trends.engagementChange
                    )}`}
                  >
                    {analytics.trends.engagementGrowth}%
                  </span>
                </div>
              </div>
              <FaHeart className="text-3xl text-red-600" />
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Likes
              </h3>
              <FaHeart className="text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(analytics.overview.totalLikes)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Total likes received
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comments
              </h3>
              <FaComment className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(analytics.overview.totalComments)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Total comments received
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shares
              </h3>
              <FaShare className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(analytics.overview.totalShares)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Total shares received
            </p>
          </div>
        </div>

        {/* Recent Activity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity (Last 7 Days)
          </h3>
          <div className="space-y-4">
            {analytics.recentData.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <FaCalendar className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <FaEye className="text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(day.views)} views
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaUsers className="text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      +{day.subscribers} subscribers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaVideo className="text-purple-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {day.videos} videos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Videos
          </h3>
          <div className="space-y-4">
            {analytics.topVideos.map((video, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {video.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration: {video.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(video.views)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Views
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(video.likes)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Likes
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(video.comments)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Comments
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(video.shares)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Shares
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Age Demographics
            </h3>
            <div className="space-y-3">
              {analytics.audience.demographics.ageGroups.map((group, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {group.age}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {group.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Countries
            </h3>
            <div className="space-y-3">
              {analytics.audience.demographics.countries.map(
                (country, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {country.country}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                        {country.percentage}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelAnalyticsPage;
