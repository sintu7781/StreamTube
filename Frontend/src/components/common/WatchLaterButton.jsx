import React, { useState, useEffect } from 'react';
import { FaClock, FaCheck } from 'react-icons/fa';
import { toggleWatchLater, checkWatchLaterStatus } from '../../api/watchLater';
import { useAuth } from '../../context/AuthContext';

const WatchLaterButton = ({ 
  videoId, 
  className = "",
  size = "md",
  showLabel = true,
  variant = "outline" // outline, filled, minimal
}) => {
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && videoId) {
      checkStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [videoId, currentUser]);

  const checkStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await checkWatchLaterStatus(videoId);
      setIsInWatchLater(response.data.isInWatchLater);
    } catch (err) {
      console.error('Failed to check watch later status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      // Could trigger login modal here
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const response = await toggleWatchLater(videoId);
      setIsInWatchLater(response.data.isInWatchLater);
    } catch (err) {
      console.error('Failed to toggle watch later:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  // Size configurations
  const sizeClasses = {
    sm: {
      button: "px-2 py-1 text-xs",
      icon: "text-xs",
      spinner: "w-3 h-3 border"
    },
    md: {
      button: "px-3 py-2 text-sm",
      icon: "text-sm",
      spinner: "w-4 h-4 border-2"
    },
    lg: {
      button: "px-4 py-2 text-base",
      icon: "text-base",
      spinner: "w-5 h-5 border-2"
    }
  };

  // Variant configurations
  const variantClasses = {
    outline: isInWatchLater
      ? "border-2 border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
      : "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
    filled: isInWatchLater
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-600 text-white hover:bg-gray-700",
    minimal: isInWatchLater
      ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
      : "text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  if (checkingStatus) {
    return (
      <div className={`inline-flex items-center justify-center rounded-lg opacity-50 ${currentSize.button} ${currentVariant} ${className}`}>
        <div className={`${currentSize.spinner} border-gray-300 border-t-transparent rounded-full animate-spin`} />
        {showLabel && <span className="ml-2">Loading...</span>}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        inline-flex items-center justify-center rounded-lg transition-all duration-200
        ${currentSize.button} ${currentVariant} ${className}
        ${loading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `}
      title={isInWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
    >
      {loading ? (
        <div className={`${currentSize.spinner} border-current border-t-transparent rounded-full animate-spin`} />
      ) : (
        <>
          {isInWatchLater ? (
            <FaCheck className={`${currentSize.icon} ${showLabel ? 'mr-2' : ''}`} />
          ) : (
            <FaClock className={`${currentSize.icon} ${showLabel ? 'mr-2' : ''}`} />
          )}
        </>
      )}
      
      {showLabel && !loading && (
        <span className="whitespace-nowrap">
          {isInWatchLater ? "Added" : "Watch Later"}
        </span>
      )}
    </button>
  );
};

export default WatchLaterButton;
