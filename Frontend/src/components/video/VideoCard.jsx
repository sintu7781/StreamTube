import { Link } from "react-router-dom";
import { formatViews } from "../../utils/format";

const VideoCard = ({ video }) => {
  // console.log(video);
  if (!video) return null;

  return (
    <div className="w-full mb-6">
      <Link to={`/watch/${video._id}`}>
        <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
          <img
            src={video.thumbnail?.url || "https://via.placeholder.com/320x180"}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
            {video.media?.duration
              ? formatDuration(video.media.duration)
              : "0:00"}
          </span>
        </div>
      </Link>

      <div className="flex mt-2">
        <Link to={`/c/${video.channel?.handle}`} className="flex-shrink-0 mr-3">
          <img
            src={
              video.channel?.owner?.profile?.picture ||
              "https://via.placeholder.com/40"
            }
            alt={video.channel?.name}
            className="w-9 h-9 rounded-full"
          />
        </Link>

        <div className="flex-1">
          <Link to={`/watch/${video._id}`}>
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
              {video.title}
            </h3>
          </Link>
          <Link
            to={`/c/${video.channel?.handle}`}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {video.channel?.name}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatViews(video.metadata?.views || 0)} views •{" "}
            {formatDate(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to format duration
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default VideoCard;
