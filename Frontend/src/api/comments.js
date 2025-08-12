import axiosInstance from "../lib/axios";

export const createComment = async (videoId, content, parentCommentId = null) => {
  try {
    const response = await axiosInstance.post(`/v1/videos/${videoId}/comments`, {
      content,
      parentCommentId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVideoComments = async (videoId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/v1/videos/${videoId}/comments`, {
      params
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateComment = async (commentId, content) => {
  try {
    const response = await axiosInstance.put(`/v1/comments/${commentId}`, {
      content
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await axiosInstance.delete(`/v1/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const togglePinComment = async (commentId) => {
  try {
    const response = await axiosInstance.patch(`/v1/comments/${commentId}/pin`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
