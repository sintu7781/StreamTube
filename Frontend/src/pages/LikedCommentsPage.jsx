import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaComment,
  FaSearch,
  FaFilter,
  FaSort,
  FaUser,
  FaClock,
  FaThumbsUp,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getLikedComments, toggleCommentLike } from "../api/likes";

const LikedCommentsPage = () => {
  const { user } = useAuth();
  const [likedComments, setLikedComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, oldest, likes, replies
  const [filterBy, setFilterBy] = useState("all"); // all, today, week, month
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [unlikingComments, setUnlikingComments] = useState(new Set());

  // Helper function to transform API data to component format
  const transformApiData = (apiData) => {
    return apiData.map((like) => {
      const comment = like.target;
      const video = comment.video;
      const channel = video?.channel;
      const author = comment.user;

      return {
        _id: like._id,
        content: comment.content,
        likes: comment.metadata?.likes || 0,
        replies: comment.metadata?.replies || 0,
        createdAt: new Date(comment.createdAt),
        likedAt: new Date(like.createdAt),
        author: {
          name: author?.fullName || author?.username || "Unknown User",
          handle: author?.username || "unknown",
          avatar:
            author?.profile?.picture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              author?.fullName || author?.username || "User"
            )}&background=random`,
        },
        video: {
          title: video?.title || "Unknown Video",
          id: video?._id,
          thumbnail: video?.thumbnail?.url,
        },
        channel: {
          name: channel?.name || "Unknown Channel",
          handle: channel?.handle || "unknown",
        },
        // Keep original data for unlike functionality
        originalCommentId: comment._id,
        originalLikeId: like._id,
      };
    });
  };

  // Fetch liked comments from API
  const fetchLikedComments = async (page = 1) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getLikedComments({ page, limit: 20 });

      if (response.success && response.data) {
        const transformedComments = transformApiData(
          response.data.likedComments || []
        );
        setLikedComments(transformedComments);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || "Failed to fetch liked comments");
      }
    } catch (error) {
      console.error("Error fetching liked comments:", error);
      setError(
        error.message || "Failed to load liked comments. Please try again."
      );
      setLikedComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedComments(currentPage);
  }, [user, currentPage]);

  // Unlike a comment using the API
  const unlikeComment = async (comment) => {
    // Add to loading set
    setUnlikingComments((prev) => new Set([...prev, comment._id]));

    try {
      // Call the API to unlike the comment
      await toggleCommentLike(comment.originalCommentId, -1);

      // Remove the comment from the local state
      setLikedComments((prevComments) =>
        prevComments.filter((c) => c._id !== comment._id)
      );
    } catch (error) {
      console.error("Error unliking comment:", error);
      setError("Failed to unlike comment. Please try again.");

      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      // Remove from loading set
      setUnlikingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(comment._id);
        return newSet;
      });
    }
  };

  const filterAndSortComments = () => {
    let filtered = likedComments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.author.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          comment.video.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          comment.channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply time filter
    const now = new Date();
    switch (filterBy) {
      case "today":
        filtered = filtered.filter((comment) => {
          const likedDate = new Date(comment.likedAt);
          return likedDate.toDateString() === now.toDateString();
        });
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((comment) => {
          const likedDate = new Date(comment.likedAt);
          return likedDate >= weekAgo;
        });
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((comment) => {
          const likedDate = new Date(comment.likedAt);
          return likedDate >= monthAgo;
        });
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.likedAt) - new Date(b.likedAt));
        break;
      case "likes":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "replies":
        filtered.sort((a, b) => b.replies - a.replies);
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

  const filteredComments = filterAndSortComments();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaComment className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign in to view liked comments
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to see your liked comments.
          </p>
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <FaComment className="text-2xl text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Liked Comments
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comments you've liked will appear here
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search liked comments..."
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
                    <option value="likes">Most likes</option>
                    <option value="replies">Most replies</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {filteredComments.length === 0 ? (
          <div className="text-center py-12">
            <FaComment className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No liked comments found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterBy !== "all"
                ? "No comments match your current filters"
                : "Comments you like will appear here"}
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
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex space-x-4">
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0">
                    <Link to={`/watch/${comment.video.id}`}>
                      <img
                        src={comment.video.thumbnail}
                        alt={comment.video.title}
                        className="w-32 h-18 object-cover rounded-lg"
                      />
                    </Link>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Video Info */}
                        <div className="mb-3">
                          <Link
                            to={`/watch/${comment.video.id}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {comment.video.title}
                          </Link>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            by {comment.channel.name}
                          </span>
                        </div>

                        {/* Comment */}
                        <div className="mb-3">
                          <div className="flex items-start space-x-3">
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Link
                                  to={`/c/${comment.author.handle}`}
                                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  {comment.author.name}
                                </Link>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimeAgo(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Comment Stats */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <FaThumbsUp className="mr-1" />
                            {comment.likes} likes
                          </span>
                          <span className="flex items-center">
                            <FaComment className="mr-1" />
                            {comment.replies} replies
                          </span>
                          <span className="flex items-center">
                            <FaHeart className="mr-1 text-red-500" />
                            Liked {formatTimeAgo(comment.likedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Unlike Button */}
                      <button
                        onClick={() => unlikeComment(comment)}
                        disabled={unlikingComments.has(comment._id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          unlikingComments.has(comment._id)
                            ? "Unliking..."
                            : "Unlike comment"
                        }
                      >
                        {unlikingComments.has(comment._id) ? (
                          <div className="animate-spin w-4 h-4 border-b-2 border-gray-400 rounded-full"></div>
                        ) : (
                          <FaHeart />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Summary */}
        {pagination && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaComment className="text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {pagination.totalItems} total liked comment
                  {pagination.totalItems !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredComments.length} of {likedComments.length} on
                this page
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedCommentsPage;
