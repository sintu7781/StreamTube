import axiosInstance from "../lib/axios";
import { AUTH_ENDPOINTS } from "./endpoints";

export const signupUser = async (registerData) => {
  const response = await axiosInstance.post(
    AUTH_ENDPOINTS.SIGNUP,
    registerData
  );
  return response.data;
};

export const signupWithGoogle = async (token) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.GOOGLE_SIGNUP, {
    token,
  });
  return response.data;
};

export const signupWithGitHub = async (code) => {
  const response = await axiosInstance.get(
    `${AUTH_ENDPOINTS.GITHUB_SIGNUP}?code=${code}`
  );
  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, loginData);
  return response.data;
};

export const loginWithGoogle = async (idToken) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.GOOGLE_LOGIN, {
    token: idToken,
  });
  return response.data;
};

export const loginWithGitHub = async (code) => {
  try {
    const response = await axiosInstance.get(
      `${AUTH_ENDPOINTS.GITHUB_LOGIN}/callback?code=${code}`
    );
    return response.data;
  } catch (error) {
    console.error("GitHub login error:", error);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  const response = await axiosInstance.get(AUTH_ENDPOINTS.VERIFY_EMAIL(token));
  return response.data;
};

export const forgetPassword = async (email) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.FORGET_PASSWORD, {
    email,
  });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await axiosInstance.post(
    AUTH_ENDPOINTS.RESET_PASSWORD(token),
    { password }
  );
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
  return response.data;
};

export const refreshToken = async () => {
  return await axiosInstance.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
};
