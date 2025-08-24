import { useEffect, useState } from "react";
import {
  getAnalyticsOverview,
  getChannelAnalytics,
  getAudienceDemographics,
} from "../api/channelAnalytics";
import StatsCard from "../components/analytics/StatsCard";
import OverviewCharts from "../components/analytics/OverviewCharts";
import TopVideosTable from "../components/analytics/TopVideosTable";
import AudienceDemographics from "../components/analytics/AudienceDemographics";
import TrendsSection from "../components/analytics/TrendsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Video, Heart, MessageSquare, BarChart3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChannelAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [demographics, setDemographics] = useState(null);
  const { user } = useAuth();

  const channelId = user.channel._id;

  useEffect(() => {
    (async () => {
      const o = await getAnalyticsOverview(channelId);
      console.log(`Overview: ${o}`);
      setOverview(o);

      const a = await getChannelAnalytics(channelId, { days: 30 });
      console.log(`Analytics: ${a}`);
      setAnalytics(a.recentData || []);

      const d = await getAudienceDemographics(channelId);
      console.log(`Demographics: ${d}`);
      setDemographics(d.audience || {});
    })();
  }, [channelId]);

  if (!overview || !demographics) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Views"
          value={overview?.overview?.views ?? 0}
          icon={BarChart3}
          trend={overview?.trends?.viewsGrowth ?? 0}
        />
        <StatsCard
          title="Subscribers"
          value={overview?.overview?.subscribers ?? 0}
          icon={Users}
          trend={overview?.trends?.subscribersGrowth ?? 0}
        />
        <StatsCard
          title="Videos"
          value={overview?.overview?.videos ?? 0}
          icon={Video}
        />
        <StatsCard
          title="Likes"
          value={overview?.overview?.likes ?? 0}
          icon={Heart}
          trend={overview?.trends?.likesGrowth ?? 0}
        />
        <StatsCard
          title="Comments"
          value={overview?.overview?.comments ?? 0}
          icon={MessageSquare}
          trend={overview?.trends?.commentsGrowth ?? 0}
        />
      </div>

      {/* Tabs for sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewCharts data={analytics} />
          <div className="mt-6">
            <TopVideosTable videos={overview.topVideos || []} />
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <TrendsSection trends={overview.trends} />
        </TabsContent>

        <TabsContent value="audience">
          <AudienceDemographics demographics={demographics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
