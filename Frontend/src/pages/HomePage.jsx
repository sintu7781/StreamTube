// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/video/VideoCard";
import { getAllVideos } from "../api/videos";
import Spinner from "../components/common/Spinner";
import { FaPlay, FaUpload } from "react-icons/fa";
import { HiTrendingUp } from "react-icons/hi";

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosData = await getAllVideos();
        const apiVideos = videosData.data?.videos || videosData.data || [];
        // If no videos from API, use demo videos, otherwise combine them
        const allVideos = apiVideos;
        setVideos(allVideos);
      } catch (err) {
        console.log("API not available, using demo videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <Spinner />;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-full">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Actions for Logged in Users */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Welcome back
                  {user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Ready to create something amazing?
                </p>
              </div>
              <button
                onClick={() => navigate("/upload")}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <FaUpload className="mr-2 h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaPlay className="text-4xl text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No videos yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {user
                  ? "Be the first to upload a video!"
                  : "Sign in to upload and share your creativity with the world."}
              </p>
              {user ? (
                <button
                  onClick={() => navigate("/upload")}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm font-medium"
                >
                  <FaUpload className="mr-2" />
                  Upload Video
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
