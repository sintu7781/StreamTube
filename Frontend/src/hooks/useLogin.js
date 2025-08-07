import { useMutation } from "@tanstack/react-query";
import { loginUser, loginWithGoogle, loginWithGitHub } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth) {
    throw new Error("useLogin must be used within an AuthProvider");
  }

  const { login } = auth;

  // Email/password login mutation
  const emailLoginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
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
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  // Google login mutation
  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => {
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
      }
    },
    onError: (error) => {
      console.error("Google login failed:", error);
    },
  });

  // GitHub login mutation
  const gitHubLoginMutation = useMutation({
    mutationFn: loginWithGitHub,
    onSuccess: (data) => {
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
      }
    },
    onError: (error) => {
      console.error("GitHub login failed:", error);
    },
  });

  return {
    isPending:
      emailLoginMutation.isPending ||
      googleLoginMutation.isPending ||
      gitHubLoginMutation.isPending,
    error:
      emailLoginMutation.error ||
      googleLoginMutation.error ||
      gitHubLoginMutation.error,
    loginMutation: emailLoginMutation.mutate,
    loginWithGoogle: googleLoginMutation.mutate,
    loginWithGitHub: gitHubLoginMutation.mutate,
  };
};

export default useLogin;
