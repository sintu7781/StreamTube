import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification recipient is required"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification sender is required"],
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: {
        values: [
          // Subscription related
          "CHANNEL_SUBSCRIPTION",

          // Video related
          "VIDEO_UPLOAD",
          "VIDEO_LIKE",
          "VIDEO_DISLIKE",

          // Comment related
          "VIDEO_COMMENT",
          "COMMENT_REPLY",
          "COMMENT_LIKE",
          "COMMENT_DISLIKE",
          "COMMENT_MENTION",

          // Channel related
          "CHANNEL_MILESTONE",
          "CHANNEL_UPDATE",

          // System related
          "SYSTEM_ANNOUNCEMENT",
          "ACCOUNT_UPDATE",
        ],
        message: "Invalid notification type",
      },
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    data: {
      // Additional data specific to notification type
      video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
      channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
      comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
      // Generic data for custom notifications
      customData: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
      index: true,
    },
    deliveryMethods: [
      {
        type: String,
        enum: ["in_app", "email", "push"],
        default: ["in_app"],
      },
    ],
    deliveryStatus: {
      inApp: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
      },
      email: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
        emailId: String,
      },
      push: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
        pushId: String,
      },
    },
    readAt: Date,
    actionUrl: String, // URL to navigate when notification is clicked
    expiresAt: {
      type: Date,
    },
    metadata: {
      // For analytics and tracking
      source: String,
      campaign: String,
      version: String,
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
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is recent (within 24 hours)
notificationSchema.virtual("isRecent").get(function () {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > dayAgo;
});

// Virtual for time since created
notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
});

// Static methods
notificationSchema.statics.createNotification = async function (
  notificationData
) {
  try {
    // Check if a similar notification already exists (prevent spam)
    const existingSimilar = await this.findOne({
      recipient: notificationData.recipient,
      sender: notificationData.sender,
      type: notificationData.type,
      "data.video": notificationData.data?.video,
      "data.comment": notificationData.data?.comment,
      createdAt: { $gte: new Date(Date.now() - 60000) }, // Within last minute
    });

    if (existingSimilar) {
      return existingSimilar; // Don't create duplicate notification
    }

    const notification = await this.create(notificationData);

    // Populate the notification for return
    await notification.populate([
      { path: "sender", select: "username profile.name profile.picture" },
      { path: "data.channel", select: "name handle avatar" },
      { path: "data.video", select: "title thumbnail" },
    ]);

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get notifications for a user with pagination
notificationSchema.statics.getUserNotifications = async function (
  userId,
  { page = 1, limit = 20, status = null, type = null } = {}
) {
  const query = { recipient: userId };

  if (status) query.status = status;
  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        { path: "sender", select: "username profile.name profile.picture" },
        { path: "data.channel", select: "name handle avatar" },
        { path: "data.video", select: "title thumbnail" },
        { path: "data.comment", select: "content" },
      ])
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    notifications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total,
      hasNext: skip + notifications.length < total,
      hasPrev: page > 1,
    },
  };
};

// Mark notifications as read
notificationSchema.statics.markAsRead = async function (
  userId,
  notificationIds = null
) {
  const query = { recipient: userId, status: "unread" };

  if (notificationIds) {
    query._id = { $in: notificationIds };
  }

  const result = await this.updateMany(query, {
    $set: {
      status: "read",
      readAt: new Date(),
    },
  });

  return result;
};

// Get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ recipient: userId, status: "unread" });
};

// Clean up old notifications (can be run as a cron job)
notificationSchema.statics.cleanupOldNotifications = async function (
  daysOld = 30
) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: cutoffDate } });
};

// Instance methods
notificationSchema.methods.markAsRead = async function () {
  this.status = "read";
  this.readAt = new Date();
  return this.save();
};

// Pre-save middleware to set expiration
notificationSchema.pre("save", function (next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to 30 days from now
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
