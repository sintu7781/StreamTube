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

  const validateToken = async (token) => {
    try {
      const { exp, ...userData } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        logout();
        return;
      }
      
      // First, try to restore channel data from localStorage
      const savedChannel = localStorage.getItem("userChannel");
      let initialUserData = userData;
      
      if (savedChannel) {
        try {
          const channelData = JSON.parse(savedChannel);
          initialUserData = { ...userData, channel: channelData };
        } catch (parseError) {
          console.error("Error parsing saved channel data:", parseError);
          localStorage.removeItem("userChannel");
        }
      }
      
      // Set user data immediately to prevent logout on refresh
      setUser(initialUserData);
      
      // Fetch complete user data including channel information in background
      try {
        const channelResponse = await getUserChannel();
        if (channelResponse?.data?.data?.channel || channelResponse?.data?.channel) {
          const channel = channelResponse.data?.data?.channel || channelResponse.data?.channel;
          const updatedUser = { ...userData, channel };
          setUser(updatedUser);
          // Store updated channel data in localStorage for persistence
          localStorage.setItem("userChannel", JSON.stringify(channel));
        } else if (!savedChannel) {
          // No channel found and none saved - user doesn't have a channel
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
        // If we already have saved channel data, keep it
        if (!savedChannel) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token, userData) => {
    console.log("Login called with:", { token, userData });
    localStorage.setItem("authToken", token);
    
    // Ensure we preserve the full user object structure
    if (userData && typeof userData === 'object') {
      setUser(userData);
      // Store channel data if available
      if (userData.channel) {
        localStorage.setItem("userChannel", JSON.stringify(userData.channel));
      }
    } else {
      console.error("Invalid user data received:", userData);
    }
    
    return userData;
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => {
      const newUser = {
        ...prevUser,
        ...updatedUserData
      };
      
      // If channel data is being updated, save it to localStorage
      if (updatedUserData.channel) {
        localStorage.setItem("userChannel", JSON.stringify(updatedUserData.channel));
      }
      
      return newUser;
    });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userChannel");
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
