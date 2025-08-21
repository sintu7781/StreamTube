// src/pages/ChannelPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChannelByHandle } from "../api/channel";
import { getChannelVideos } from "../api/videos";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/video/VideoCard";
import Spinner from "../components/common/Spinner";
import { FaLock, FaEyeSlash } from "react-icons/fa";

const ChannelPage = () => {
  const { handle } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [publicVideos, setPublicVideos] = useState([]);
  const [privateVideos, setPrivateVideos] = useState([]);
  const [unlistedVideos, setUnlistedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChannelOwner, setIsChannelOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("public");

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        const channelData = await getChannelByHandle(handle);
        const channel = channelData.data;
        setChannel(channel);

        // Check if current user is the channel owner
        const isOwner =
          user && user.channel && user.channel._id === channel._id;
        setIsChannelOwner(isOwner);

        // Fetch public videos for everyone
        const publicVideosData = await getChannelVideos(
          handle,
          1,
          50,
          "public"
        );
        setPublicVideos(publicVideosData.data.videos || []);

        // If user is channel owner, also fetch private and unlisted videos
        if (isOwner) {
          const [privateVideosData, unlistedVideosData] = await Promise.all([
            getChannelVideos(handle, 1, 50, "private"),
            getChannelVideos(handle, 1, 50, "unlisted"),
          ]);
          setPrivateVideos(privateVideosData.data.videos || []);
          setUnlistedVideos(unlistedVideosData.data.videos || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    if (handle) {
      fetchChannelData();
    }
  }, [handle, user]);

  const renderVideoContent = () => {
    let currentVideos = [];
    let sectionTitle = "Videos";

    if (isChannelOwner) {
      switch (activeTab) {
        case "private":
          currentVideos = privateVideos;
          sectionTitle = "Private Videos";
          break;
        case "unlisted":
          currentVideos = unlistedVideos;
          sectionTitle = "Unlisted Videos";
          break;
        default:
          currentVideos = publicVideos;
          sectionTitle = "Public Videos";
      }
    } else {
      currentVideos = publicVideos;
      sectionTitle = "Videos";
    }

    if (currentVideos.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentVideos.map((video) => (
            <div key={video._id} className="relative">
              <VideoCard video={video} />
              {/* Visibility Badge */}
              {isChannelOwner && (
                <div className="absolute top-2 left-2">
                  {video.visibility === "private" && (
                    <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <FaLock className="text-xs" />
                      <span>Private</span>
                    </div>
                  )}
                  {video.visibility === "unlisted" && (
                    <div className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <FaEyeSlash className="text-xs" />
                      <span>Unlisted</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } else {
      const getEmptyMessage = () => {
        if (isChannelOwner && activeTab === "private") {
          return "No private videos yet. Upload a video and set its visibility to private.";
        } else if (isChannelOwner && activeTab === "unlisted") {
          return "No unlisted videos yet. Upload a video and set its visibility to unlisted.";
        } else {
          return "This channel hasn't uploaded any public videos yet.";
        }
      };

      return (
        <div className="text-center py-20">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {activeTab} videos yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {getEmptyMessage()}
          </p>
        </div>
      );
    }
  };

  if (loading) return <Spinner />;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!channel)
    return <div className="text-center py-10">Channel not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Channel Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={
                channel.owner?.profile?.picture ||
                `https://ui-avatars.com/api/?name=${handle}&background=random`
              }
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
        {/* Tab Navigation - Only show for channel owner */}
        {isChannelOwner && (
          <div className="flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("public")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === "public"
                  ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Public ({publicVideos.length})
            </button>
            <button
              onClick={() => setActiveTab("private")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center space-x-1 ${
                activeTab === "private"
                  ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FaLock className="text-xs" />
              <span>Private ({privateVideos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("unlisted")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center space-x-1 ${
                activeTab === "unlisted"
                  ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FaEyeSlash className="text-xs" />
              <span>Unlisted ({unlistedVideos.length})</span>
            </button>
          </div>
        )}

        {/* Video Content */}
        {renderVideoContent()}
      </div>
    </div>
  );
};

export default ChannelPage;
