import mongoose from "mongoose";
import Video from "./video.model.js";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content must be at least 1 character long"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
      validate: {
        validator: function (v) {
          return v.trim().length > 0;
        },
        message: "Content cannot be empty",
      },
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: [true, "Video reference is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletionReason: {
      type: String,
      enum: ["user", "moderator", "system", "spam", "abuse", "other"],
      default: null,
    },
    metadata: {
      likes: {
        type: Number,
        default: 0,
        min: 0,
      },
      dislikes: {
        type: Number,
        default: 0,
        min: 0,
      },
      flags: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    language: {
      type: String,
      default: "en",
      maxlength: 10,
    },
    sentimentScore: {
      type: Number,
      default: 0,
      min: -1,
      max: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletionReason;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletionReason;
        return ret;
      },
    },
    collation: { locale: "en", strength: 2 }, // Case-insensitive indexing
  }
);

commentSchema.index({ video: 1, createdAt: -1 });

commentSchema.index({ user: 1, createdAt: -1 });

commentSchema.index({ parentComment: 1, createdAt: 1 });

commentSchema.index({ isPinned: -1, createdAt: -1 });

commentSchema.index({ "metadata.likes": -1 });

commentSchema.index({ content: "text" });

commentSchema.virtual("repliesCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  count: true,
});

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  match: { isDeleted: false },
});

commentSchema.query.nonDeleted = function () {
  return this.where({ isDeleted: false });
};

commentSchema.query.deleted = function () {
  return this.where({ isDeleted: true });
};

commentSchema.statics.findByVideo = function (
  videoId,
  page = 1,
  limit = 10,
  includeReplies = false
) {
  const query = {
    video: videoId,
    isDeleted: false,
  };

  if (!includeReplies) {
    query.parentComment = null;
  }

  return this.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "username profile fullName")
    .lean();
};

commentSchema.statics.getCommentCountByVideo = async function (videoId) {
  return this.countDocuments({
    video: videoId,
    isDeleted: false,
    parentComment: null,
  });
};

commentSchema.statics.getTotalCommentCount = async function (
  videoId,
  includeReplies = false
) {
  const query = {
    video: videoId,
    isDeleted: false,
  };

  if (!includeReplies) {
    query.parentComment = null;
  }

  return this.countDocuments(query);
};

commentSchema.statics.getRepliesCount = async function (commentId) {
  return this.countDocuments({
    parentComment: commentId,
    isDeleted: false,
  });
};

commentSchema.methods.softDelete = async function (reason = "user") {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletionReason = reason;
  return this.save();
};

commentSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletionReason = null;
  return this.save();
};

commentSchema.post("save", async function (doc) {
  await updateTargetCommentCounter(doc);
  
  // Create notifications for new comments
  if (doc.isNew && !doc.isDeleted) {
    try {
      const NotificationService = (await import("../services/notification.service.js")).default;
      
      if (doc.parentComment) {
        // This is a reply to another comment
        await NotificationService.createCommentReplyNotification(doc.user, doc.parentComment, doc._id);
      } else {
        // This is a comment on a video
        await NotificationService.createVideoCommentNotification(doc.user, doc.video, doc._id);
      }
      
      // Check for mentions in the comment and create notifications
      const mentions = NotificationService.extractMentions(doc.content);
      if (mentions.length > 0) {
        await NotificationService.createCommentMentionNotifications(doc.user, doc._id, mentions);
      }
    } catch (error) {
      console.error("Error creating comment notifications:", error);
    }
  }
});

async function updateTargetCommentCounter(comment) {
  const counts = await Comment.getTotalCommentCount(comment.video, true);

  await Video.updateOne(
    { _id: comment.video },
    {
      $set: {
        "metadata.comments": counts,
      },
    }
  );
}

commentSchema.pre("save", async function (next) {
  if (this.isModified("isDeleted") && this.isDeleted) {
    await this.model("Comment").updateMany(
      { parentComment: this._id },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletionReason: "cascade",
        },
      }
    );
  }
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
