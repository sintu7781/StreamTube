import axiosInstance from "../lib/axios";
import { LIKE_ENDPOINTS } from "./endpoints";

// Get user's liked videos
export const getLikedVideos = async (params = {}) => {
  try {
    const response = await axiosInstance.get(LIKE_ENDPOINTS.GET_LIKED_VIDEOS, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user's liked comments
export const getLikedComments = async (params = {}) => {
  try {
    const response = await axiosInstance.get(LIKE_ENDPOINTS.GET_LIKED_COMMENTS, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Toggle like on video
export const toggleVideoLike = async (videoId, value = 1) => {
  try {
    const response = await axiosInstance.post(LIKE_ENDPOINTS.TOGGLE_LIKE, {
      targetType: "Video",
      targetId: videoId,
      value
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Toggle like on comment
export const toggleCommentLike = async (commentId, value = 1) => {
  try {
    const response = await axiosInstance.post(LIKE_ENDPOINTS.TOGGLE_LIKE, {
      targetType: "Comment",
      targetId: commentId,
      value
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get like counts for a target
export const getLikeCounts = async (targetType, targetId) => {
  try {
    const response = await axiosInstance.get(LIKE_ENDPOINTS.GET_LIKES, {
      params: { targetType, targetId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check user's vote on a target
export const getUserVote = async (targetType, targetId) => {
  try {
    const response = await axiosInstance.post("/v1/likes/all-likes", {
      targetType,
      targetId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
