import { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown, FaShare, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { toggleVideoLike, getUserVote, getLikeCounts } from "../../api/likes";
import { formatLikes } from "../../utils/format";
import WatchLaterButton from "../common/WatchLaterButton";

const VideoActions = ({ video, onVideoUpdate }) => {
  const { user } = useAuth();
  const [likeData, setLikeData] = useState({
    likes: video?.metadata?.likes || 0,
    dislikes: video?.metadata?.dislikes || 0,
    userVote: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (video && user) {
      loadLikeData();
    }
  }, [video?._id, user]);

  const loadLikeData = async () => {
    try {
      const likeCounts = await getLikeCounts("Video", video._id);

      const userVote = await getUserVote("Video", video._id);

      setLikeData({
        likes: likeCounts.data.likes,
        dislikes: likeCounts.data.dislikes,
        userVote: userVote.data,
      });
    } catch (error) {
      console.error("Error loading like data:", error);
    }
  };

  const handleLike = async (value) => {
    if (!user) {
      // Could show login modal here
      return;
    }

    try {
      setLoading(true);

      // Update local state optimistically
      setLikeData((prevData) => {
        const isCurrentlyLiked = prevData.userVote === value;
        const newUserVote = isCurrentlyLiked ? 0 : value;

        let newLikes = prevData.likes;
        let newDislikes = prevData.dislikes;

        if (value === 1) {
          // Like button clicked
          newLikes += isCurrentlyLiked ? -1 : 1;
          if (prevData.userVote === -1) {
            newDislikes -= 1;
          }
        } else {
          // Dislike button clicked
          newDislikes += isCurrentlyLiked ? -1 : 1;
          if (prevData.userVote === 1) {
            newLikes -= 1;
          }
        }

        return {
          likes: Math.max(0, newLikes),
          dislikes: Math.max(0, newDislikes),
          userVote: newUserVote,
        };
      });

      // Notify parent component of the update
      if (onVideoUpdate) {
        onVideoUpdate({
          ...video,
          metadata: {
            ...video.metadata,
            likes: likeData.likes,
            dislikes: likeData.dislikes,
          },
        });
      }

      await toggleVideoLike(video._id, value);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      loadLikeData();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // Could show a toast notification here
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (!video) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Like/Dislike Button */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <button
          onClick={() => handleLike(1)}
          disabled={loading}
          className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
            likeData.userVote === 1
              ? "text-green-600 bg-red-50 dark:bg-red-900/20"
              : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {loading && likeData.userVote !== 1 ? (
            <FaSpinner className="animate-spin mr-2" size={16} />
          ) : (
            <FaThumbsUp className="mr-2" size={16} />
          )}
          <span>{formatLikes(likeData.likes)}</span>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        <button
          onClick={() => handleLike(-1)}
          disabled={loading}
          className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
            likeData.userVote === -1
              ? "text-red-600 bg-red-50 dark:bg-red-900/20"
              : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {loading && likeData.userVote !== -1 ? (
            <FaSpinner className="animate-spin mr-2" size={16} />
          ) : (
            <FaThumbsDown className="mr-2" size={16} />
          )}
          <span>{formatLikes(likeData.dislikes)}</span>
        </button>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <FaShare className="mr-2" size={14} />
        <span>Share</span>
      </button>

      {/* Watch Later Button */}
      <WatchLaterButton
        videoId={video._id}
        variant="outline"
        size="sm"
        className="rounded-full"
      />
    </div>
  );
};

export default VideoActions;
