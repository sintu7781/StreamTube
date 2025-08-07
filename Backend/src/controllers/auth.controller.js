import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import { sendPasswordResetEmail } from "../utils/sendPasswordResetEmail.js";
import crypto from "crypto";
import { getGitHubUserData } from "../services/githubAuth.service.js";
import {
  verifyGoogleToken,
  googleClient as googleOAuth2Client,
} from "../services/googleAuth.service.js";
import { generateHandle } from "../utils/handleGenerator.js";

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Mock function for sending verification email (replace with actual implementation)
const sendVerificationEmail = async (email, token) => {
  // TODO: Implement actual email sending logic
  console.log(`Verification email would be sent to ${email} with token: ${token}`);
  return true;
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(
      `Error while generating access and refresh tokens !!! ${error}`
    );
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const signupUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    const suggestions = {
      username: `${username}${Math.floor(Math.random() * 100)}`,
      email: email, // Keep original email
    };

    if (existedUser.username === username && existedUser.email === email) {
      throw new ApiError(
        409,
        "Username and Email are already taken",
        suggestions
      );
    } else if (existedUser.username === username) {
      throw new ApiError(409, "Username is already taken", suggestions);
    } else if (existedUser.email === email) {
      throw new ApiError(409, "Email is already registered");
    }
  }

  const user = await User.create({
    username,
    email,
    password,
    authMethod: "email",
    isVerified: false, // Will be true after email verification
  });

  const verificationToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email (implementation depends on your email service)
  await sendVerificationEmail(email, verificationToken);

  const createdUser = await User.findById(user._id)
    .select("-password")
    .populate({
      path: "channel",
      select: "name handle stats",
    });

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, { user: createdUser }, "User created successfully")
    );
});

const googleSignup = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, "Google token is required");

  try {
    const googleUser = await verifyGoogleToken(token, "signup");
    if (!googleUser.email_verified) {
      throw new ApiError(401, "Google email not verified");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: googleUser.email });
    if (existingUser) {
      if (existingUser) {
        // Instead of throwing an error, generate tokens and log them in
        const { accessToken, refreshToken } =
          await generateAccessAndRefreshTokens(existingUser._id);
        const userData = await User.findById(existingUser._id)
          .select("-password -refreshToken")
          .populate({
            path: "channel",
            select: "name handle stats",
          });
        return res
          .status(200) // 200 OK instead of 201 Created
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
            new ApiResponse(
              200,
              { user: userData },
              "Google login successful (user already exists)"
            )
          );
      }
    }

    // Create new user
    const user = await User.create({
      email: googleUser.email,
      username: await generateHandle(googleUser.name),
      fullName: googleUser.name,
      avatar: googleUser.picture,
      authMethod: "google",
      isVerified: true,
      googleId: googleUser.sub,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );
    const userData = await User.findById(user._id)
      .select("-password -refreshToken")
      .populate({
        path: "channel",
        select: "name handle stats",
      });

    res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(201, { user: userData }, "Google signup successful")
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 401,
      error.message || "Google signup failed"
    );
  }
});

const githubSignup = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) throw new ApiError(400, "Authorization code is required");

  try {
    const githubUser = await getGitHubUserData(code, "signup");
    if (!githubUser.email) {
      throw new ApiError(400, "Could not retrieve email from GitHub");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: githubUser.email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // Create new user
    const user = await User.create({
      email: githubUser.email,
      username: githubUser.login,
      fullName: githubUser.name || githubUser.login,
      avatar: githubUser.avatar_url,
      authMethod: "github",
      githubId: githubUser.id,
      isVerified: true,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );
    const userData = await User.findById(user._id)
      .select("-password -refreshToken")
      .populate({
        path: "channel",
        select: "name handle stats",
      });

    res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(201, { user: userData }, "GitHub signup successful")
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 401,
      error.message || "GitHub signup failed"
    );
  }
});

// Email verification controller
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find user by verification token
  const user = await User.findOneAndUpdate(
    { verificationToken: token },
    {
      isVerified: true,
      verificationToken: undefined,
    },
    { new: true }
  );
  if (!user) {
    throw new ApiError(400, "Invalid verification token");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "Email verified successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "User doesn't exists");
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .populate({
      path: "channel",
      select: "name handle stats",
    });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    // Verify token using the centralized verifier
    const googleUser = await verifyGoogleToken(token, "login");

    // Check existing user
    let user = await User.findOne({ email: googleUser.email }).select(
      "+authMethod"
    );

    if (!user) {
      // Create new user with Google data
      user = await User.create({
        email: googleUser.email,
        username: await generateHandle(googleUser.name),
        fullName: googleUser.name,
        avatar: googleUser.picture,
        authMethod: "google",
        isVerified: true,
        googleId: googleUser.googleId,
      });
    } else if (user.authMethod !== "google") {
      throw new ApiError(
        409,
        `Account exists. Please login via ${user.authMethod}`
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // Get user with channel information
    const userWithChannel = await User.findById(user._id)
      .select("-password -refreshToken")
      .populate({
        path: "channel",
        select: "name handle stats",
      });

    // Return response with secure cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: userWithChannel,
            accessToken,
            refreshToken,
          },
          "Google login successful"
        )
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 401,
      error.message || "Google authentication failed"
    );
  }
});

/**
 * Google OAuth Callback Controller (Redirect Flow)
 */
const googleCallback = asyncHandler(async (req, res) => {
  const { code, error: googleError } = req.query;

  // Handle Google errors
  if (googleError) {
    return res.redirect(
      `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(googleError)}`
    );
  }

  if (!code) {
    return res.redirect(
      `${process.env.CLIENT_URL}/login?error=authorization_code_required`
    );
  }

  try {
    // Exchange code for tokens
    const { tokens } = await googleOAuth2Client.getToken(code);

    // Create mock request for the googleLogin handler
    const mockReq = {
      body: { token: tokens.id_token },
    };
    options.sameSite = "lax";
    const mockRes = {
      cookie: () => {},
      status: () => mockRes,
      json: (data) => {
        // On success, redirect with tokens in secure HTTP-only cookies
        return res
          .cookie("accessToken", data.data.user.accessToken, options)
          .cookie("refreshToken", data.data.user.refreshToken, options)
          .redirect(`${process.env.CLIENT_URL}/dashboard`);
      },
    };

    return await googleLogin(mockReq, mockRes);
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(
      `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(
        error.message || "google_auth_failed"
      )}`
    );
  }
});

const githubLogin = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) {
    throw new ApiError(400, "Authorization code is required");
  }

  try {
    const githubUser = await getGitHubUserData(code, "login");

    // Find or create user
    let user = await User.findOne({
      $or: [{ email: githubUser.email }, { githubId: githubUser.id }],
    });

    if (!user) {
      // Create new user
      user = await User.create({
        email: githubUser.email,
        username: githubUser.login,
        fullName: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
        authMethod: "github",
        githubId: githubUser.id,
        isVerified: true,
      });
    } else if (user.authMethod !== "github") {
      throw new ApiError(
        409,
        `Account exists. Please login via ${user.authMethod}`
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // Get user with channel information
    const userWithChannel = await User.findById(user._id)
      .select("-password -refreshToken")
      .populate({
        path: "channel",
        select: "name handle stats",
      });

    // Set cookies and redirect
    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .redirect(`${process.env.CLIENT_URL}/auth/success`);
  } catch (error) {
    console.error("GitHub login error:", error);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(
        error.message || "github_auth_failed"
      )}`
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken?._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValid = await user.isValidRefreshToken(incomingRefreshToken);

  if (!isValid) {
    throw new ApiError(403, "Refresh token doesn't match");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  user.refreshToken = newRefreshToken;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
    );
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Invalid email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(
      404,
      "If an account exists, reset instructions have been sent"
    );
  }

  const resetToken = await user.generateResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json(new ApiResponse(200, "Email sent"));
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "Email sending failed");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Token is invalid or expired"));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successfully"));
});

export {
  signupUser,
  googleSignup,
  githubSignup,
  verifyEmail,
  loginUser,
  googleLogin,
  googleCallback,
  githubLogin,
  logoutUser,
  refreshAccessToken,
  forgetPassword,
  resetPassword,
};
