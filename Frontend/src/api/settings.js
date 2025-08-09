import axiosInstance from "../lib/axios";

// Get user settings
export const getUserSettings = async () => {
  try {
    const response = await axiosInstance.get("/users/settings");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update privacy settings
export const updatePrivacySettings = async (privacySettings) => {
  try {
    const response = await axiosInstance.put("/users/privacy", privacySettings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (notificationSettings) => {
  try {
    const response = await axiosInstance.put(
      "/users/notifications",
      notificationSettings
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update appearance settings
export const updateAppearanceSettings = async (appearanceSettings) => {
  try {
    const response = await axiosInstance.put(
      "/users/appearance",
      appearanceSettings
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put("/users/password", passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete account
export const deleteAccount = async (confirmationData) => {
  try {
    const response = await axiosInstance.delete("/users/account", {
      data: confirmationData,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export user data
export const exportUserData = async () => {
  try {
    const response = await axiosInstance.get("/users/export");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get account activity
export const getAccountActivity = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/users/activity", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile picture
export const updateProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await axiosInstance.patch(
      "/users/profile-picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove user profile picture
export const removeProfilePicture = async () => {
  try {
    const response = await axiosInstance.delete("/users/profile-picture");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update channel avatar
export const updateChannelAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("channelAvatar", file);

    const response = await axiosInstance.patch(
      "/channels/me/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove channel avatar
export const removeChannelAvatar = async () => {
  try {
    const response = await axiosInstance.delete("/channels/me/avatar");
    return response.data;
  } catch (error) {
    throw error;
  }
};
