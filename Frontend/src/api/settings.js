import { api } from "./endpoints";

// Get user settings
export const getUserSettings = async () => {
  try {
    const response = await api.get("/users/settings");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update privacy settings
export const updatePrivacySettings = async (privacySettings) => {
  try {
    const response = await api.put("/users/privacy", privacySettings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (notificationSettings) => {
  try {
    const response = await api.put("/users/notifications", notificationSettings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update appearance settings
export const updateAppearanceSettings = async (appearanceSettings) => {
  try {
    const response = await api.put("/users/appearance", appearanceSettings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put("/users/password", passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete account
export const deleteAccount = async (confirmationData) => {
  try {
    const response = await api.delete("/users/account", { data: confirmationData });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export user data
export const exportUserData = async () => {
  try {
    const response = await api.get("/users/export");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get account activity
export const getAccountActivity = async (params = {}) => {
  try {
    const response = await api.get("/users/activity", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
