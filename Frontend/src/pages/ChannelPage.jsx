// src/pages/ChannelPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChannelByHandle, getChannelVideos } from "../api/channel";
import VideoCard from "../components/video/VideoCard";
import Spinner from "../components/common/Spinner";

const ChannelPage = () => {
  const { handle } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        const [channelData, videosData] = await Promise.all([
          getChannelByHandle(handle),
          getChannelVideos(handle),
        ]);

        setChannel(channelData.data);
        setVideos(videosData.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    if (handle) {
      fetchChannelData();
    }
  }, [handle]);

  if (loading) return <Spinner />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!channel) return <div className="text-center py-10">Channel not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Channel Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={channel.owner?.profile?.picture || "https://via.placeholder.com/96"}
              alt={channel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {channel.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              @{channel.handle}
            </p>
            {channel.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {channel.description}
              </p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>{channel.stats?.subscribers || 0} subscribers</span>
              <span>{channel.stats?.videos || 0} videos</span>
              <span>{channel.stats?.views || 0} views</span>
            </div>
          </div>
          <button className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Videos
        </h2>
        
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No videos yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              This channel hasn't uploaded any videos yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
