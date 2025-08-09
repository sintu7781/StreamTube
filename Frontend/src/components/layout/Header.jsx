import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaVideo,
  FaBell,
  FaBars,
  FaCog,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import useDarkMode from "../../hooks/useDarkMode";
import { useLocation } from "react-router-dom";
import NotificationDropdown from "../Notification/NotificationDropdown";

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Channel data is now handled centrally in AuthContext
  // No need for duplicate channel fetching here

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileMenuOpen(false);
  };

  const getUserDisplayName = () => {
    return (
      user.displayName ||
      user.fullName ||
      user.username ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  const getUserAvatar = () => {
    // Try multiple paths for avatar URL
    const avatarUrl = 
      user.profile?.picture || 
      user.avatar || 
      user.profilePicture || 
      user.profile?.avatar;
    
    // If no avatar URL found, generate a default one based on user name
    if (!avatarUrl) {
      const name = getUserDisplayName();
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
    }
    
    return avatarUrl;
  };

  const hasChannel = user?.channel && user.channel._id;

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            {/* Hamburger menu button - shows on all pages */}
            <button
              className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={onMenuClick}
              title="Toggle Sidebar"
            >
              <FaBars className="text-gray-600 dark:text-gray-300" />
            </button>

            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-2">
                <FaVideo className="text-white" />
              </div>
              <span className="text-xl font-bold dark:text-white">
                StreamTube
              </span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
              >
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:block"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {user ? (
              <>
                {/* Upload button - only show for users with channels */}
                {hasChannel && (
                  <Link
                    to="/upload"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Upload Video"
                  >
                    <FaVideo className="text-gray-600 dark:text-gray-300" />
                  </Link>
                )}

                {/* Notification Dropdown */}
                <NotificationDropdown />

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    className="flex items-center"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <img
                      src={getUserAvatar()}
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const name = getUserDisplayName();
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
                      }}
                    />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 z-20">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        {hasChannel && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Channel Owner
                          </p>
                        )}
                      </div>

                      {/* Channel Section */}
                      {hasChannel ? (
                        <>
                          <Link
                            to={`/c/${user.channel.handle}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <FaVideo className="mr-3 text-red-600" />
                            Your Channel
                          </Link>
                          <Link
                            to="/studio"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <svg className="mr-3 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Studio
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/create-channel"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <FaVideo className="mr-3 text-red-600" />
                          Create Channel
                        </Link>
                      )}

                      {/* User Settings Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <FaUser className="mr-3 text-gray-500" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <FaCog className="mr-3 text-gray-500" />
                          Settings
                        </Link>
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <svg
                            className="mr-3 h-4 w-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
            >
              <FaSearch />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/trending"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trending
            </Link>
            <Link
              to="/subscriptions"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Subscriptions
            </Link>
            <Link
              to="/library"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Library
            </Link>
          </div>
        </div>
      )}

      {/* Click outside to close profile menu */}
      {profileMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setProfileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
