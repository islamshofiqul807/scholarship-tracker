import { Suspense } from "react";
import type { Metadata } from "next";
import { FolderOpen, Check, Clock, Circle } from "lucide-react";
import { getAllUserDocuments } from "@/services/documents.actions";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDocumentTypeLabel, formatDate } from "@/utils";
import { DOCUMENT_STATUSES } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = { title: "Documents" };

function DocumentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

async function DocumentsContent() {
  const documents = await getAllUserDocuments();

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No documents yet"
        description="Start an application and add required documents to track them here."
        action={
          <Link href="/applications">
            <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              View Applications
            </button>
          </Link>
        }
      />
    );
  }

  // Group by status
  const grouped = DOCUMENT_STATUSES.map((status) => ({
    ...status,
    docs: documents.filter((d) => d.status === status.value),
  }));

  const stats = {
    total: documents.length,
    complete: documents.filter((d) => d.status === "complete").length,
    inProgress: documents.filter((d) => d.status === "in_progress").length,
    pending: documents.filter((d) => d.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Complete", value: stats.complete, color: "text-emerald-600" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-600" },
          { label: "Pending", value: stats.pending, color: "text-slate-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <StatusBadge
                  status={doc.status}
                  type="document"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getDocumentTypeLabel(doc.type)} · {doc.scholarship_title}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
                  {formatDate(doc.created_at)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function DocumentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Documents"
        description="Track all required documents across your scholarship applications."
      />
      <Suspense fallback={<DocumentsSkeleton />}>
        <DocumentsContent />
      </Suspense>
    </div>
  );
}
