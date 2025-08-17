// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserChannel } from "../api/channel";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  };

  // Add a backup method to restore user from localStorage if token validation fails
  const restoreUserFromStorage = () => {
    const savedProfile = localStorage.getItem("userProfile");
    const savedChannel = localStorage.getItem("userChannel");

    if (savedProfile || savedChannel) {
      let fallbackUser = {};

      if (savedProfile) {
        try {
          fallbackUser.profile = JSON.parse(savedProfile);
        } catch (error) {
          console.error("Failed to parse saved profile", error);
        }
      }

      if (savedChannel) {
        try {
          fallbackUser.channel = JSON.parse(savedChannel);
        } catch (error) {
          console.error("Failed to parse saved channel", error);
        }
      }

      // Add a fallback email if we have any saved data
      if (Object.keys(fallbackUser).length > 0) {
        fallbackUser.email = fallbackUser.profile?.email || "user@example.com";
        console.log("Restored user from localStorage:", fallbackUser);
        setUser(fallbackUser);
        return true;
      }
    }

    return false;
  };

  const validateToken = async (token) => {
    try {
      const { exp, ...userData } = jwtDecode(token);

      // Check if token is expired
      if (Date.now() >= exp * 1000) {
        console.log("Token expired, logging out");
        logout();
        return;
      }

      // First, try to restore channel and profile data from localStorage
      const savedChannel = localStorage.getItem("userChannel");
      const savedProfile = localStorage.getItem("userProfile");
      let initialUserData = { ...userData };

      if (savedChannel) {
        try {
          const channelData = JSON.parse(savedChannel);
          initialUserData.channel = channelData;
        } catch (parseError) {
          console.error("Error parsing saved channel data:", parseError);
          localStorage.removeItem("userChannel");
        }
      }

      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          initialUserData.profile = profileData;
        } catch (parseError) {
          console.error("Error parsing saved profile data:", parseError);
          localStorage.removeItem("userProfile");
        }
      }

      console.log("Setting user data on token validation:", initialUserData);
      // Set user data immediately to prevent logout on refresh
      setUser(initialUserData);
      setIsLoading(false); // Set loading to false immediately after setting user

      // Fetch complete user data including channel information in background
      // This is now completely optional and won't affect authentication state
      fetchChannelDataInBackground(initialUserData);
    } catch (error) {
      console.error("Token validation failed:", error);
      // Only logout if it's specifically a JWT decode error (invalid token)
      if (
        error.name === "InvalidTokenError" ||
        error.message.includes("invalid") ||
        error.message.includes("malformed")
      ) {
        console.log("Token is invalid, logging out");
        logout();
      } else {
        console.log(
          "Non-token error during validation, keeping user logged in"
        );
        // Even if we can't decode the token due to other errors, keep user logged in if token exists
        // This prevents logout due to temporary issues
        setUser({ email: "user@example.com" }); // Fallback user data
        setIsLoading(false);
      }
    }
  };

  // Separate function for background channel data fetching
  const fetchChannelDataInBackground = async (userData) => {
    try {
      const channelResponse = await getUserChannel();
      if (
        channelResponse?.data?.data?.channel ||
        channelResponse?.data?.channel
      ) {
        const channel =
          channelResponse.data?.data?.channel || channelResponse.data?.channel;
        // Update user with fresh channel data
        const updatedUser = {
          ...userData,
          channel,
        };
        console.log("Updated user with fresh channel data:", updatedUser);
        setUser(updatedUser);
        // Store updated channel data in localStorage for persistence
        localStorage.setItem("userChannel", JSON.stringify(channel));
      }
    } catch (error) {
      console.error("Background channel fetch failed:", error);
      // Don't do anything on error - user remains logged in with cached data
    }
  };

  const login = (token, userData) => {
    console.log("Login called with:", { token, userData });
    localStorage.setItem("authToken", token);

    // Ensure we preserve the full user object structure
    if (userData && typeof userData === "object") {
      setUser(userData);
      // Store channel data if available
      if (userData.channel) {
        localStorage.setItem("userChannel", JSON.stringify(userData.channel));
      }
      // Store profile data if available (including profile picture)
      if (userData.profile) {
        localStorage.setItem("userProfile", JSON.stringify(userData.profile));
      }
    } else {
      console.error("Invalid user data received:", userData);
    }

    return userData;
  };

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => {
      const newUser = {
        ...prevUser,
        ...updatedUserData,
      };

      // If channel data is being updated, save it to localStorage
      if (updatedUserData.channel) {
        localStorage.setItem(
          "userChannel",
          JSON.stringify(updatedUserData.channel)
        );
      }

      // If profile data is being updated, save it to localStorage
      if (updatedUserData.profile) {
        localStorage.setItem(
          "userProfile",
          JSON.stringify(updatedUserData.profile)
        );
      }

      return newUser;
    });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userChannel");
    localStorage.removeItem("userProfile");
    setUser(null);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
