import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaCalendar, FaEdit } from "react-icons/fa";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Sign in to view profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You need to be signed in to view your profile.
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4">
                <img
                  src={
                    user.profile?.picture ||
                    `https://ui-avatars.com/api/?name=${user.displayName}&background=random`
                  }
                  alt={user.displayName || user.fullName || user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.displayName || user.fullName || user.username}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                @{user.username}
              </p>
              {user.channel && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Channel Owner
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <FaCalendar className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Joined{" "}
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <FaUser className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.authMethod || "Email"} Account
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaEdit />
              <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Account Information
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={
                    user.displayName || user.fullName || user.username || ""
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user.username || ""}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {isEditing && (
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Channel Information */}
          {user.channel && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Channel Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Channel Name
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.channel.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Channel Handle
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    @{user.channel.handle}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate(`/c/${user.channel.handle}`)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    View Channel
                  </button>
                  <button
                    onClick={() => navigate("/studio")}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Manage Channel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Account Actions
            </h3>

            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="font-medium text-gray-900 dark:text-white">
                  Change Password
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Update your account password
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="font-medium text-gray-900 dark:text-white">
                  Privacy Settings
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your privacy preferences
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <div className="font-medium text-red-700 dark:text-red-400">
                  Delete Account
                </div>
                <div className="text-sm text-red-500 dark:text-red-400">
                  Permanently delete your account and all data
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
