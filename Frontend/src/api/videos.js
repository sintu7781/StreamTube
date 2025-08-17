import axiosInstance from "../lib/axios";
import { getSessionId } from "../utils/session";
import { VIDEO_ENDPOINTS } from "./endpoints";

export const getAllVideos = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${VIDEO_ENDPOINTS.GET_ALL_VIDEOS}?${queryString}`
    : VIDEO_ENDPOINTS.GET_ALL_VIDEOS;

  const response = await axiosInstance.get(url);
  return response.data;
};

export const getSingleVideo = async (id) => {
  const response = await axiosInstance.get(
    VIDEO_ENDPOINTS.GET_SINGLE_VIDEO(id)
  );
  return response.data;
};

export const uploadVideo = async (formData) => {
  const response = await axiosInstance.post(
    VIDEO_ENDPOINTS.UPLOAD_VIDEO,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Search functionality
export const searchVideos = async (query, params = {}) => {
  const queryParams = new URLSearchParams();

  queryParams.append("q", query);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await axiosInstance.get(
    `/v1/videos/search?${queryParams.toString()}`
  );
  return response.data;
};

export const searchChannels = async (query) => {
  const response = await axiosInstance.get(
    `/v1/channels/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const getChannelVideos = async (
  handle,
  page = 1,
  limit = 10,
  visibility = "public"
) => {
  const response = await axiosInstance.get(
    `/v1/channels/${handle}/videos?page=${page}&limit=${limit}&visibility=${visibility}`
  );
  return response.data;
};

// Get related videos
export const getRelatedVideos = async (videoId, limit = 12) => {
  const response = await axiosInstance.get(
    VIDEO_ENDPOINTS.GET_RELATED_VIDEOS(videoId) + `?limit=${limit}`
  );
  return response.data;
};

// Get videos by category
export const getVideosByCategory = async (category, params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString
    ? `/v1/videos/category/${category}?${queryString}`
    : `/v1/videos/category/${category}`;

  const response = await axiosInstance.get(url);
  return response.data;
};

// Increment video views
export const incrementViews = async (videoId, viewData = {}) => {
  const response = await axiosInstance.post(
    `/v1/videos/${videoId}/views`,
    viewData,
    {
      headers: {
        "x-session-id": getSessionId(),
      },
    }
  );
  console.log(response);
  return response.data;
};
