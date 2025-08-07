import { useState, useEffect } from "react";
import useLogin from "../hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGithub } from "react-icons/fa";
import { AiFillYoutube } from "react-icons/ai";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import useDarkMode from "../hooks/useDarkMode";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isPending, error, loginMutation, loginWithGoogle, loginWithGitHub } =
    useLogin();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: localStorage.getItem("rememberMe") === "true" || false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    if (formData.rememberMe) {
      const savedEmail = localStorage.getItem("savedEmail");
      if (savedEmail) setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
  }, [formData.rememberMe]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) return setFieldErrors(newErrors);

    if (formData.rememberMe) {
      localStorage.setItem("savedEmail", formData.email);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("savedEmail");
      localStorage.removeItem("rememberMe");
    }

    await loginMutation({ email: formData.email, password: formData.password });
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (error) {
      console.error("Google login failed:", error);
      if (error.message.includes("FedCM")) {
        // Fallback to traditional OAuth flow
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?
          client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}
          &redirect_uri=${window.location.origin}/auth/google/callback
          &response_type=code
          &scope=email profile
          &access_type=offline
          &prompt=consent`;
      }
    }
  };

  // GitHub Login
  const handleGitHubLogin = () => {
    // Remove all line breaks and extra spaces from the URL
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${
      import.meta.env.VITE_GITHUB_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      window.location.origin + "/auth/github/callback"
    )}&scope=user:email`;

    console.log("Redirecting to:", githubAuthUrl); // Debug log
    window.location.href = githubAuthUrl;
  };

  // Handle GitHub callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const authenticate = async () => {
        try {
          const response = await loginWithGitHub(code);

          // Handle successful login (store tokens, redirect, etc.)
          console.log("GitHub login success:", response.data);

          // Clean URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          // Redirect to dashboard or home page
          window.location.href = "/dashboard";
        } catch (error) {
          console.error("GitHub authentication failed:", error);
          // Redirect to login page with error
          window.location.href = `/login?error=${encodeURIComponent(
            error.response?.data?.message || "github_auth_failed"
          )}`;
        }
      };
      authenticate();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <header className="w-full py-3 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <AiFillYoutube className="text-red-600 text-3xl" />
          <span className="ml-2 text-xl font-semibold dark:text-white">
            StreamTube
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
        </div>
      </header>

      <div className="w-full max-w-md mt-8 px-8 py-6 sm:mt-12">
        <div className="flex flex-col items-center mb-8">
          <AiFillYoutube className="text-red-600 text-5xl mb-4" />
          <h1 className="text-2xl font-medium dark:text-white">Sign in</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            to continue to StreamTube
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition ${
                  fieldErrors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition ${
                  fieldErrors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              {fieldErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 transition"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              className="text-blue-500 text-sm font-medium hover:underline dark:text-blue-400 transition-colors"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`px-6 py-2 rounded-md flex items-center justify-center min-w-24 ${
                isPending
                  ? "bg-gray-300 text-gray-500 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              }`}
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Next"
              )}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-4">
              {error.response?.data?.message ||
                "Could not sign you in. Please try again."}
            </p>
          )}
        </form>

        <div className="mt-8">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
            <span className="px-3 text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          <div className="mt-6 space-y-4">
            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              onScriptLoadError={() =>
                console.error("Failed to load Google OAuth script")
              }
              onScriptLoadSuccess={() =>
                console.log("Google OAuth script loaded")
              }
            >
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.log("Google Login Failed");
                  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
                    import.meta.env.VITE_GOOGLE_CLIENT_ID
                  }&redirect_uri=${
                    window.location.origin
                  }/auth/google/callback&response_type=code&scope=email profile`;
                }}
                useOneTap={false}
                auto_select
                cancel_on_tap_outside={false}
                scope="email profile"
                theme={darkMode ? "filled_black" : "outline"}
                shape="pill"
                size="large"
                text="signin_with"
              />
            </GoogleOAuthProvider>

            <button
              onClick={handleGitHubLogin}
              disabled={isPending}
              className="w-full px-4 py-3 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
            >
              <FaGithub
                className="text-gray-800 dark:text-gray-200 mr-2"
                size={18}
              />
              <span className="text-gray-700 dark:text-gray-200">
                Sign in with GitHub
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-500 hover:underline dark:text-blue-400 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <footer className="w-full mt-auto py-6 px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:flex-wrap justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex flex-wrap justify-center sm:justify-start space-x-6 mb-2 sm:mb-0">
            <span>© {new Date().getFullYear()} StreamTube</span>
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
            <a href="/policy" className="hover:underline">
              Policy & Safety
            </a>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end space-x-6">
            <button onClick={() => {}} className="hover:underline">
              English (US)
            </button>
            <a href="/help" className="hover:underline">
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
