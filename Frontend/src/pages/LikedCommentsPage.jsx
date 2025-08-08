import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaComment, FaSearch, FaFilter, FaSort, FaUser, FaClock, FaThumbsUp } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const LikedCommentsPage = () => {
  const { user } = useAuth();
  const [likedComments, setLikedComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, oldest, likes, replies
  const [filterBy, setFilterBy] = useState("all"); // all, today, week, month

  // Mock data for demonstration
  const mockLikedComments = [
    {
      _id: "1",
      content: "This tutorial is absolutely amazing! I learned so much about React hooks. Thank you for making this content.",
      likes: 45,
      replies: 12,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      author: {
        name: "Sarah Johnson",
        handle: "sarah-dev",
        avatar: "https://via.placeholder.com/40x40",
      },
      video: {
        title: "How to Build a React App",
        id: "video1",
        thumbnail: "https://via.placeholder.com/120x68",
      },
      channel: {
        name: "Tech Tutorials",
        handle: "tech-tutorials",
      },
    },
    {
      _id: "2",
      content: "Great explanation of ES6 features! The arrow functions section was particularly helpful.",
      likes: 23,
      replies: 5,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      likedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      author: {
        name: "Mike Chen",
        handle: "mike-chen",
        avatar: "https://via.placeholder.com/40x40",
      },
      video: {
        title: "JavaScript ES6 Features",
        id: "video2",
        thumbnail: "https://via.placeholder.com/120x68",
      },
      channel: {
        name: "Code Masters",
        handle: "code-masters",
      },
    },
    {
      _id: "3",
      content: "CSS Grid is a game-changer for layouts. This video explains it perfectly!",
      likes: 67,
      replies: 18,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      likedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      author: {
        name: "Emily Rodriguez",
        handle: "emily-design",
        avatar: "https://via.placeholder.com/40x40",
      },
      video: {
        title: "CSS Grid Layout Tutorial",
        id: "video3",
        thumbnail: "https://via.placeholder.com/120x68",
      },
      channel: {
        name: "Web Design Pro",
        handle: "web-design-pro",
      },
    },
    {
      _id: "4",
      content: "Node.js backend development is so powerful. This tutorial shows the best practices perfectly!",
      likes: 89,
      replies: 25,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      likedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      author: {
        name: "David Kim",
        handle: "david-backend",
        avatar: "https://via.placeholder.com/40x40",
      },
      video: {
        title: "Node.js Backend Development",
        id: "video4",
        thumbnail: "https://via.placeholder.com/120x68",
      },
      channel: {
        name: "Backend Dev",
        handle: "backend-dev",
      },
    },
    {
      _id: "5",
      content: "Python for data science is incredible! This video covers all the essential libraries.",
      likes: 34,
      replies: 8,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      likedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      author: {
        name: "Lisa Wang",
        handle: "lisa-data",
        avatar: "https://via.placeholder.com/40x40",
      },
      video: {
        title: "Python Data Science",
        id: "video5",
        thumbnail: "https://via.placeholder.com/120x68",
      },
      channel: {
        name: "Data Science Hub",
        handle: "data-science-hub",
      },
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchLikedComments = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLikedComments(mockLikedComments);
      } catch (error) {
        console.error("Error fetching liked comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedComments();
  }, []);

  const unlikeComment = (commentId) => {
    setLikedComments(likedComments.filter(comment => comment._id !== commentId));
  };

  const filterAndSortComments = () => {
    let filtered = likedComments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(comment =>
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply time filter
    const now = new Date();
    switch (filterBy) {
      case "today":
        filtered = filtered.filter(comment => {
          const likedDate = new Date(comment.likedAt);
          return likedDate.toDateString() === now.toDateString();
        });
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(comment => {
          const likedDate = new Date(comment.likedAt);
          return likedDate >= weekAgo;
        });
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(comment => {
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
                        onClick={() => unlikeComment(comment._id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Unlike comment"
                      >
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredComments.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaComment className="text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredComments.length} liked comment{filteredComments.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredComments.length} of {likedComments.length} total liked comments
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedCommentsPage;
