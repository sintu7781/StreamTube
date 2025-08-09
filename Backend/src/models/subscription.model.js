import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1, channel: 1 }, { unique: true });

subscriptionSchema.post("save", async function (doc) {
  await mongoose.model("Channel").findByIdAndUpdate(doc.channel, {
    $inc: { "stats.subscribers": 1 },
  });
  
  // Create notification for channel owner
  try {
    const NotificationService = (await import("../services/notification.service.js")).default;
    await NotificationService.createChannelSubscriptionNotification(
      doc.user,
      doc.channel
    );
  } catch (error) {
    console.error("Error creating subscription notification:", error);
  }
});

subscriptionSchema.post("remove", async function (doc) {
  await mongoose.model("Channel").findByIdAndUpdate(doc.channel, {
    $inc: { "stats.subscribers": -1 },
  });
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
