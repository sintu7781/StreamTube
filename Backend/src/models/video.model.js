import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
      viewSessions: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          sessionId: String,
          ipAddress: String,
          userAgent: String,
          timestamp: { type: Date, default: Date.now },
          duration: Number,
          watchedPercentage: Number,
        },
      ],
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
videoSchema.index({ "metrics.views": -1 });
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
  const ViewSession = this.metadata.viewSessions;
  const sessionThreshold = 30 * 60 * 1000; // 30 minutes

  // Check for existing session
  const existingSession = ViewSession.find(
    (session) =>
      (userId && session.userId?.equals(userId)) ||
      (sessionId && session.sessionId === sessionId) ||
      (ipAddress && session.ipAddress === ipAddress)
  );

  if (!existingSession) {
    // New unique view
    this.metadata.uniqueViews += 1;

    // Add new view session
    ViewSession.push({
      userId,
      sessionId,
      ipAddress,
      userAgent,
      duration,
      watchedPercentage,
    });
  } else {
    // Update existing session
    existingSession.duration += duration;
    existingSession.watchedPercentage = Math.max(
      existingSession.watchedPercentage,
      watchedPercentage
    );
    existingSession.timestamp = new Date();
  }

  // Always increment total views
  this.metadata.views += 1;

  await this.save();

  // Update channel stats in background
  this.updateChannelStats();

  return {
    views: this.metadata.views,
    uniqueViews: this.metadata.uniqueViews,
  };
};

// Background channel stats update
videoSchema.methods.updateChannelStats = async function () {
  try {
    await mongoose.model("Channel").findByIdAndUpdate(
      this.channel,
      {
        $inc: {
          "stats.views": 1,
          "stats.uniqueViews": this.metadata.viewSessions.length,
        },
      },
      { new: true }
    );
  } catch (err) {
    console.error("Channel stats update error:", err);
    // Implement your error reporting here
  }
};

// Hooks
videoSchema.post("save", async function (doc) {
  // Update channel's video count
  await mongoose.model("Channel").findByIdAndUpdate(doc.channel, {
    $inc: { "stats.videos": 1 },
  });
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
