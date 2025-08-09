import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaVideo, FaUser, FaEye, FaClock } from "react-icons/fa";
import { searchVideos, searchChannels } from "../api/videos";
import VideoCard from "../components/video/VideoCard";
import Spinner from "../components/common/Spinner";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [videosData, channelsData] = await Promise.all([
        searchVideos(query),
        searchChannels(query),
      ]);
      setVideos(videosData?.data?.videos || []);
      setChannels(channelsData?.data?.channels || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <FaSearch className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search for videos and channels
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search term to find videos and channels
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Search results for "{query}"
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {loading
            ? "Searching..."
            : `${videos.length + channels.length} results found`}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("videos")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "videos"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Videos ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab("channels")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "channels"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Channels ({channels.length})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Videos Tab */}
          {activeTab === "videos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.length > 0 ? (
                videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FaVideo className="mx-auto text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No videos found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Channels Tab */}
          {activeTab === "channels" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.length > 0 ? (
                channels.map((channel) => (
                  <div
                    key={channel._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <img
                          src={
                            channel.avatar ||
                            `https://ui-avatars.com/api/?name=${channel.name}&background=random`
                          }
                          alt={channel.name}
                          className="w-15 h-15 rounded-full mr-4"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {channel.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{channel.handle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>
                          {formatViewCount(channel.stats?.subscribers || 0)}{" "}
                          subscribers
                        </span>
                        <span>{channel.stats?.videos || 0} videos</span>
                      </div>

                      {channel.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                          {channel.description}
                        </p>
                      )}

                      <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        Subscribe
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No channels found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
