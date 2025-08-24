import { useQuery } from "@tanstack/react-query";
import { getUserSubscriptions } from "../api/subscriptions";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader } from "lucide-react";

export default function SubscriptionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: getUserSubscriptions,
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader className="animate-spin" />
      </div>
    );
  if (error)
    return <div className="text-red-500">Failed to load subscriptions</div>;

  const subscriptions = data?.data?.data || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <p className="text-gray-500">
          You haven't subscribed to any channels yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {subscriptions.map((sub) => (
            <Card key={sub._id} className="rounded-2xl shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={sub.channel?.owner?.profile || ""} />
                  <AvatarFallback>
                    {sub.channel?.name?.[0]?.toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{sub.channel?.name}</h2>
                  <p className="text-sm text-gray-500">
                    @{sub.channel?.handle}
                  </p>
                  <p className="text-xs text-gray-400">
                    {sub.channel?.stats?.subscribers || 0} subscribers
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
