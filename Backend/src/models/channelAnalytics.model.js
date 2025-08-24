import mongoose from "mongoose";

const channelAnalyticsSchema = mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    subscribers: {
      type: Number,
      default: 0,
      min: 0,
    },
    videos: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

channelAnalyticsSchema.index({ channel: 1, date: 1 }, { unique: true });

const ChannelAnalytics = mongoose.model(
  "ChannelAnalytics",
  channelAnalyticsSchema
);

export default ChannelAnalytics;
