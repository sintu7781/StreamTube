// githubAuth.service.js
import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { generateHandle } from "../utils/handleGenerator.js";

/**
 * Exchange GitHub code for access token with enhanced security
 */
const getGitHubAccessToken = async (code, authType = "login") => {
  try {
    if (!code) {
      throw new ApiError(400, "Authorization code is required");
    }

    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "StreamTube", // GitHub requires user agent
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!response.data.access_token) {
      throw new ApiError(
        401,
        `GitHub ${authType} failed: No access token received`
      );
    }

    return {
      accessToken: response.data.access_token,
      scope: response.data.scope,
      tokenType: response.data.token_type,
    };
  } catch (error) {
    console.error(`GitHub ${authType} token exchange error:`, error);

    if (error.response?.data?.error === "bad_verification_code") {
      throw new ApiError(
        401,
        "Invalid GitHub authorization code. Please try again."
      );
    }

    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message ||
        `GitHub ${authType} failed. Please try again.`
    );
  }
};

/**
 * Get comprehensive GitHub user data for both login and signup
 */
const getGitHubUserData = async (code, authType = "login") => {
  try {
    const { accessToken } = await getGitHubAccessToken(code, authType);

    // Parallel requests for better performance
    const [userResponse, emailsResponse] = await Promise.all([
      axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        timeout: 10000,
      }),
      axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        timeout: 10000,
      }),
    ]);

    // Find primary email or first verified email
    const primaryEmail =
      emailsResponse.data.find((e) => e.primary) ||
      emailsResponse.data.find((e) => e.verified);
    const email =
      primaryEmail?.email ||
      `${userResponse.data.id}+${userResponse.data.login}@users.noreply.github.com`;

    // Generate handle asynchronously
    const handle = await generateHandle(
      userResponse.data.name || userResponse.data.login
    );

    // Standardized response for both controllers
    return {
      id: userResponse.data.id,
      login: userResponse.data.login,
      email: email.toLowerCase(), // Normalize email
      name: userResponse.data.name || userResponse.data.login,
      avatar_url: userResponse.data.avatar_url,
      html_url: userResponse.data.html_url,
      bio: userResponse.data.bio,
      location: userResponse.data.location,
      created_at: userResponse.data.created_at,
      // Additional fields needed for user creation
      username: handle,
      fullName: userResponse.data.name || userResponse.data.login,
      avatar: userResponse.data.avatar_url,
      isVerified: true,
      githubId: userResponse.data.id.toString(),
      authMethod: "github",
      rawData: userResponse.data, // Keep raw data for debugging
    };
  } catch (error) {
    console.error(`GitHub ${authType} data fetch error:`, error);

    if (error.response?.status === 401) {
      throw new ApiError(
        401,
        "GitHub authentication expired. Please sign in again."
      );
    }

    if (error.response?.status === 403) {
      throw new ApiError(
        403,
        "GitHub access forbidden. Please check your permissions."
      );
    }

    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message ||
        `GitHub ${authType} failed. Please try again.`
    );
  }
};

export { getGitHubUserData };
