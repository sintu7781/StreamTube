import mongoose from "mongoose";

const ChannelAnalytics = mongoose.model("ChannelAnalytics");

export const incrementAnalytics = async (channelId, field, value = 1) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await ChannelAnalytics.findOneAndUpdate(
      { channel: channelId, date: today },
      { $inc: { [field]: value } },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Analytics update error:", err);
  }
};
