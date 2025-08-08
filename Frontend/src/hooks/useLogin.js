import { useState } from "react";
import { loginUser, loginWithGoogle, loginWithGitHub } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  if (!auth) {
    throw new Error("useLogin must be used within an AuthProvider");
  }

  const { login } = auth;

  const handleLogin = async (loginData) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await loginUser(loginData);
      console.log("Login response:", data);
      const accessToken = data.data?.accessToken || data.accessToken;
      const userData = data.data?.user || data.user;
      
      console.log("Extracted token:", accessToken);
      console.log("Extracted user data:", userData);

      if (accessToken && userData) {
        login(accessToken, userData);
        navigate("/");
      } else {
        console.error("Missing token or user data:", { accessToken, userData });
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      console.log("Google login response:", data);
      const accessToken = data.data?.accessToken || data.accessToken;
      const userData = data.data?.user || data.user;
      
      console.log("Google login - token:", accessToken);
      console.log("Google login - user data:", userData);

      if (accessToken && userData) {
        login(accessToken, userData);
        navigate("/");
      } else {
        console.error("Google login - missing token or user data:", { accessToken, userData });
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Google login failed:", err);
      setError(err.response?.data?.message || "Google login failed");
    } finally {
      setIsPending(false);
    }
  };

  const handleGitHubLogin = async (code) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await loginWithGitHub(code);
      console.log("GitHub login response:", data);
      const accessToken = data.data?.accessToken || data.accessToken;
      const userData = data.data?.user || data.user;
      
      console.log("GitHub login - token:", accessToken);
      console.log("GitHub login - user data:", userData);

      if (accessToken && userData) {
        login(accessToken, userData);
        navigate("/");
      } else {
        console.error("GitHub login - missing token or user data:", { accessToken, userData });
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("GitHub login failed:", err);
      setError(err.response?.data?.message || "GitHub login failed");
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    error,
    loginMutation: handleLogin,
    loginWithGoogle: handleGoogleLogin,
    loginWithGitHub: handleGitHubLogin,
  };
};

export default useLogin;
