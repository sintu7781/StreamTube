import { useState } from "react";
import { signupUser, signupWithGoogle, signupWithGitHub } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useSignup = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  if (!auth) {
    throw new Error("useSignup must be used within an AuthProvider");
  }

  const { login } = auth;

  const handleSignup = async (data) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await signupUser(data);
      if (response.requiresVerification) {
        navigate("/verify-email", {
          state: { email: response.email },
        });
      } else {
        login(response.token, response.user);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleSignup = async (credential) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await signupWithGoogle(credential);
      if (data?.token && data?.user) {
        login(data.token, data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google signup failed:", err);
      setError(err.response?.data?.message || "Google signup failed");
    } finally {
      setIsPending(false);
    }
  };

  const handleGitHubSignup = async (code) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await signupWithGitHub(code);
      if (data?.token) {
        login(data.token, data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("GitHub signup failed:", err);
      setError(err.response?.data?.message || "GitHub signup failed");
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    error,
    signupMutation: handleSignup,
    signupWithGoogle: handleGoogleSignup,
    signupWithGitHub: handleGitHubSignup,
  };
};

export default useSignup;
