import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaHistory,
  FaUser,
  FaCog,
  FaHeart,
  FaVideo,
  FaUsers,
  FaBookmark,
  FaFlag,
  FaQuestionCircle,
  FaInfoCircle,
  FaShieldAlt,
  FaGavel,
  FaCopyright,
  FaComment,
  FaChartLine,
  FaGamepad,
  FaMusic,
  FaFilm,
  FaNewspaper,
  FaGraduationCap,
  FaLightbulb,
  FaDumbbell,
  FaBell,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, isCollapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [showFooter, setShowFooter] = useState(false);

  const mainNavItems = [
    { icon: FaHome, label: "Home", path: "/" },
    { icon: FaBell, label: "Notifications", path: "/notifications" },
    { icon: FaBell, label: "Subscriptions", path: "/subscriptions" },
    { icon: FaHistory, label: "History", path: "/history" },
    { icon: FaHeart, label: "Liked Videos", path: "/liked" },
    { icon: FaComment, label: "Liked Comments", path: "/liked-comments" },
    { icon: FaBookmark, label: "Watch Later", path: "/watch-later" },
  ];

  const categories = [
    { name: "All", icon: null, path: "/category?category=all" },
    { name: "Music", icon: FaMusic, path: "/category?category=music" },
    { name: "Gaming", icon: FaGamepad, path: "/category?category=gaming" },
    { name: "Movies", icon: FaFilm, path: "/category?category=movies" },
    { name: "News", icon: FaNewspaper, path: "/category?category=news" },
    {
      name: "Education",
      icon: FaGraduationCap,
      path: "/category?category=education",
    },
    {
      name: "Technology",
      icon: FaLightbulb,
      path: "/category?category=technology",
    },
    { name: "Sports", icon: FaDumbbell, path: "/category?category=sports" },
    {
      name: "Entertainment",
      icon: FaUsers,
      path: "/category?category=entertainment",
    },
  ];

  const userItems = [
    {
      icon: FaUser,
      label: "Your Channel",
      path: user?.channel ? `/c/${user.channel.handle}` : "/create-channel",
    },
    { icon: FaVideo, label: "Studio", path: "/studio" },
    { icon: FaCog, label: "Settings", path: "/settings" },
    { icon: FaChartLine, label: "Analytics", path: "/analytics" },
  ];

  const footerItems = [
    { icon: FaInfoCircle, label: "About", path: "/about" },
    { icon: FaFlag, label: "Report", path: "/report" },
    { icon: FaQuestionCircle, label: "Help", path: "/help" },
    { icon: FaShieldAlt, label: "Privacy", path: "/privacy" },
    { icon: FaGavel, label: "Terms", path: "/terms" },
    { icon: FaCopyright, label: "Copyright", path: "/copyright" },
  ];

  // FIXED isActive function
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  const CollapsedNavItem = ({ item }) => (
    <Link
      to={item.path}
      className={`flex items-center justify-center px-2 py-3 text-sm font-medium rounded-lg transition-colors group relative ${
        isActive(item.path)
          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
      title={item.label}
    >
      <item.icon className="h-5 w-5" />
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {item.label}
      </div>
    </Link>
  );

  const NavItem = ({ item }) => (
    <Link
      to={item.path}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive(item.path)
          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <item.icon className="mr-3 h-5 w-5" />
      {item.label}
    </Link>
  );

  if (isCollapsed) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
        )}
        <div
          className={`fixed left-0 top-16 full-height w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 sidebar-transition ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static lg:z-auto`}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div
              className="flex-1 overflow-y-auto scrollbar-hide py-4"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="space-y-2 px-2">
                {mainNavItems.map((item) => (
                  <CollapsedNavItem key={item.label} item={item} />
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4 mx-2" />
              {user && (
                <div className="px-2 space-y-2">
                  {userItems.slice(0, 2).map((item) => (
                    <CollapsedNavItem key={item.label} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}
      <div
        className={`fixed left-0 top-16 full-height w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 sidebar-transition ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex-1 overflow-y-auto scrollbar-hide"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-6">
              <div className="space-y-2 mb-8">
                {mainNavItems.map((item) => (
                  <NavItem key={item.label} item={item} />
                ))}
              </div>

              <div className="mb-8">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Explore
                </h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    const isActiveCategory =
                      (location.pathname === "/category" &&
                        location.search.includes(
                          `category=${category.name.toLowerCase()}`
                        )) ||
                      (category.name === "All" &&
                        location.pathname === "/category" &&
                        location.search.includes("category=all"));
                    return (
                      <Link
                        key={category.name}
                        to={category.path}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActiveCategory
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {IconComponent && (
                          <IconComponent className="mr-3 h-4 w-4" />
                        )}
                        <span className="text-sm">{category.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {user && (
                <div className="mb-8">
                  <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    You
                  </h3>
                  <div className="space-y-2">
                    {userItems.map((item) => (
                      <NavItem key={item.label} item={item} />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setShowFooter(!showFooter)}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span>More from StreamTube</span>
                  <svg
                    className={`h-4 w-4 transform transition-transform ${
                      showFooter ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showFooter && (
                  <div className="mt-2 space-y-2">
                    {footerItems.map((item) => (
                      <NavItem key={item.label} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p className="mb-2">© 2024 StreamTube</p>
              <p>Made with ❤️ for creators</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
