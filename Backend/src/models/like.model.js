import mongoose from "mongoose";
import Video from "./video.model.js";
import Comment from "./comment.model.js";
import { incrementAnalytics } from "../utils/analytics.js";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    targetType: {
      type: String,
      required: [true, "Target type is required"],
      enum: {
        values: ["Video", "Comment"],
        message: "Target type must be either 'Video' or 'Comment'",
      },
      index: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target reference is required"],
      index: true,
      refPath: "targetType",
    },
    value: {
      type: Number,
      required: [true, "Like value is required"],
      enum: {
        values: [1, -1],
        message: "Like value must be either 1 (like) or -1 (dislike)",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

likeSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });

likeSchema.index({ targetType: 1, target: 1, value: 1 });

likeSchema.statics.toggleLike = async function (
  userId,
  targetType,
  targetId,
  value
) {
  const existingLike = await this.findOne({
    user: userId,
    targetType,
    target: targetId,
  });

  let operation;
  let finalLike;

  if (existingLike) {
    if (existingLike.value === value) {
      // Same like exists → remove it
      await existingLike.deleteOne();
      operation = "deleted";
      finalLike = null;

      // 🔥 Decrement analytics if video like was removed
      if (targetType === "Video") {
        const video = await mongoose.model("Video").findById(targetId);
        if (video) {
          await incrementAnalytics(video.channel, "likes", -1);
        }
      }
    } else {
      // Change like value (e.g. from dislike → like)
      existingLike.value = value;
      await existingLike.save();
      operation = "updated";
      finalLike = existingLike;

      if (targetType === "Video") {
        const video = await mongoose.model("Video").findById(targetId);
        if (video) {
          // if switching to like (+1), switching to dislike (-1)
          const incVal = value === 1 ? 1 : -1;
          await incrementAnalytics(video.channel, "likes", incVal);
        }
      }
    }
  } else {
    // Create a new like
    const newLike = await this.create({
      user: userId,
      targetType,
      target: targetId,
      value,
    });
    operation = "created";
    finalLike = newLike;

    if (targetType === "Video") {
      const video = await mongoose.model("Video").findById(targetId);
      if (video) {
        const incVal = value === 1 ? 1 : -1;
        await incrementAnalytics(video.channel, "likes", incVal);
      }
    }
  }

  return { like: finalLike, operation };
};

likeSchema.statics.getLikesCount = async function (targetType, targetId) {
  console.log(targetId, targetType);
  const result = await this.aggregate([
    {
      $match: {
        targetType,
        target: new mongoose.Types.ObjectId(targetId),
      },
    },
    {
      $group: {
        _id: "$value",
        count: { $sum: 1 },
      },
    },
  ]);

  console.log(result);

  const counts = { likes: 0, dislikes: 0 };
  result.forEach((item) => {
    if (item._id === 1) counts.likes = item.count;
    if (item._id === -1) counts.dislikes = item.count;
  });

  return counts;
};

likeSchema.statics.getUserVote = async function (userId, targetType, targetId) {
  const like = await this.findOne({
    user: userId,
    targetType,
    target: targetId,
  });
  return like ? like.value : 0;
};

likeSchema.post("save", async function (doc) {
  await updateTargetLikeCounters(doc);

  // Create notifications for likes (only for new likes, not for updates)
  if (doc.isNew && doc.value === 1) {
    try {
      const NotificationService = (
        await import("../services/notification.service.js")
      ).default;

      if (doc.targetType === "Video") {
        await NotificationService.createVideoLikeNotification(
          doc.user,
          doc.target,
          true
        );
      } else if (doc.targetType === "Comment") {
        await NotificationService.createCommentLikeNotification(
          doc.user,
          doc.target,
          true
        );
      }
    } catch (error) {
      console.error("Error creating like notification:", error);
    }
  }
});

likeSchema.post("deleteOne", { document: true }, async function (doc) {
  await updateTargetLikeCounters(doc);
});

async function updateTargetLikeCounters(like) {
  const targetModel = like.targetType === "Video" ? Video : Comment;
  const counts = await Like.getLikesCount(like.targetType, like.target);

  await targetModel.updateOne(
    { _id: like.target },
    {
      $set: {
        "metadata.likes": counts.likes,
        "metadata.dislikes": counts.dislikes,
      },
    }
  );
}

const Like = mongoose.model("Like", likeSchema);

export default Like;
