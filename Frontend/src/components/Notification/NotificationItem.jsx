import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaBell,
  FaAt,
  FaTrophy,
  FaTimes,
} from "react-icons/fa";

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true,
  onClick,
}) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "VIDEO_UPLOAD":
        return <FaPlay className="text-blue-500" />;
      case "VIDEO_LIKE":
        return <FaHeart className="text-red-500" />;
      case "VIDEO_COMMENT":
        return <FaComment className="text-green-500" />;
      case "COMMENT_REPLY":
        return <FaComment className="text-green-500" />;
      case "COMMENT_LIKE":
        return <FaHeart className="text-red-500" />;
      case "COMMENT_MENTION":
        return <FaAt className="text-purple-500" />;
      case "CHANNEL_SUBSCRIPTION":
        return <FaUserPlus className="text-orange-500" />;
      case "CHANNEL_MILESTONE":
        return <FaTrophy className="text-yellow-500" />;
      case "SYSTEM_ANNOUNCEMENT":
        return <FaBell className="text-gray-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationUrl = (notification) => {
    const { type, actionUrl, data } = notification;

    if (actionUrl) {
      return actionUrl;
    }

    // Fallback URL generation
    switch (type) {
      case "VIDEO_UPLOAD":
      case "VIDEO_LIKE":
      case "VIDEO_COMMENT":
        return data?.video ? `/watch/${data.video}` : "/";
      case "COMMENT_REPLY":
      case "COMMENT_LIKE":
      case "COMMENT_MENTION":
        return data?.video && data?.comment
          ? `/watch/${data.video}?comment=${data.comment}`
          : "/";
      case "CHANNEL_SUBSCRIPTION":
      case "CHANNEL_MILESTONE":
        return data?.channel ? `/channel/${data.channel}` : "/";
      default:
        return "/";
    }
  };

  const handleNotificationClick = async () => {
    try {
      // Mark as read if not already read
      if (!notification.isRead && onMarkAsRead) {
        await onMarkAsRead([notification.id]);
      }

      // Navigate to the appropriate URL
      const url = getNotificationUrl(notification);
      if (onClick) {
        onClick(notification, url);
      } else {
        navigate(url);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(notification.id);
    }
  };

  const getSenderAvatar = () => {
    return notification.sender?.avatar || "/default-avatar.png";
  };

  const getSenderName = () => {
    return (
      notification.sender?.profile?.name ||
      notification.sender?.username ||
      "Unknown User"
    );
  };

  return (
    <div
      className={`
        p-4 border-b border-gray-200 dark:border-gray-700 
        hover:bg-gray-50 dark:hover:bg-gray-800 
        cursor-pointer transition-colors duration-200
        ${
          !notification.isRead
            ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
            : ""
        }
      `}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start space-x-3">
        {/* Notification Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Sender Avatar & Name */}
              {notification.sender && (
                <div className="flex items-center space-x-2 mb-1">
                  <img
                    src={getSenderAvatar()}
                    alt={getSenderName()}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getSenderName()}
                  </span>
                </div>
              )}

              {/* Title */}
              <h4
                className={`
                text-sm font-medium 
                ${
                  !notification.isRead
                    ? "text-gray-900 dark:text-white font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                }
              `}
              >
                {notification.title}
              </h4>

              {/* Message */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {notification.message}
              </p>

              {/* Timestamp */}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-2 ml-4">
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  title="Delete notification"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Data Display */}
      {notification.data?.customData && (
        <div className="mt-3 pl-11">
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1 inline-block">
            {JSON.stringify(notification.data.customData)}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
