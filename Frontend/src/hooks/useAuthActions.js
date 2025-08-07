import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleLogin, githubLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export const useGoogleAuth = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: ({ token, user }) => {
      queryClient.invalidateQueries(["user"]);
      login(token, user);
    },
    onError: (error) => {
      console.error("Google auth failed:", error);
    },
  });
};

export const useGitHubAuth = () => {
  const { login } = useAuth();

  return {
    initiate: () => (window.location.href = "/api/auth/github"),
    handleCallback: async (code) => {
      const { token, user } = await githubLogin(code);
      login(token, user);
    },
  };
};
