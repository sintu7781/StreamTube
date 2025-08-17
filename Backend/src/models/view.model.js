import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    duration: {
      type: Number,
      default: 0,
    },
    watchedPercentage: {
      type: Number,
      default: 0,
    },
    timestamps: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

viewSchema.index({ video: 1, userId: 1 });
viewSchema.index({ video: 1, sessionId: 1 });

const View = mongoose.model("View", viewSchema);

export default View;
