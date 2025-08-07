// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

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

  const validateToken = (token) => {
    try {
      const { exp, ...userData } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        logout();
      } else {
        setUser(userData);
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
    } else {
      console.error("Invalid user data received:", userData);
    }
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
