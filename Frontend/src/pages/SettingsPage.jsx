import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useDarkMode from "../hooks/useDarkMode";
import {
  FaUser,
  FaLock,
  FaBell,
  FaEye,
  FaShieldAlt,
  FaPalette,
  FaCog,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user?.privacy?.profileVisibility || "public",
    showEmail: user?.privacy?.showEmail || false,
    allowComments: user?.privacy?.allowComments || true,
    allowMessages: user?.privacy?.allowMessages || true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    commentNotifications: true,
    likeNotifications: true,
    subscriptionNotifications: true,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "privacy", label: "Privacy", icon: FaShieldAlt },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "appearance", label: "Appearance", icon: FaPalette },
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Here you would typically make an API call to update the user profile
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(profileData);
      setMessage("Profile updated successfully!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // Here you would typically make an API call to update privacy settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser({ privacy: privacySettings });
      setMessage("Privacy settings updated successfully!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update privacy settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // Here you would typically make an API call to update notification settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage("Notification settings updated successfully!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update notification settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton = ({ tab }) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tab.id
          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <tab.icon className="mr-3 h-5 w-5" />
      {tab.label}
    </button>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Information
        </h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) =>
                  setProfileData({ ...profileData, displayName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) =>
                  setProfileData({ ...profileData, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({ ...profileData, bio: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Tell us about yourself..."
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Privacy Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  profileVisibility: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Email Address
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow others to see your email address
                </p>
              </div>
              <button
                onClick={() =>
                  setPrivacySettings({
                    ...privacySettings,
                    showEmail: !privacySettings.showEmail,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.showEmail
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.showEmail ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Comments
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow others to comment on your videos
                </p>
              </div>
              <button
                onClick={() =>
                  setPrivacySettings({
                    ...privacySettings,
                    allowComments: !privacySettings.allowComments,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.allowComments
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.allowComments ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Messages
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow others to send you private messages
                </p>
              </div>
              <button
                onClick={() =>
                  setPrivacySettings({
                    ...privacySettings,
                    allowMessages: !privacySettings.allowMessages,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.allowMessages
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.allowMessages ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handlePrivacyUpdate}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaSave className="mr-2" />
            )}
            Save Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="space-y-3">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive notifications for {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotificationSettings({
                      ...notificationSettings,
                      [key]: !value,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleNotificationUpdate}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaSave className="mr-2" />
            )}
            Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Appearance Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dark Mode
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme Preview
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Current theme: {darkMode ? "Dark" : "Light"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "privacy":
        return renderPrivacyTab();
      case "notifications":
        return renderNotificationsTab();
      case "appearance":
        return renderAppearanceTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes("successfully") 
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          }`}>
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

export default SettingsPage;
