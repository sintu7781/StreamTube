import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Channel from "../models/channel.model.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import Subscription from "../models/subscription.model.js";

class NotificationService {
  // Channel subscription notification
  static async createChannelSubscriptionNotification(subscriberId, channelId) {
    try {
      const channel = await Channel.findById(channelId).populate('owner');
      if (!channel) return null;

      const subscriber = await User.findById(subscriberId);
      if (!subscriber) return null;

      // Don't notify if user subscribes to their own channel
      if (channel.owner._id.equals(subscriberId)) return null;

      return await Notification.createNotification({
        recipient: channel.owner._id,
        sender: subscriberId,
        type: "CHANNEL_SUBSCRIPTION",
        title: "New Subscriber!",
        message: `${subscriber.profile?.name || subscriber.username} subscribed to your channel`,
        data: {
          channel: channelId,
        },
        actionUrl: `/c/${channel.handle}`,
        priority: "normal",
      });
    } catch (error) {
      console.error("Error creating subscription notification:", error);
    }
  }

  // Video upload notification to subscribers
  static async createVideoUploadNotifications(videoId) {
    try {
      const video = await Video.findById(videoId).populate('channel');
      if (!video || !video.channel) return;

      // Get all subscribers of the channel
      const subscribers = await Subscription.find({ channel: video.channel._id });
      
      const notifications = subscribers.map(subscription => ({
        recipient: subscription.user,
        sender: video.channel.owner,
        type: "VIDEO_UPLOAD",
        title: "New Video Upload",
        message: `${video.channel.name} uploaded: ${video.title}`,
        data: {
          video: videoId,
          channel: video.channel._id,
        },
        actionUrl: `/watch/${videoId}`,
        priority: "normal",
      }));

      // Create notifications in batch
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications.length;
    } catch (error) {
      console.error("Error creating video upload notifications:", error);
    }
  }

  // Video like notification
  static async createVideoLikeNotification(userId, videoId, isLike = true) {
    try {
      const video = await Video.findById(videoId).populate({
        path: 'channel',
        populate: { path: 'owner' }
      });
      
      if (!video || !video.channel?.owner) return null;

      const user = await User.findById(userId);
      if (!user) return null;

      // Don't notify if user likes their own video
      if (video.channel.owner._id.equals(userId)) return null;

      return await Notification.createNotification({
        recipient: video.channel.owner._id,
        sender: userId,
        type: isLike ? "VIDEO_LIKE" : "VIDEO_DISLIKE",
        title: isLike ? "Video Liked!" : "Video Feedback",
        message: `${user.profile?.name || user.username} ${isLike ? 'liked' : 'disliked'} your video: ${video.title}`,
        data: {
          video: videoId,
          channel: video.channel._id,
        },
        actionUrl: `/watch/${videoId}`,
        priority: "low",
      });
    } catch (error) {
      console.error("Error creating video like notification:", error);
    }
  }

  // Video comment notification
  static async createVideoCommentNotification(userId, videoId, commentId) {
    try {
      const [video, comment, user] = await Promise.all([
        Video.findById(videoId).populate({
          path: 'channel',
          populate: { path: 'owner' }
        }),
        Comment.findById(commentId),
        User.findById(userId)
      ]);

      if (!video || !video.channel?.owner || !comment || !user) return null;

      // Don't notify if user comments on their own video
      if (video.channel.owner._id.equals(userId)) return null;

      return await Notification.createNotification({
        recipient: video.channel.owner._id,
        sender: userId,
        type: "VIDEO_COMMENT",
        title: "New Comment",
        message: `${user.profile?.name || user.username} commented on your video: ${video.title}`,
        data: {
          video: videoId,
          comment: commentId,
          channel: video.channel._id,
        },
        actionUrl: `/watch/${videoId}?comment=${commentId}`,
        priority: "normal",
      });
    } catch (error) {
      console.error("Error creating video comment notification:", error);
    }
  }

  // Comment reply notification
  static async createCommentReplyNotification(userId, parentCommentId, replyId) {
    try {
      const [parentComment, reply, user] = await Promise.all([
        Comment.findById(parentCommentId).populate('user video'),
        Comment.findById(replyId),
        User.findById(userId)
      ]);

      if (!parentComment || !reply || !user) return null;

      // Don't notify if user replies to their own comment
      if (parentComment.user._id.equals(userId)) return null;

      return await Notification.createNotification({
        recipient: parentComment.user._id,
        sender: userId,
        type: "COMMENT_REPLY",
        title: "Comment Reply",
        message: `${user.profile?.name || user.username} replied to your comment`,
        data: {
          video: parentComment.video,
          comment: replyId,
        },
        actionUrl: `/watch/${parentComment.video}?comment=${replyId}`,
        priority: "normal",
      });
    } catch (error) {
      console.error("Error creating comment reply notification:", error);
    }
  }

  // Comment like notification
  static async createCommentLikeNotification(userId, commentId, isLike = true) {
    try {
      const [comment, user] = await Promise.all([
        Comment.findById(commentId).populate('user video'),
        User.findById(userId)
      ]);

      if (!comment || !user) return null;

      // Don't notify if user likes their own comment
      if (comment.user._id.equals(userId)) return null;

      return await Notification.createNotification({
        recipient: comment.user._id,
        sender: userId,
        type: isLike ? "COMMENT_LIKE" : "COMMENT_DISLIKE",
        title: isLike ? "Comment Liked!" : "Comment Feedback",
        message: `${user.profile?.name || user.username} ${isLike ? 'liked' : 'disliked'} your comment`,
        data: {
          video: comment.video,
          comment: commentId,
        },
        actionUrl: `/watch/${comment.video}?comment=${commentId}`,
        priority: "low",
      });
    } catch (error) {
      console.error("Error creating comment like notification:", error);
    }
  }

  // Channel milestone notification
  static async createChannelMilestoneNotification(channelId, milestone, currentCount) {
    try {
      const channel = await Channel.findById(channelId).populate('owner');
      if (!channel) return null;

      return await Notification.createNotification({
        recipient: channel.owner._id,
        sender: channel.owner._id, // Self notification
        type: "CHANNEL_MILESTONE",
        title: "Channel Milestone!",
        message: `Congratulations! Your channel reached ${currentCount} ${milestone}`,
        data: {
          channel: channelId,
          customData: { milestone, count: currentCount },
        },
        actionUrl: `/c/${channel.handle}`,
        priority: "high",
      });
    } catch (error) {
      console.error("Error creating milestone notification:", error);
    }
  }

  // System announcement notification
  static async createSystemNotification(userIds, title, message, actionUrl = null) {
    try {
      const notifications = userIds.map(userId => ({
        recipient: userId,
        sender: userId, // System notifications use recipient as sender
        type: "SYSTEM_ANNOUNCEMENT",
        title,
        message,
        actionUrl,
        priority: "high",
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications.length;
    } catch (error) {
      console.error("Error creating system notifications:", error);
    }
  }

  // Notification for comment mentions (@username)
  static async createCommentMentionNotifications(userId, commentId, mentionedUsernames) {
    try {
      if (!mentionedUsernames || mentionedUsernames.length === 0) return [];

      const [comment, user, mentionedUsers] = await Promise.all([
        Comment.findById(commentId).populate('video'),
        User.findById(userId),
        User.find({ username: { $in: mentionedUsernames } })
      ]);

      if (!comment || !user || mentionedUsers.length === 0) return [];

      const notifications = mentionedUsers
        .filter(mentionedUser => !mentionedUser._id.equals(userId)) // Don't mention yourself
        .map(mentionedUser => ({
          recipient: mentionedUser._id,
          sender: userId,
          type: "COMMENT_MENTION",
          title: "You were mentioned!",
          message: `${user.profile?.name || user.username} mentioned you in a comment`,
          data: {
            video: comment.video,
            comment: commentId,
          },
          actionUrl: `/watch/${comment.video}?comment=${commentId}`,
          priority: "normal",
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications;
    } catch (error) {
      console.error("Error creating mention notifications:", error);
      return [];
    }
  }

  // Helper method to check for mentions in text
  static extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]); // Extract username without @
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  // Get user's notification preferences (can be extended to include user preferences)
  static async getUserNotificationPreferences(userId) {
    // This could be expanded to check user settings for notification preferences
    return {
      videoUploads: true,
      comments: true,
      likes: true,
      subscriptions: true,
      mentions: true,
      milestones: true,
      systemAnnouncements: true,
    };
  }

  // Bulk mark notifications as read
  static async markNotificationsAsRead(userId, notificationIds) {
    try {
      return await Notification.markAsRead(userId, notificationIds);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId) {
    try {
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }
}

export default NotificationService;
