import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaEye, FaSearch, FaFilter, FaSort } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getLikedVideos } from "../api/likes";
import VideoCard from "../components/video/VideoCard";

const LikedVideosPage = () => {
  const { user } = useAuth();
  const [likedVideos, setLikedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, oldest, title, views
  const [filterBy, setFilterBy] = useState("all"); // all, today, week, month
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLikedVideos = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getLikedVideos();
        if (response.success) {
          setLikedVideos(response.data.likedVideos || []);
        } else {
          setError("Failed to load liked videos");
        }
      } catch (error) {
        console.error("Error fetching liked videos:", error);
        setError("Failed to load liked videos");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchLikedVideos();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const unlikeVideo = (videoId) => {
    setLikedVideos(likedVideos.filter((item) => item.target?._id !== videoId));
  };

  const filterAndSortVideos = () => {
    let filtered = likedVideos.filter((item) => item.target); // Only include items with valid targets

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.target?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.target?.channel?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.target?.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply time filter
    const now = new Date();
    switch (filterBy) {
      case "today":
        filtered = filtered.filter((item) => {
          const likedDate = new Date(item.createdAt);
          return likedDate.toDateString() === now.toDateString();
        });
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((item) => {
          const likedDate = new Date(item.createdAt);
          return likedDate >= weekAgo;
        });
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((item) => {
          const likedDate = new Date(item.createdAt);
          return likedDate >= monthAgo;
        });
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "title":
        filtered.sort((a, b) =>
          (a.target?.title || "").localeCompare(b.target?.title || "")
        );
        break;
      case "views":
        filtered.sort(
          (a, b) =>
            (b.target?.metadata?.views || 0) - (a.target?.metadata?.views || 0)
        );
        break;
      default:
        break;
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

  const filteredVideos = filterAndSortVideos();

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
          <div className="flex items-center">
            <FaHeart className="text-2xl text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Liked Videos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Videos you've liked will appear here
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search liked videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filter:
                  </span>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="all">All time</option>
                    <option value="today">Today</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <FaSort className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="recent">Most recent</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Title A-Z</option>
                    <option value="views">Most views</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No liked videos found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterBy !== "all"
                ? "No videos match your current filters"
                : "Videos you like will appear here"}
            </p>
            {searchQuery || filterBy !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterBy("all");
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
                Discover Videos
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((item) => {
              const video = item.target;
              if (!video) return null;

              return (
                <div key={item._id || video._id} className="relative group">
                  <VideoCard video={video} />
                  <button
                    onClick={() => unlikeVideo(video._id)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                    title="Unlike video"
                  >
                    <FaHeart />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-10">
                    Liked {formatTimeAgo(item.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filteredVideos.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaHeart className="text-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredVideos.length} liked video
                  {filteredVideos.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredVideos.length} of {likedVideos.length} total
                liked videos
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedVideosPage;
