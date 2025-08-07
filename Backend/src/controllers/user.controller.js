import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import validator from "validator";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id).select("+password");

  const isCorrectPassword = await user.isPasswordCorrect(oldPassword);

  if (!isCorrectPassword) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfuly"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const updates = {};

  if (email) {
    if (!validator.isEmail(email)) {
      throw new ApiError(400, "please provide valid email");
    }

    if (email !== req.user.email) {
      const emailExists = await User.exists({ email });
      if (emailExists) {
        throw new ApiError(400, "Email alredy exists");
      }
      updates.email = email.toLowerCase();
    }
  }

  if (name) {
    if (name.length < 2 || name.length > 50) {
      throw new ApiError(400, "Name must be between 2-50 characters");
    }
    updates["profile.name"] = name;
  }

  if (req.file) {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(
      avatarLocalPath,
      "image",
      "avatars"
    );

    if (!avatar.secure_url) {
      throw new ApiError(500, "Error while uploading avatar");
    }

    updates["profile.picture"] = avatar.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Account update successfuly"));
});

export { changeCurrentPassword, getCurrentUser, updateAccountDetails };
