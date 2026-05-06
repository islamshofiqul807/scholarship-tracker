import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, calculateDocumentCompletion, getCountryLabel } from "@/utils";
import type { ApplicationWithScholarship } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentApplicationsProps {
  applications: ApplicationWithScholarship[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Browse scholarships and start your first application."
            action={
              <Link href="/scholarships">
                <Button size="sm">Browse Scholarships</Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Recent Applications</CardTitle>
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="text-xs h-7">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((app) => {
            const docsCompleted = calculateDocumentCompletion(app.documents ?? []);
            const deadline = app.deadline ?? app.scholarship?.deadline;
            return (
              <div key={app.id} className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {app.scholarship?.title}
                    </p>
                    <StatusBadge status={app.status} type="application" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {getCountryLabel(app.scholarship?.country ?? "")}
                    {deadline && ` · Due ${formatDate(deadline)}`}
                  </p>
                  {app.documents && app.documents.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Progress value={docsCompleted} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {docsCompleted}%
                      </span>
                    </div>
                  )}
                </div>
                <Link href={`/applications/${app.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
