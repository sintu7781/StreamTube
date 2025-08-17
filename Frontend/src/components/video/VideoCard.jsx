import { Link } from "react-router-dom";
import { formatViews, formatDuration, formatTimeAgo } from "../../utils/format";
import { FaPlay } from "react-icons/fa";

const VideoCard = ({ video, layout = "vertical" }) => {
  if (!video) return null;

  // Horizontal layout for sidebar
  if (layout === "horizontal") {
    return (
      <div className="group cursor-pointer flex space-x-3">
        {/* Video Thumbnail */}
        <Link to={`/watch/${video._id}`} className="flex-shrink-0">
          <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={video.thumbnail?.url}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Duration Badge */}
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
              {video.media?.duration
                ? formatDuration(video.media.duration)
                : "0:00"}
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                <FaPlay className="text-gray-800 ml-0.5 text-xs" />
              </div>
            </div>
          </div>
        </Link>

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video._id}`}>
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {video.title}
            </h3>
          </Link>

          <Link
            to={`/c/${video.channel?.handle}`}
            className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block mb-1"
          >
            {video.channel?.name}
          </Link>

          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatViews(video.metadata?.uniqueViews || 0)}</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default vertical layout
  return (
    <div className="group cursor-pointer">
      {/* Video Thumbnail */}
      <Link to={`/watch/${video._id}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3">
          <img
            src={video.thumbnail?.url}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium">
            {video.media?.duration
              ? formatDuration(video.media.duration)
              : "0:00"}
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <FaPlay className="text-gray-800 ml-1" />
            </div>
          </div>
        </div>
      </Link>

      {/* Video Info */}
      <div className="flex space-x-3">
        {/* Channel Avatar */}
        <Link to={`/c/${video.channel?.handle}`} className="flex-shrink-0">
          <img
            src={
              video.channel?.owner?.profile?.picture ||
              `https://ui-avatars.com/api/?name=${video.channel?.name}&background=random`
            }
            alt={video.channel?.name}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"
          />
        </Link>

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video._id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {video.title}
            </h3>
          </Link>

          <Link
            to={`/c/${video.channel?.handle}`}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
          >
            {video.channel?.name}
          </Link>

          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatViews(video.metadata?.uniqueViews || 0)}</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
