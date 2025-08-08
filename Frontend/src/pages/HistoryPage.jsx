import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHistory, FaClock, FaTrash, FaEye, FaCalendar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/video/VideoCard";

const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, today, week, month
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for demonstration
  const mockHistory = [
    {
      _id: "1",
      title: "How to Build a React App",
      description: "Learn the basics of React development",
      thumbnail: "https://via.placeholder.com/320x180",
      duration: "12:34",
      views: 1500,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      channel: {
        name: "Tech Tutorials",
        handle: "tech-tutorials",
        avatar: "https://via.placeholder.com/40x40",
      },
    },
    {
      _id: "2",
      title: "JavaScript ES6 Features",
      description: "Modern JavaScript features you need to know",
      thumbnail: "https://via.placeholder.com/320x180",
      duration: "18:45",
      views: 2300,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      channel: {
        name: "Code Masters",
        handle: "code-masters",
        avatar: "https://via.placeholder.com/40x40",
      },
    },
    {
      _id: "3",
      title: "CSS Grid Layout Tutorial",
      description: "Master CSS Grid for modern layouts",
      thumbnail: "https://via.placeholder.com/320x180",
      duration: "25:12",
      views: 890,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      channel: {
        name: "Web Design Pro",
        handle: "web-design-pro",
        avatar: "https://via.placeholder.com/40x40",
      },
    },
    {
      _id: "4",
      title: "Node.js Backend Development",
      description: "Build scalable backend applications",
      thumbnail: "https://via.placeholder.com/320x180",
      duration: "42:18",
      views: 3100,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      channel: {
        name: "Backend Dev",
        handle: "backend-dev",
        avatar: "https://via.placeholder.com/40x40",
      },
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHistory(mockHistory);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (videoId) => {
    setHistory(history.filter(video => video._id !== videoId));
  };

  const filterHistory = () => {
    let filtered = history;

    // Apply time filter
    const now = new Date();
    switch (filter) {
      case "today":
        filtered = filtered.filter(video => {
          const videoDate = new Date(video.createdAt);
          return videoDate.toDateString() === now.toDateString();
        });
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(video => {
          const videoDate = new Date(video.createdAt);
          return videoDate >= weekAgo;
        });
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(video => {
          const videoDate = new Date(video.createdAt);
          return videoDate >= monthAgo;
        });
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }
  };

  const filteredHistory = filterHistory();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <FaHistory className="text-2xl text-gray-600 dark:text-gray-400 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Watch History
              </h1>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash className="mr-2" />
              Clear History
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your viewing history is private and can be cleared at any time
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <FaEye className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Time Filter */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by time:
                </span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No videos in history
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filter !== "all"
                ? "No videos match your current filters"
                : "Videos you watch will appear here"}
            </p>
            {searchQuery || filter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Watching
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((video) => (
              <div
                key={video._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex items-start space-x-4">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-48 h-27 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          <Link
                            to={`/watch/${video._id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {video.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <Link
                            to={`/c/${video.channel.handle}`}
                            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <img
                              src={video.channel.avatar}
                              alt={video.channel.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            {video.channel.name}
                          </Link>
                          <span>{video.views.toLocaleString()} views</span>
                          <span className="flex items-center">
                            <FaClock className="mr-1" />
                            {formatTimeAgo(video.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromHistory(video._id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Remove from history"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredHistory.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaCalendar className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredHistory.length} video{filteredHistory.length !== 1 ? "s" : ""} in history
                </span>
              </div>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Clear all history
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
