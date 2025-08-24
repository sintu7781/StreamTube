import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  checkSubscriptionStatus,
  toggleSubscription,
} from "../../api/subscriptions";

const SubscribeButton = ({ channelId }) => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return; // don't check if not logged in
    const loadStatus = async () => {
      try {
        const res = await checkSubscriptionStatus(channelId);
        setSubscribed(res.data.subscribed);
      } catch (err) {
        console.error("Failed to check subscription status:", err);
      }
    };
    loadStatus();
  }, [channelId, user]);

  const handleToggle = async () => {
    if (!user) {
      alert("Please login to subscribe!");
      return;
    }

    setLoading(true);
    try {
      const res = await toggleSubscription(channelId);
      setSubscribed(res.data.subscribed);
    } catch (err) {
      console.error("Error toggling subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`ml-4 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        subscribed
          ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
          : "bg-red-600 text-white hover:bg-red-700"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "..." : subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
};

export default SubscribeButton;
