import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../utils/ApiError.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === "production"
    ? "https://your-production-domain.com/api/v1/auth/google/callback"
    : "http://localhost:3000/api/v1/auth/google/callback"
);

const verifyGoogleToken = async (token, authType = "login") => {
  if (!token) {
    throw new ApiError(400, "Google token is required");
  }

  try {
    // Verify the token with additional checks
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Enhanced validations
    if (!payload.email_verified) {
      throw new ApiError(
        403,
        "Google email not verified. Please verify your email with Google first."
      );
    }

    if (!payload.email) {
      throw new ApiError(400, "Could not retrieve email from Google account.");
    }

    // Domain restriction (if needed)
    if (process.env.ALLOWED_GOOGLE_DOMAINS) {
      const allowedDomains = process.env.ALLOWED_GOOGLE_DOMAINS.split(",");
      const userDomain = payload.email.split("@")[1];

      if (!allowedDomains.includes(userDomain)) {
        throw new ApiError(403, `Email domain ${userDomain} is not allowed.`);
      }
    }

    // Standardized response for both login and signup
    return {
      email: payload.email.toLowerCase(), // Normalize email
      username: generateGoogleUsername(payload), // Helper function
      fullName: payload.name || payload.email.split("@")[0],
      avatar: payload.picture || null,
      isVerified: payload.email_verified,
      googleId: payload.sub,
      authMethod: "google",
      locale: payload.locale || "en",
      hd: payload.hd || null, // G Suite domain if available
    };
  } catch (error) {
    // Enhanced error handling
    console.error(`Google ${authType} error:`, error);

    if (error.message.includes("Token used too late")) {
      throw new ApiError(
        401,
        "Your Google session has expired. Please sign in again."
      );
    }

    if (error.message.includes("Wrong number of segments")) {
      throw new ApiError(400, "Invalid Google token format.");
    }

    if (error.message.includes("Audience mismatch")) {
      throw new ApiError(401, "Invalid application credentials.");
    }

    throw new ApiError(
      error.statusCode || 401,
      error.message || `Google ${authType} failed. Please try again.`
    );
  }
};

// Helper function to generate consistent usernames
const generateGoogleUsername = (payload) => {
  const base = payload.name
    ? payload.name.replace(/\s+/g, "_").toLowerCase()
    : payload.email.split("@")[0];

  return `${base}_${Math.random().toString(36).substring(2, 8)}`;
};

export { verifyGoogleToken, googleClient };
