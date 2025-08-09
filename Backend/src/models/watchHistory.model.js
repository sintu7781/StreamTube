import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    watchDuration: {
      type: Number, // in seconds
      default: 0,
    },
    watchPercentage: {
      type: Number, // 0-100
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      deviceType: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "tv"],
        default: "desktop",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes
watchHistorySchema.index({ user: 1, video: 1 }, { unique: true });
watchHistorySchema.index({ user: 1, watchedAt: -1 });
watchHistorySchema.index({ video: 1, watchedAt: -1 });

// Static methods
watchHistorySchema.statics.addOrUpdateWatchHistory = async function(
  userId,
  videoId,
  watchData = {}
) {
  const {
    watchDuration = 0,
    watchPercentage = 0,
    completed = false,
    deviceInfo = {},
  } = watchData;

  try {
    const existingHistory = await this.findOne({
      user: userId,
      video: videoId,
    });

    if (existingHistory) {
      // Update existing history
      existingHistory.watchedAt = new Date();
      existingHistory.watchDuration = Math.max(
        existingHistory.watchDuration,
        watchDuration
      );
      existingHistory.watchPercentage = Math.max(
        existingHistory.watchPercentage,
        watchPercentage
      );
      existingHistory.completed = completed || existingHistory.completed;
      if (Object.keys(deviceInfo).length > 0) {
        existingHistory.deviceInfo = { ...existingHistory.deviceInfo, ...deviceInfo };
      }

      await existingHistory.save();
      return existingHistory;
    } else {
      // Create new history entry
      const newHistory = await this.create({
        user: userId,
        video: videoId,
        watchDuration,
        watchPercentage,
        completed,
        deviceInfo,
      });

      return newHistory;
    }
  } catch (error) {
    console.error("Error updating watch history:", error);
    throw error;
  }
};

watchHistorySchema.statics.getUserWatchHistory = async function(
  userId,
  options = {}
) {
  const {
    page = 1,
    limit = 20,
    sortBy = "watchedAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const history = await this.find({ user: userId })
    .populate({
      path: "video",
      select: "title description thumbnail media duration visibility tags createdAt",
      populate: {
        path: "channel",
        select: "name handle",
        populate: {
          path: "owner",
          select: "profile",
        },
      },
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await this.countDocuments({ user: userId });

  return {
    history,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNextPage: skip + history.length < total,
      hasPrevPage: page > 1,
    },
  };
};

watchHistorySchema.statics.clearUserHistory = async function(userId) {
  return await this.deleteMany({ user: userId });
};

watchHistorySchema.statics.removeFromHistory = async function(userId, videoId) {
  return await this.deleteOne({ user: userId, video: videoId });
};

const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);

export default WatchHistory;
