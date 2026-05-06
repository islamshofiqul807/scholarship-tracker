import { Suspense } from "react";
import type { Metadata } from "next";
import { getScholarships } from "@/services/scholarships.actions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ScholarshipFilters } from "@/components/scholarships/scholarship-filters";
import { ScholarshipsGrid } from "@/components/scholarships/scholarships-grid";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Scholarships" };

interface ScholarshipsPageProps {
  searchParams: Promise<{
    country?: string;
    degree_level?: string;
    funding_type?: string;
    search?: string;
  }>;
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  );
}

async function ScholarshipsContent({
  filters,
}: {
  filters: Record<string, string>;
}) {
  const [scholarships, supabase] = await Promise.all([
    getScholarships(filters),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let appliedIds: string[] = [];
  if (user) {
    const { data: apps } = await supabase
      .from("applications")
      .select("scholarship_id")
      .eq("user_id", user.id);
    appliedIds = (apps ?? []).map((a) => a.scholarship_id);
  }

  return (
    <ScholarshipsGrid scholarships={scholarships} appliedIds={appliedIds} />
  );
}

export default async function ScholarshipsPage({ searchParams }: ScholarshipsPageProps) {
  const params = await searchParams;
  const filters: Record<string, string> = {};
  if (params.country) filters.country = params.country;
  if (params.degree_level) filters.degree_level = params.degree_level;
  if (params.funding_type) filters.funding_type = params.funding_type;
  if (params.search) filters.search = params.search;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Scholarships"
        description="Browse and track scholarship opportunities worldwide."
      />

      <ScholarshipFilters />

      <Suspense key={JSON.stringify(filters)} fallback={<GridSkeleton />}>
        <ScholarshipsContent filters={filters} />
      </Suspense>
    </div>
  );
}
