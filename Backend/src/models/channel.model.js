import mongoose from "mongoose";
import validator from "validator";
import { generateHandle } from "../utils/handleGenerator.js";
import ChannelAnalytics from "./channelAnalytics.model.js";
import User from "./user.model.js";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      minlength: [3, "Channel name must be at least 3 characters"],
      maxlength: [50, "Channel name cannot exceed 50 characters"],
      text: true,
      validate: {
        validator: function (v) {
          return !validator.contains(v, "  ") && !/[<>]/.test(v);
        },
        message: "Channel name contains invalid characters",
      },
    },
    handle: {
      type: String,
      required: true,
      immutable: true,
      validate: {
        validator: function (v) {
          return /^[a-z0-9_]{3,30}$/.test(v) && !validator.isNumeric(v);
        },
        message: "Handle must be 3-30 chars (letters, numbers, _)",
      },
      default: function () {
        return generateHandle(this.name);
      },
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      text: true,
      validate: {
        validator: function (v) {
          return validator.isLength(v, { max: 2000 }) && !/[<>]/.test(v);
        },
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Channel owner is required"],
      index: true,
      immutable: true,
    },
    stats: {
      subscribers: {
        type: Number,
        default: 0,
        min: 0,
      },
      views: {
        type: Number,
        default: 0,
        min: 0,
      },
      videos: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    avatar: {
      url: String,
      key: String, // Cloudinary public_id for deletion
    },
    deletedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

channelSchema.index({ name: "text", description: "text" });

channelSchema.index(
  { handle: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  }
);
channelSchema.index({ "stats.subscribers": -1 });
channelSchema.index({ "stats.views": -1 });
channelSchema.index({ owner: 1, createdAt: -1 });

channelSchema.virtual("url").get(function () {
  return `/c/${this.handle}`;
});

// Remove the old virtual avatar since we now have a real field
// channelSchema.virtual("avatar").get(function () {
//   return this.owner?.avatar || null;
// });

channelSchema.pre("save", async function (next) {
  if (!this.isModified("handle") && this.isNew) {
    this.handle = generateHandle(this.name);
  }
  next();
});

channelSchema.post("save", async function (doc) {
  await User.findByIdAndUpdate(doc.owner, { channel: doc._id }, { new: true });

  await ChannelAnalytics.create({
    channel: doc._id,
    date: new Date(),
  });
});

channelSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null }); // Soft delete filter
  next();
});

channelSchema.statics.incrementStats = async function (
  channelId,
  field,
  value = 1
) {
  return this.findByIdAndUpdate(
    channelId,
    { $inc: { [`stats.${field}`]: value } },
    { new: true }
  );
};

channelSchema.post("remove", async function (doc) {
  // Remove channel from all users
  await mongoose.model("User").updateMany(
    {
      $or: [{ ownedChannels: doc._id }, { "managedChannels.channel": doc._id }],
    },
    {
      $pull: {
        ownedChannels: doc._id,
        managedChannels: { channel: doc._id },
      },
    }
  );
});

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
