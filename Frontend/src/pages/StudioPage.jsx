import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyChannel } from "../api/channel";
import Spinner from "../components/common/Spinner";
import { FaVideo, FaChartLine, FaCog, FaUpload } from "react-icons/fa";

const StudioPage = () => {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        const response = await getMyChannel();
        setChannel(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChannel();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Sign in to access Studio
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You need to be signed in to access the Studio.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) return <Spinner />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!channel) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Create a Channel First
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You need to create a channel before accessing the Studio.
        </p>
        <button
          onClick={() => navigate("/create-channel")}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Create Channel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Studio
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your channel and content
        </p>
      </div>

      {/* Channel Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={channel.owner?.profile?.picture || "https://via.placeholder.com/64"}
              alt={channel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {channel.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              @{channel.handle}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>{channel.stats?.subscribers || 0} subscribers</span>
              <span>{channel.stats?.videos || 0} videos</span>
              <span>{channel.stats?.views || 0} views</span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/c/${channel.handle}`)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View Channel
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => navigate("/upload")}
          className="bg-red-600 text-white p-6 rounded-lg hover:bg-red-700 transition-colors text-left"
        >
          <FaUpload className="text-2xl mb-3" />
          <h3 className="font-semibold mb-1">Upload Video</h3>
          <p className="text-sm opacity-90">Share your content with the world</p>
        </button>

        <button
          onClick={() => navigate("/analytics")}
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-left"
        >
          <FaChartLine className="text-2xl mb-3" />
          <h3 className="font-semibold mb-1">Analytics</h3>
          <p className="text-sm opacity-90">Track your channel performance</p>
        </button>

        <button
          onClick={() => navigate("/videos/manage")}
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-left"
        >
          <FaVideo className="text-2xl mb-3" />
          <h3 className="font-semibold mb-1">Manage Videos</h3>
          <p className="text-sm opacity-90">Edit and organize your content</p>
        </button>

        <button
          onClick={() => navigate("/channel/settings")}
          className="bg-gray-600 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors text-left"
        >
          <FaCog className="text-2xl mb-3" />
          <h3 className="font-semibold mb-1">Channel Settings</h3>
          <p className="text-sm opacity-90">Customize your channel</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                Channel created successfully
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(channel.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {channel.stats?.videos === 0 && (
            <div className="text-center py-8">
              <FaVideo className="text-4xl text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No videos yet
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Start building your channel by uploading your first video
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Upload First Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioPage; 