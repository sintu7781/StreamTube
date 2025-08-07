// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/video/VideoCard";
import { getAllVideos } from "../api/videos";
import Spinner from "../components/common/Spinner";

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
        setVideos(videosData.data?.videos || videosData.data || []);
        console.log(videosData);
      } catch (err) {
        setError(err.message || "Failed to load videos");
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {user ? "Recommended for you" : "Trending Videos"}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No videos found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Be the first to upload a video!
          </p>
          {user && (
            <button
              onClick={() => navigate("/upload")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Upload Video
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
