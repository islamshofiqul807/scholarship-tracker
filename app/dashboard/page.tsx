import { Suspense } from "react";
import {
  FileText,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getDashboardStats } from "@/services/dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DeadlineAlerts } from "@/components/dashboard/deadline-alerts";
import { RecentApplications } from "@/components/dashboard/recent-applications";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

async function DashboardContent() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Applications"
          value={stats.totalApplications}
          description="All time"
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Active Applications"
          value={stats.activeApplications}
          description="In progress"
          icon={GraduationCap}
          color="purple"
        />
        <StatsCard
          title="Accepted"
          value={stats.acceptedApplications}
          description="Congratulations!"
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Pending Documents"
          value={stats.pendingDocuments}
          description="Needs attention"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentApplications applications={stats.recentApplications} />
        </div>
        <div className="lg:col-span-2">
          <DeadlineAlerts deadlines={stats.upcomingDeadlines} />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const firstName = (profile as any)?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${greeting}, ${firstName} 👋`}
        description="Here's an overview of your scholarship journey."
      />

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
