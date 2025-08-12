// src/components/video/VideoPlayer.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
} from "react-icons/fa";
import { incrementViews } from '../../api/videos';

const VideoPlayer = ({ video }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewReported, setViewReported] = useState(false);
  const [lastReportedProgress, setLastReportedProgress] = useState(0);
  const videoRef = useRef(null);
  const startTimeRef = useRef(null);
  const totalWatchTimeRef = useRef(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", updateProgress);
      videoRef.current.addEventListener("loadedmetadata", () => {
        setDuration(videoRef.current.duration);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", updateProgress);
      }
    };
  }, []);

  const updateProgress = () => {
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    const progressPercentage = (current / total) * 100;
    
    setCurrentTime(current);
    setProgress(progressPercentage);
    
    // Track view progress - report when user watches significant portions
    if (!viewReported && progressPercentage >= 10) {
      // Report initial view after 10% watched
      reportViewProgress(current, progressPercentage);
      setViewReported(true);
    } else if (progressPercentage - lastReportedProgress >= 25) {
      // Report progress every 25% watched
      reportViewProgress(current, progressPercentage);
      setLastReportedProgress(Math.floor(progressPercentage / 25) * 25);
    }
  };

  // Report view progress to backend
  const reportViewProgress = async (watchedDuration, watchedPercentage) => {
    try {
      await incrementViews(video._id, {
        duration: Math.floor(watchedDuration),
        watchedPercentage: Math.floor(watchedPercentage)
      });
    } catch (error) {
      console.error('Error reporting view progress:', error);
    }
  };

  const togglePlay = () => {
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    videoRef.current.volume = vol;
    if (vol === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    videoRef.current.muted = !muted;
  };

  const handleProgressClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  return (
    <div className="w-full relative group">
      <video
        ref={videoRef}
        src={video.media?.original?.url || video.media?.encoded?.[0]?.url}
        className="w-full rounded-lg"
        poster={video.thumbnail?.url}
        onClick={togglePlay}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <div
          className="w-full h-1 bg-gray-600 mb-3 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-red-600"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={togglePlay} className="text-white">
              {playing ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>

            <div className="flex items-center space-x-2">
              <button onClick={toggleMute} className="text-white">
                {muted || volume === 0 ? (
                  <FaVolumeMute size={18} />
                ) : (
                  <FaVolumeUp size={18} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 accent-red-600"
              />
            </div>

            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <button onClick={toggleFullscreen} className="text-white">
            <FaExpand size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
