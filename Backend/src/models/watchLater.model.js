import mongoose from "mongoose";

const watchLaterSchema = new mongoose.Schema(
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
    addedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    position: {
      type: Number,
      default: 0, // For playlist ordering
    },
    notes: {
      type: String,
      maxlength: 500, // Optional notes for the user
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicates
watchLaterSchema.index({ user: 1, video: 1 }, { unique: true });

// Index for efficient sorting by addedAt
watchLaterSchema.index({ user: 1, addedAt: -1 });

// Static method to add video to watch later
watchLaterSchema.statics.addToWatchLater = async function (userId, videoId, notes = "") {
  try {
    // Check if already exists
    const existing = await this.findOne({ user: userId, video: videoId });
    if (existing) {
      return { success: false, message: "Video already in watch later list" };
    }

    // Get the highest position for ordering
    const lastItem = await this.findOne({ user: userId }).sort({ position: -1 });
    const nextPosition = lastItem ? lastItem.position + 1 : 0;

    const watchLaterItem = await this.create({
      user: userId,
      video: videoId,
      notes,
      position: nextPosition,
    });

    return { success: true, data: watchLaterItem };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Static method to remove video from watch later
watchLaterSchema.statics.removeFromWatchLater = async function (userId, videoId) {
  try {
    const removed = await this.findOneAndDelete({ user: userId, video: videoId });
    if (!removed) {
      return { success: false, message: "Video not found in watch later list" };
    }

    // Reorder positions after removal
    await this.updateMany(
      { user: userId, position: { $gt: removed.position } },
      { $inc: { position: -1 } }
    );

    return { success: true, message: "Video removed from watch later" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Static method to check if video is in watch later
watchLaterSchema.statics.isInWatchLater = async function (userId, videoId) {
  try {
    const exists = await this.findOne({ user: userId, video: videoId });
    return !!exists;
  } catch (error) {
    return false;
  }
};

// Static method to get user's watch later list with pagination
watchLaterSchema.statics.getUserWatchLater = async function (
  userId, 
  page = 1, 
  limit = 20, 
  sortBy = "addedAt", 
  sortOrder = "desc"
) {
  try {
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const watchLaterItems = await this.find({ user: userId })
      .populate({
        path: "video",
        populate: {
          path: "channel",
          select: "name handle stats",
          populate: {
            path: "owner",
            select: "profile",
          },
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out items where video might be null (deleted videos)
    const validItems = watchLaterItems.filter(item => item.video !== null);

    const totalCount = await this.countDocuments({ user: userId });

    return {
      success: true,
      data: {
        videos: validItems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalVideos: totalCount,
          hasNextPage: skip + validItems.length < totalCount,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Static method to reorder watch later list
watchLaterSchema.statics.reorderWatchLater = async function (userId, videoIds) {
  try {
    const bulkOps = videoIds.map((videoId, index) => ({
      updateOne: {
        filter: { user: userId, video: videoId },
        update: { position: index },
      },
    }));

    await this.bulkWrite(bulkOps);
    return { success: true, message: "Watch later list reordered successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Static method to clear all watch later items for a user
watchLaterSchema.statics.clearWatchLater = async function (userId) {
  try {
    const result = await this.deleteMany({ user: userId });
    return { 
      success: true, 
      message: `Removed ${result.deletedCount} videos from watch later` 
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Static method to get watch later stats
watchLaterSchema.statics.getWatchLaterStats = async function (userId) {
  try {
    const stats = await this.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoData",
        },
      },
      { $unwind: "$videoData" },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalDuration: { $sum: "$videoData.media.duration" },
          oldestVideo: { $min: "$addedAt" },
          newestVideo: { $max: "$addedAt" },
        },
      },
    ]);

    return {
      success: true,
      data: stats[0] || {
        totalVideos: 0,
        totalDuration: 0,
        oldestVideo: null,
        newestVideo: null,
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Pre-remove middleware to clean up orphaned records
watchLaterSchema.pre("remove", { document: true, query: false }, async function () {
  // Reorder positions after removal
  await this.constructor.updateMany(
    { user: this.user, position: { $gt: this.position } },
    { $inc: { position: -1 } }
  );
});

const WatchLater = mongoose.model("WatchLater", watchLaterSchema);

export default WatchLater;
