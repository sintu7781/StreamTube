import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import "./view.model.js";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      text: true,
    },
    description: {
      type: String,
      text: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    media: {
      original: { url: String, key: String },
      encoded: [
        {
          quality: { type: String, enum: ["144p", "360p", "720p", "1080p"] },
          url: String,
          key: String,
          bitrate: Number,
        },
      ],
      duration: Number,
      aspectRatio: String,
    },
    thumbnail: {
      url: String,
      key: String,
    },
    metadata: {
      views: { type: Number, default: 0, min: 0 },
      uniqueViews: { type: Number, default: 0, min: 0 },
      likes: { type: Number, default: 0, min: 0 },
      dislikes: { type: Number, default: 0, min: 0 },
      comments: { type: Number, default: 0, min: 0 },
    },
    tags: {
      type: [String],
      index: true,
    },
    deletedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

// Indexes
videoSchema.index({ title: "text", description: "text", tags: "text" });
videoSchema.index({ "metadata.views": -1 });
videoSchema.index({ channel: 1, createdAt: -1 });
videoSchema.index({ "metadata.viewSessions.userId": 1 });
videoSchema.index({ "metadata.viewSessions.sessionId": 1 });
videoSchema.index({ "metadata.viewSessions.ipAddress": 1 });

videoSchema.methods.incrementViews = async function ({
  userId = null,
  sessionId = null,
  ipAddress = null,
  userAgent = null,
  duration = 0,
  watchedPercentage = 0,
}) {
  const View = mongoose.model("View");

  const existing = await View.findOne({
    video: this._id,
    $or: [userId, sessionId].filter(Boolean),
  });

  if (!existing) {
    // New unique view
    await View.create({
      video: this._id,
      userId,
      sessionId,
      ipAddress,
      userAgent,
      duration,
      watchedPercentage,
    });
    this.metadata.uniqueViews += 1;
  } else {
    existing.duration += duration;
    existing.watchedPercentage = Math.max(
      existing.watchedPercentage,
      watchedPercentage
    );
    existing.timestamp = new Date();
    await existing.save();
  }

  // Always increment total views
  this.metadata.views += 1;

  await this.save();

  // Update channel stats in background
  this.updateChannelStats(!existing);

  return {
    views: this.metadata.views,
    uniqueViews: this.metadata.uniqueViews,
  };
};

// Background channel stats update
videoSchema.methods.updateChannelStats = async function (isUnique) {
  try {
    await mongoose.model("Channel").findByIdAndUpdate(
      this.channel,
      {
        $inc: {
          "stats.views": 1,
          ...(isUnique ? { "stats.uniqueViews": 1 } : {}),
        },
      },
      { new: true }
    );
  } catch (err) {
    console.error("Channel stats update error:", err);
  }
};

// Hooks
videoSchema.post("save", async function (doc) {
  // Create notifications for subscribers on new video upload
  if (doc.isNew && doc.visibility === "public") {
    try {
      const NotificationService = (
        await import("../services/notification.service.js")
      ).default;
      await NotificationService.createVideoUploadNotifications(doc._id);
    } catch (error) {
      console.error("Error creating video upload notifications:", error);
    }
  }
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
