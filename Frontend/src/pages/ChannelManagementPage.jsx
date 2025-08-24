import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProfilePictureUpload from "../components/common/ProfilePictureUpload";
import { updateChannelAvatar, removeChannelAvatar } from "../api/settings";
import { getChannel } from "../api/channel";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
  FaUsers,
  FaVideo,
  FaChartLine,
  FaCog,
} from "react-icons/fa";

const ChannelManagementPage = () => {
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const [channelData, setChannelData] = useState({
    name: "",
    description: "",
    visibility: "public",
  });

  const tabs = [
    { id: "general", label: "General", icon: FaCog },
    { id: "branding", label: "Branding", icon: FaEdit },
    { id: "analytics", label: "Analytics", icon: FaChartLine },
  ];

  useEffect(() => {
    if (user?.channel) {
      fetchChannelData();
    }
  }, [user]);

  const fetchChannelData = async () => {
    try {
      const response = await getChannel();
      setChannel(response.data);
      setChannelData({
        name: response.data.name || "",
        description: response.data.description || "",
        visibility: response.data.visibility || "public",
      });
    } catch (error) {
      console.error("Failed to fetch channel data:", error);
      setMessage("Failed to load channel data");
    }
  };

  const handleChannelUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Here you would make an API call to update channel info
      // For now, simulate the update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage("Channel updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update channel. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelAvatarUpload = async (file) => {
    setAvatarLoading(true);
    setMessage("");

    try {
      const response = await updateChannelAvatar(file);
      setChannel(response.data);
      setMessage("Channel avatar updated successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update channel avatar. Please try again.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleChannelAvatarRemove = async () => {
    setAvatarLoading(true);
    setMessage("");

    try {
      const response = await removeChannelAvatar();
      setChannel(response.data);
      setMessage("Channel avatar removed successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to remove channel avatar. Please try again.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const TabButton = ({ tab }) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tab.id
          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <tab.icon className="mr-3 h-5 w-5" />
      {tab.label}
    </button>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Channel Information
        </h3>
        <form onSubmit={handleChannelUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Channel Name
            </label>
            <input
              type="text"
              value={channelData.name}
              onChange={(e) =>
                setChannelData({ ...channelData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter channel name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Channel Handle
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400">@</span>
              <input
                type="text"
                value={channel?.handle || ""}
                disabled
                className="ml-1 flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Channel handle cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={channelData.description}
              onChange={(e) =>
                setChannelData({ ...channelData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Describe your channel..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Channel Visibility
            </label>
            <select
              value={channelData.visibility}
              onChange={(e) =>
                setChannelData({ ...channelData, visibility: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaSave className="mr-2" />
            )}
            Save Changes
          </button>
        </form>
      </div>

      {/* Channel Statistics */}
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Channel Statistics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <FaUsers className="text-2xl text-red-500 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {channel?.stats?.subscribers || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Subscribers
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <FaVideo className="text-2xl text-blue-500 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {channel?.stats?.videos || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Videos
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <FaEye className="text-2xl text-green-500 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {channel?.stats?.views || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Views
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Channel Avatar
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <ProfilePictureUpload
            currentImage={channel?.avatar?.url}
            onImageUpload={handleChannelAvatarUpload}
            onImageRemove={handleChannelAvatarRemove}
            isLoading={avatarLoading}
            size="xlarge"
            type="channel"
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Avatar Guidelines
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Use a square image for best results</li>
          <li>• Recommended size: 800x800 pixels</li>
          <li>• Keep it simple and recognizable at small sizes</li>
          <li>• Avoid text that might be hard to read when scaled down</li>
        </ul>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Channel Analytics
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
          <FaChartLine className="text-4xl text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Analytics Coming Soon
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            Detailed analytics and insights for your channel will be available
            here.
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralTab();
      case "branding":
        return renderBrandingTab();
      case "analytics":
        return renderAnalyticsTab();
      default:
        return renderGeneralTab();
    }
  };

  if (!user?.channel) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          No Channel Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You need to create a channel first to access channel management.
        </p>
        <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
          Create Channel
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Channel Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your channel settings and content
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
            }`}
          >
            <div className="flex items-center">
              {message.includes("successfully") ? (
                <FaSave className="mr-2" />
              ) : (
                <FaTimes className="mr-2" />
              )}
              {message}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <TabButton key={tab.id} tab={tab} />
              ))}
            </div>
          </div>

          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ChannelManagementPage;
