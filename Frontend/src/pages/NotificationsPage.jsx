import { useState } from "react";
import {
  FaBell,
  FaCheck,
  FaFilter,
  FaSpinner,
  FaTrash,
  FaCheckDouble,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { useNotifications } from "../context/NotificationContext";
import NotificationItem from "../components/Notification/NotificationItem";
import LoadingSpinner from "../components/common/Spinner";

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState("all"); // all, unread, read
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load more notifications
  const loadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      await fetchNotifications(page + 1);
      setPage(page + 1);
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by read status
    if (filter === "unread" && notification.isRead) return false;
    if (filter === "read" && !notification.isRead) return false;

    // Filter by type
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.sender?.username?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Get notification types for filter
  const notificationTypes = [...new Set(notifications.map((n) => n.type))];

  // Handle bulk actions
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleBulkMarkAsRead = async () => {
    try {
      await markAsRead(selectedNotifications);
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) => deleteNotification(id))
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const getNotificationTypeLabel = (type) => {
    const labels = {
      VIDEO_UPLOAD: "Video Uploads",
      VIDEO_LIKE: "Video Likes",
      VIDEO_COMMENT: "Video Comments",
      COMMENT_REPLY: "Comment Replies",
      COMMENT_LIKE: "Comment Likes",
      COMMENT_MENTION: "Mentions",
      CHANNEL_SUBSCRIPTION: "Subscriptions",
      CHANNEL_MILESTONE: "Milestones",
      SYSTEM_ANNOUNCEMENT: "Announcements",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FaBell className="text-2xl text-gray-600 dark:text-gray-300" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaCheckDouble size={14} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Types</option>
              {notificationTypes.map((type) => (
                <option key={type} value={type}>
                  {getNotificationTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-4 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedNotifications.length} selected
              </span>
              <button
                onClick={handleBulkMarkAsRead}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <FaCheck size={12} />
                <span>Mark Read</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                <FaTrash size={12} />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedNotifications([])}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {/* Select All Header */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedNotifications.length ===
                    filteredNotifications.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Select all ({filteredNotifications.length})
                </span>
              </label>
            </div>
          )}

          {/* Loading State */}
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <FaBell className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery || filter !== "all"
                  ? "No matching notifications"
                  : "No notifications yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "You'll see notifications here when you get them"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center">
                  <div className="flex-shrink-0 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      showActions={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {notifications.length > 0 && filteredNotifications.length >= 20 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
