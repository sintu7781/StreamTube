// src/pages/WatchPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSingleVideo } from "../api/videos";
import VideoPlayer from "../components/video/VideoPlayer";
import { FaThumbsUp, FaThumbsDown, FaShare, FaSave } from "react-icons/fa";
import { formatViews, formatDate } from "../utils/format";
import VideoCard from "../components/video/VideoCard";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";

const WatchPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await getSingleVideo(id);
        setVideo(videoData.data);
        console.log(videoData.data);

        // Fetch related videos (in a real app, you'd have an API for this)
        // For now, we'll use a mock
        setRelatedVideos([
          { ...videoData, _id: "1", title: "Related Video 1" },
          { ...videoData, _id: "2", title: "Related Video 2" },
          { ...videoData, _id: "3", title: "Related Video 3" },
        ]);
      } catch (err) {
        setError(err.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) return <Spinner />;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!video) return <div className="text-center py-10">Video not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main video content */}
        <div className="lg:w-2/3">
          <VideoPlayer video={video} />

          <div className="mt-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {video.title}
            </h1>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-3">
              <div className="flex items-center">
                <img
                  src={
                    video.channel.owner?.profile?.picture ||
                    "https://via.placeholder.com/40"
                  }
                  alt={video.channel.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {video.channel.handle}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatViews(video.channel.stats.subscribers)} subscribers
                  </p>
                </div>
                <button className="ml-4 px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors">
                  Subscribe
                </button>
              </div>

              <div className="flex space-x-2">
                <button className="flex items-center px-4 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <FaThumbsUp className="mr-2" />
                  <span>{formatViews(video.metadata.likes)}</span>
                  <span className="mx-2">|</span>
                  <FaThumbsDown />
                </button>
                <button className="flex items-center px-4 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <FaShare className="mr-2" />
                  <span>Share</span>
                </button>
                <button className="flex items-center px-4 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <FaSave className="mr-2" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatViews(video.metadata.views)} views •{" "}
                {formatDate(video.createdAt)}
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {video.description}
            </p>
          </div>

          {/* Comments section would go here */}
        </div>

        {/* Related videos sidebar */}
        <div className="lg:w-1/3">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Related Videos
          </h2>
          <div className="space-y-4">
            {relatedVideos.map((relatedVideo) => (
              <VideoCard key={relatedVideo._id} video={relatedVideo} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
