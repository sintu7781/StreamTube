import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_]+$/.test(v);
        },
        message: "Username can only contain letters, numbers and underscores",
      },
    },
    password: {
      type: String,
      select: false,
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(v);
        },
        message:
          "Password must contain at least one uppercase, lowercase, and number",
      },
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },
    profile: {
      name: {
        type: String,
        trim: true,
        maxlength: [50, "Name cannot exceed 50 characters"],
      },
      picture: { type: String },
    },
    roles: {
      type: [String],
      enum: {
        values: ["user", "creator", "admin"],
        message: "Role must be either user, creator, or admin",
      },
      default: ["user"],
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
      unique: true,
    },
    authMethod: {
      type: String,
      enum: ["email", "google", "github"],
      default: "email",
      required: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      select: false,
      unique: true,
      sparse: true,
    },
    githubId: {
      type: String,
      select: false,
      unique: true,
      sparse: true,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationExpires: {
      type: Date,
      select: false,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    resetPasswordToken: {
      type: String,
      index: true,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.verificationToken;
        delete ret.verificationExpires;
        delete ret.googleId;
        delete ret.githubId;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.verificationToken;
        delete ret.verificationExpires;
        delete ret.googleId;
        delete ret.githubId;
        return ret;
      },
    },
  }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  }
);

userSchema.index(
  { username: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 }, // Case-insensitive
  }
);

userSchema.index({ "profile.name": "text" });

userSchema.virtual("displayName").get(function () {
  return this.fullName || this.profile.name || this.email.split("@")[0];
});

userSchema.virtual("avatar").get(function () {
  return this.profile?.picture || null;
});

userSchema.methods.generateVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({ googleId });
};

// Static method to find by GitHub ID
userSchema.statics.findByGitHubId = function (githubId) {
  return this.findOne({ githubId });
};

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isValidRefreshToken = async function (
  candidateRefreshToken
) {
  return await bcrypt.compare(candidateRefreshToken, this.refreshToken);
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified("refreshToken") && this.refreshToken) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.refreshToken = await bcrypt.hash(this.refreshToken, salt);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      name: this.fullName || this.profile.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
