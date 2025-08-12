import React, { useState, useEffect } from "react";
import { 
  getWatchLaterList, 
  getWatchLaterStats, 
  removeFromWatchLater, 
  clearWatchLater,
  reorderWatchLater 
} from "../api/watchLater";
import VideoCard from "../components/video/VideoCard";
import Spinner from "../components/common/Spinner";
import { 
  FaTrash, 
  FaClock, 
  FaPlay, 
  FaSort,
  FaGripVertical,
  FaSearch,
  FaFilter
} from "react-icons/fa";
import { formatDuration } from "../utils/format";

const WatchLaterPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("addedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [removingVideos, setRemovingVideos] = useState(new Set());

  useEffect(() => {
    fetchWatchLaterData();
    fetchStats();
  }, [currentPage, sortBy, sortOrder]);

  const fetchWatchLaterData = async () => {
    try {
      setLoading(true);
      const response = await getWatchLaterList(currentPage, 20, sortBy, sortOrder);
      setVideos(response.data.videos);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load watch later list");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getWatchLaterStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (removingVideos.has(videoId)) return;

    try {
      setRemovingVideos(prev => new Set(prev).add(videoId));
      await removeFromWatchLater(videoId);
      setVideos(prev => prev.filter(item => item.video._id !== videoId));
      fetchStats(); // Update stats
    } catch (err) {
      console.error("Failed to remove video:", err);
    } finally {
      setRemovingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await clearWatchLater();
      setVideos([]);
      setStats({ totalVideos: 0, totalDuration: 0 });
      setShowClearConfirm(false);
    } catch (err) {
      console.error("Failed to clear watch later:", err);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };


  const filteredVideos = videos.filter(item =>
    item.video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.video.channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && videos.length === 0) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaClock className="mr-3 text-blue-600" />
                Watch Later
              </h1>
              {stats && (
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {stats.totalVideos} videos • {formatDuration(stats.totalDuration || 0)}
                </p>
              )}
            </div>
            {videos.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Clear All
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="addedAt-desc">Recently Added</option>
                <option value="addedAt-asc">Oldest First</option>
                <option value="position-asc">Custom Order</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="text-center py-10 text-red-500">
            {error}
          </div>
        )}

        {!loading && filteredVideos.length === 0 && !error && (
          <div className="text-center py-20">
            <FaClock className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No videos in watch later
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "No videos match your search." : "Videos you save for later will appear here."}
            </p>
          </div>
        )}

        {filteredVideos.length > 0 && (
          <>
            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((item) => (
                <div key={item.video._id} className="relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveVideo(item.video._id)}
                    disabled={removingVideos.has(item.video._id)}
                    className="absolute top-2 left-2 z-10 p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {removingVideos.has(item.video._id) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaTrash className="text-sm" />
                    )}
                  </button>

                  <VideoCard video={item.video} />

                  {/* Watch Later Info */}
                  <div className="mt-2 px-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage || loading}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                
                <span className="text-gray-700 dark:text-gray-300">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Clear Watch Later List?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This will remove all {videos.length} videos from your watch later list. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchLaterPage;
