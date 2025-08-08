import { api } from "./endpoints";

// Get user's liked videos
export const getLikedVideos = async (params = {}) => {
  try {
    const response = await api.get("/likes/videos", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user's liked comments
export const getLikedComments = async (params = {}) => {
  try {
    const response = await api.get("/likes/comments", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Like a video
export const likeVideo = async (videoId) => {
  try {
    const response = await api.post("/likes/videos", { videoId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Unlike a video
export const unlikeVideo = async (videoId) => {
  try {
    const response = await api.delete(`/likes/videos/${videoId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Like a comment
export const likeComment = async (commentId) => {
  try {
    const response = await api.post("/likes/comments", { commentId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Unlike a comment
export const unlikeComment = async (commentId) => {
  try {
    const response = await api.delete(`/likes/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if video is liked
export const checkVideoLiked = async (videoId) => {
  try {
    const response = await api.get(`/likes/videos/${videoId}/check`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if comment is liked
export const checkCommentLiked = async (commentId) => {
  try {
    const response = await api.get(`/likes/comments/${commentId}/check`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get liked videos count
export const getLikedVideosCount = async () => {
  try {
    const response = await api.get("/likes/videos/count");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get liked comments count
export const getLikedCommentsCount = async () => {
  try {
    const response = await api.get("/likes/comments/count");
    return response.data;
  } catch (error) {
    throw error;
  }
};
