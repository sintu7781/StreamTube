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

// Add other video-related API calls as needed
