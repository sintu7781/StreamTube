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
  GET_RELATED_VIDEOS: (id) => `${API_VERSION}/videos/${id}/related`,
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

export const SUBSCRIPTION_ENDPOINTS = {
  TOGGLE_SUBSCRIPTION: (channelId) =>
    `${API_VERSION}/subscriptions/${channelId}`,
  CHECK_SUBSCRIPTION_STATUS: (channelId) =>
    `${API_VERSION}/subscriptions/${channelId}/status`,
  GET_USER_SUBSCRIPTION: `${API_VERSION}/subscriptions/me`,
  GET_CHANNEL_SUBSCRIPTION: (channelId) =>
    `${API_VERSION}/subscriptions/${channelId}`,
};

export const COMMENT_ENDPOINTS = {
  GET_VIDEO_COMMENTS: (videoId) => `${API_VERSION}/comments/video/${videoId}`,
  CREATE_COMMENT: `${API_VERSION}/comments`,
  UPDATE_COMMENT: (id) => `${API_VERSION}/comments/${id}`,
  DELETE_COMMENT: (id) => `${API_VERSION}/comments/${id}`,
};

export const LIKE_ENDPOINTS = {
  TOGGLE_LIKE: `${API_VERSION}/likes/toggle`,
  GET_LIKES: `${API_VERSION}/likes/count`,
  GET_LIKED_VIDEOS: `${API_VERSION}/likes/liked-videos`,
  GET_LIKED_COMMENTS: `${API_VERSION}/likes/liked-comments`,
};

export const WATCH_HISTORY_ENDPOINTS = {
  GET_HISTORY: `${API_VERSION}/watch-history`,
  ADD_HISTORY: `${API_VERSION}/watch-history/add`,
  REMOVE_FROM_HISTORY: (videoId) =>
    `${API_VERSION}/watch-history/remove/${videoId}`,
  CLEAR_HISTORY: `${API_VERSION}/watch-history/clear`,
};

export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATION: (page, limit) =>
    `${API_VERSION}/notifications?page=${page}&limit=${limit}`,
  GET_UNREAD_COUNT: `${API_VERSION}/notifications/unread-count`,
  MARK_AS_READ: `${API_VERSION}/notifications/mark-read`,
  MARK_ALL_AS_READ: `${API_VERSION}/notifications/mark-all-read`,
  DELETE_NOTIFICATION: (notificationId) =>
    `${API_VERSION}/notifications/${notificationId}`,
  GET_NOTIFICATION_BY_ID: (notificationId) =>
    `${API_VERSION}/notifications/${notificationId}`,
};

export const WATCH_LATER_ENDPOINTS = {
  GET_WATCH_LATER: `${API_VERSION}/watch-later`,
  GET_WATCH_LATER_STATS: `${API_VERSION}/watch-later/stats`,
  GET_WATCH_LATER_BATCH: `${API_VERSION}/watch-later/batch`,
  CLEAR_WATCH_LATER: `${API_VERSION}/watch-later/clear`,
  REORDER_WATCH_LATER: `${API_VERSION}/watch-later/reorder`,
  ADD_TO_WATCH_LATER: (videoId) => `${API_VERSION}/watch-later/${videoId}`,
  REMOVE_FROM_WATCH_LATER: (videoId) => `${API_VERSION}/watch-later/${videoId}`,
  CHECK_WATCH_LATER_STATUS: (videoId) =>
    `${API_VERSION}/watch-later/${videoId}/status`,
  TOGGLE_WATCH_LATER: (videoId) =>
    `${API_VERSION}/watch-later/${videoId}/toggle`,
  UPDATE_WATCH_LATER_NOTES: (videoId) =>
    `${API_VERSION}/watch-later/${videoId}/notes`,
};

export const CHANNEL_ANALYTICS_ENDPOINTS = {
  GET_ANALYTICS_OVERVIEW: (channelId) =>
    `${API_VERSION}/analytics/${channelId}/overview`,
  GET_CHANNEL_ANALYTICS: (channelId) => `${API_VERSION}/analytics/${channelId}`,
  GET_AUDIENCE_DEMOGRAPHICS: (channelId) =>
    `${API_VERSION}/analytics/${channelId}/demographics`,
  BULK_UPDATE_ANALYTICS: (channelId) =>
    `${API_VERSION}/analytics/${channelId}/bulk`,
  DELETE_ANALYTICS: (channelId, date) =>
    `${API_VERSION}/analytics/${channelId}/${date}`,
};
