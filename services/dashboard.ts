"use server";

import { createClient } from "@/lib/supabase/server";
import { getDaysUntilDeadline } from "@/utils";
import type { DashboardStats, ApplicationWithScholarship, UpcomingDeadline } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalApplications: 0,
      activeApplications: 0,
      acceptedApplications: 0,
      pendingDocuments: 0,
      upcomingDeadlines: [],
      recentApplications: [],
    };
  }

  // Fetch all applications with related data
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      *,
      scholarship:scholarships(*),
      documents(*),
      reminders(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const apps = (applications ?? []) as ApplicationWithScholarship[];

  const totalApplications = apps.length;
  const activeApplications = apps.filter(
    (a) => !["rejected", "accepted"].includes(a.status)
  ).length;
  const acceptedApplications = apps.filter((a) => a.status === "accepted").length;

  const pendingDocuments = apps.reduce((count, app) => {
    return (
      count +
      (app.documents?.filter((d) => d.status === "pending" || d.status === "in_progress")
        .length ?? 0)
    );
  }, 0);

  // Upcoming deadlines (next 60 days)
  const upcomingDeadlines: UpcomingDeadline[] = apps
    .filter((app) => {
      const deadline = app.deadline ?? app.scholarship?.deadline;
      if (!deadline) return false;
      const daysLeft = getDaysUntilDeadline(deadline);
      return daysLeft >= 0 && daysLeft <= 60;
    })
    .map((app) => {
      const deadline = app.deadline ?? app.scholarship?.deadline ?? "";
      return {
        id: app.id,
        scholarshipTitle: app.scholarship?.title ?? "Unknown",
        deadline,
        daysLeft: getDaysUntilDeadline(deadline),
        status: app.status,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  const recentApplications = apps.slice(0, 5);

  return {
    totalApplications,
    activeApplications,
    acceptedApplications,
    pendingDocuments,
    upcomingDeadlines,
    recentApplications,
  };
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*, subscriptions(*)")
    .eq("id", user.id)
    .single();

  return data;
}
