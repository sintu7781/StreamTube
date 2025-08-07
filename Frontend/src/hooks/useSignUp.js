import { useMutation } from "@tanstack/react-query";
import { signupUser, signupWithGoogle, signupWithGitHub } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useSignup = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth) {
    throw new Error("useSignup must be used within an AuthProvider");
  }

  const { login } = auth;

  // Email/password signup mutation
  const emailSignupMutation = useMutation({
    mutationFn: (data) => signupUser(data),
    onSuccess: (data) => {
      if (data.requiresVerification) {
        navigate("/verify-email", {
          state: { email: data.email },
        });
      } else {
        login(data.token, data.user);
        navigate("/dashboard");
      }
    },
  });

  // Google signup mutation
  const googleSignupMutation = useMutation({
    mutationFn: (credential) => signupWithGoogle(credential),
    onSuccess: (data) => {
      if (data?.token && data?.user) {
        login(data.token, data.user);
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      console.error("Google signup failed:", error);
    },
  });

  // GitHub signup mutation
  const gitHubSignupMutation = useMutation({
    mutationFn: (code) => signupWithGitHub(code),
    onSuccess: (data) => {
      if (data?.token) {
        login(data.token, data.user);
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      console.error("GitHub signup failed:", error);
    },
  });

  return {
    isPending:
      emailSignupMutation.isPending ||
      googleSignupMutation.isPending ||
      gitHubSignupMutation.isPending,
    error:
      emailSignupMutation.error ||
      googleSignupMutation.error ||
      gitHubSignupMutation.error,
    signupMutation: emailSignupMutation.mutate,
    signupWithGoogle: googleSignupMutation.mutate,
    signupWithGitHub: gitHubSignupMutation.mutate,
  };
};

export default useSignup;
