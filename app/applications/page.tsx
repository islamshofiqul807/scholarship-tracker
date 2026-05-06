import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus, FileText } from "lucide-react";
import { getApplications } from "@/services/applications.actions";
import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/applications/kanban-board";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Applications" };

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="flex-shrink-0 w-64 h-80 rounded-lg" />
      ))}
    </div>
  );
}

async function ApplicationsContent() {
  const applications = await getApplications();

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No applications yet"
        description="Browse scholarships and apply to start tracking your applications here."
        action={
          <Link href="/scholarships">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Browse Scholarships
            </Button>
          </Link>
        }
      />
    );
  }

  return <KanbanBoard applications={applications} />;
}

export default async function ApplicationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Applications"
        description="Track all your scholarship applications in one place."
      >
        <Link href="/scholarships">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </PageHeader>

      <Suspense fallback={<KanbanSkeleton />}>
        <ApplicationsContent />
      </Suspense>
    </div>
  );
}
