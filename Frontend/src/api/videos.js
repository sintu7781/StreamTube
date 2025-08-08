import axiosInstance from "../lib/axios";
import { VIDEO_ENDPOINTS } from "./endpoints";

export const getAllVideos = async () => {
  const response = await axiosInstance.get(VIDEO_ENDPOINTS.GET_ALL_VIDEOS);
  return response.data;
};

export const getSingleVideo = async (id) => {
  const response = await axiosInstance.get(
    VIDEO_ENDPOINTS.GET_SINGLE_VIDEO(id)
  );
  console.log(response);
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
export const searchVideos = async (query) => {
  const response = await axiosInstance.get(
    `/v1/videos/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const searchChannels = async (query) => {
  const response = await axiosInstance.get(
    `/v1/channels/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const getChannelVideos = async (handle, page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/v1/channels/${handle}/videos?page=${page}&limit=${limit}`
  );
  return response.data;
};
