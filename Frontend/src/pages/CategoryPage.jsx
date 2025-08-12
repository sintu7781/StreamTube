import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getVideosByCategory } from "../api/videos";
import VideoCard from "../components/video/VideoCard";
import Spinner from "../components/common/Spinner";
import {
  FaMusic,
  FaGamepad,
  FaFilm,
  FaNewspaper,
  FaGraduationCap,
  FaLightbulb,
  FaDumbbell,
  FaUsers,
  FaFilter,
  FaSort,
} from "react-icons/fa";

const CategoryPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const category = searchParams.get("category") || "all";
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Category configurations
  const categoryConfig = {
    all: {
      name: "All Videos",
      icon: null,
      description: "Discover all videos on our platform",
      color: "blue",
    },
    music: {
      name: "Music",
      icon: FaMusic,
      description: "Music videos, concerts, and performances",
      color: "purple",
    },
    gaming: {
      name: "Gaming",
      icon: FaGamepad,
      description: "Gaming content, reviews, and gameplay",
      color: "green",
    },
    movies: {
      name: "Movies",
      icon: FaFilm,
      description: "Movie trailers, reviews, and cinema content",
      color: "red",
    },
    news: {
      name: "News",
      icon: FaNewspaper,
      description: "Latest news and current events",
      color: "blue",
    },
    education: {
      name: "Education",
      icon: FaGraduationCap,
      description: "Educational content and tutorials",
      color: "yellow",
    },
    technology: {
      name: "Technology",
      icon: FaLightbulb,
      description: "Tech reviews, tutorials, and innovations",
      color: "indigo",
    },
    sports: {
      name: "Sports",
      icon: FaDumbbell,
      description: "Sports highlights, news, and analysis",
      color: "orange",
    },
    entertainment: {
      name: "Entertainment",
      icon: FaUsers,
      description: "Entertainment shows, comedy, and lifestyle",
      color: "pink",
    },
  };

  const currentCategory = categoryConfig[category] || categoryConfig.all;

  useEffect(() => {
    setCurrentPage(1);
    fetchVideos();
  }, [category, sortBy, sortOrder]);

  useEffect(() => {
    fetchVideos();
  }, [currentPage]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getVideosByCategory(category, {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
      });

      setVideos(response.data.videos || []);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
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

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 text-white",
      purple: "from-purple-500 to-purple-600 text-white",
      green: "from-green-500 to-green-600 text-white",
      red: "from-red-500 to-red-600 text-white",
      yellow: "from-yellow-500 to-yellow-600 text-white",
      indigo: "from-indigo-500 to-indigo-600 text-white",
      orange: "from-orange-500 to-orange-600 text-white",
      pink: "from-pink-500 to-pink-600 text-white",
    };
    return colors[color] || colors.blue;
  };

  if (loading && videos.length === 0) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Header */}
        <div className={`rounded-xl p-8 mb-8 bg-gradient-to-r ${getColorClasses(currentCategory.color)}`}>
          <div className="flex items-center">
            {currentCategory.icon && (
              <currentCategory.icon className="text-4xl mr-4" />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{currentCategory.name}</h1>
              <p className="text-lg opacity-90">{currentCategory.description}</p>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {pagination?.totalVideos || 0} videos found
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
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
              <option value="createdAt-desc">Latest</option>
              <option value="createdAt-asc">Oldest</option>
              <option value="metadata.views-desc">Most Viewed</option>
              <option value="metadata.views-asc">Least Viewed</option>
              <option value="title-asc">A-Z</option>
              <option value="title-desc">Z-A</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && !error && (
          <div className="text-center py-20">
            {currentCategory.icon && (
              <currentCategory.icon className="mx-auto text-6xl text-gray-400 mb-4" />
            )}
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No {currentCategory.name.toLowerCase()} videos found
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to upload content in this category!
            </p>
          </div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {/* Loading more indicator */}
            {loading && videos.length > 0 && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage || loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {/* Show page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === pagination.currentPage;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          isCurrentPage
                            ? `bg-gradient-to-r ${getColorClasses(currentCategory.color)}`
                            : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
