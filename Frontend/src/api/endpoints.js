const API_VERSION = "/v1";

export const AUTH_ENDPOINTS = {
  SIGNUP: `${API_VERSION}/auth/signup`,
  GOOGLE_SIGNUP: `${API_VERSION}/auth/google/signup`,
  GITHUB_SIGNUP: `${API_VERSION}/auth/github/signup`,
  LOGIN: `${API_VERSION}/auth/login`,
  GOOGLE_LOGIN: `${API_VERSION}/auth/google/login`,
  GITHUB_LOGIN: `${API_VERSION}/auth/github`,
  REFRESH_TOKEN: `${API_VERSION}/auth/refresh-token`,
  LOGOUT: `${API_VERSION}/auth/logout`,
  VERIFY_EMAIL: (token) => `${API_VERSION}/auth/verify-email/${token}`,
  FORGET_PASSWORD: `${API_VERSION}/auth/forget-password`,
  RESET_PASSWORD: (token) => `${API_VERSION}/auth/reset-password/${token}`,
};

export const USER_ENDPOINTS = {
  GET_PROFILE: `${API_VERSION}/users/profile`,
  UPDATE_PROFILE: `${API_VERSION}/users/update`,
  UPLOAD_AVATAR: `${API_VERSION}/users/upload-avatar`,
};

export const VIDEO_ENDPOINTS = {
  GET_ALL_VIDEOS: `${API_VERSION}/videos`,
  GET_SINGLE_VIDEO: (id) => `${API_VERSION}/videos/${id}`,
  UPLOAD_VIDEO: `${API_VERSION}/videos/upload`,
  UPDATE_VIDEO: (id) => `${API_VERSION}/videos/${id}`,
  DELETE_VIDEO: (id) => `${API_VERSION}/videos/${id}`,
};

export const CHANNEL_ENDPOINTS = {
  GET_MY_CHANNEL: `${API_VERSION}/channels/me`,
  GET_CHANNEL: (handle) => `${API_VERSION}/channels/${handle}`,
  GET_CHANNEL_VIDEOS: (handle) => `${API_VERSION}/channels/${handle}/videos`,
  CREATE_CHANNEL: `${API_VERSION}/channels`,
  UPDATE_CHANNEL: `${API_VERSION}/channels/me`,
  DELETE_CHANNEL: `${API_VERSION}/channels/me`,
};

export const COMMENT_ENDPOINTS = {
  GET_VIDEO_COMMENTS: (videoId) => `${API_VERSION}/comments/video/${videoId}`,
  CREATE_COMMENT: `${API_VERSION}/comments`,
  UPDATE_COMMENT: (id) => `${API_VERSION}/comments/${id}`,
  DELETE_COMMENT: (id) => `${API_VERSION}/comments/${id}`,
};

export const LIKE_ENDPOINTS = {
  TOGGLE_LIKE: (videoId) => `${API_VERSION}/likes/video/${videoId}`,
  GET_LIKES: (videoId) => `${API_VERSION}/likes/video/${videoId}`,
};
