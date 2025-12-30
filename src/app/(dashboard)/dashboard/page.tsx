import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { RecentFeedback } from "@/components/dashboard/recent-feedback";
import { EventOverview } from "@/components/dashboard/event-overview";

async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Should be handled by middleware or redirect
    return {
      totalEvents: 0,
      totalFeedback: 0,
      topEvents: [],
      recentFeedback: [],
    };
  }

  // Get stats
  const [eventsCount, feedbackCount, analytics, recentFeedback] =
    await Promise.all([
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id),
      supabase.from("feedback").select("*", { count: "exact", head: true }),
      supabase
        .from("feedback_analytics")
        .select("*")
        .order("avg_rating", { ascending: false }) // Top rated
        .limit(5),

      supabase
        .from("feedback")
        .select(
          `
            *,
            profiles:user_id (full_name)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    totalEvents: eventsCount.count || 0,
    totalFeedback: feedbackCount.count || 0,
    topEvents: analytics.data || [],
    recentFeedback: recentFeedback.data || [],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your events and feedback
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Events" value={data.totalEvents} icon="📅" />
        <StatsCard
          title="Total Feedback"
          value={data.totalFeedback}
          icon="💬"
        />
        <StatsCard
          title="Avg Rating (Top Events)"
          value={
            data.topEvents.length > 0
              ? (
                  data.topEvents.reduce(
                    (acc, e) => acc + (e.avg_rating || 0),
                    0,
                  ) / data.topEvents.length
                ).toFixed(1)
              : "0"
          }
          icon="⭐"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart data={data.topEvents} />
        <EventOverview events={data.topEvents} />
      </div>

      <RecentFeedback feedback={data.recentFeedback} />
    </div>
  );
}
