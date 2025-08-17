import VideoCard from "./VideoCard";
import Spinner from "../common/Spinner";

const RelatedVideos = ({ videos, loading, className = "" }) => {
  if (loading) {
    return (
      <div className={`${className}`}>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Related Videos
        </h2>
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={`${className}`}>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Related Videos
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No related videos found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Related Videos
      </h2>
      <div className="space-y-4">
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            layout="horizontal" // For sidebar layout
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedVideos;
