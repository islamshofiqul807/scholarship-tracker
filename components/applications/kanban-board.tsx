"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  MapPin,
  GraduationCap,
  Calendar,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateApplicationStatusAction,
  deleteApplicationAction,
} from "@/services/applications.actions";
import {
  formatDate,
  calculateDocumentCompletion,
  getDaysUntilDeadline,
  getDeadlineUrgency,
  getCountryLabel,
  getDegreeLevelLabel,
} from "@/utils";
import { APPLICATION_STATUSES, KANBAN_COLUMNS } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/utils";
import type { ApplicationWithScholarship } from "@/types";

interface KanbanBoardProps {
  applications: ApplicationWithScholarship[];
}

interface ApplicationCardProps {
  application: ApplicationWithScholarship;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

function ApplicationCard({ application, onStatusChange, onDelete }: ApplicationCardProps) {
  const docCompletion = calculateDocumentCompletion(application.documents ?? []);
  const deadline = application.deadline ?? application.scholarship?.deadline;
  const daysLeft = deadline ? getDaysUntilDeadline(deadline) : null;
  const urgency = daysLeft !== null ? getDeadlineUrgency(daysLeft) : null;

  return (
    <Card className="group shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-1 mb-2">
          <p className="text-xs font-semibold leading-snug line-clamp-2 flex-1">
            {application.scholarship?.title}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/applications/${application.id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive gap-2"
                onClick={() => onDelete(application.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{getCountryLabel(application.scholarship?.country ?? "")}</span>
            <span className="mx-0.5">·</span>
            <GraduationCap className="h-3 w-3" />
            <span>{getDegreeLevelLabel(application.scholarship?.degree_level ?? "")}</span>
          </div>

          {deadline && (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px]",
                urgency === "critical" && "text-red-600",
                urgency === "warning" && "text-amber-600",
                urgency === "normal" && "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              <span>
                {daysLeft !== null && daysLeft < 0
                  ? "Passed"
                  : `${formatDate(deadline)}`}
              </span>
              {daysLeft !== null && daysLeft >= 0 && (
                <span className="font-medium ml-auto">
                  {daysLeft === 0 ? "Today!" : `${daysLeft}d`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Document Progress */}
        {(application.documents?.length ?? 0) > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
              <span>Documents</span>
              <span>{docCompletion}%</span>
            </div>
            <Progress value={docCompletion} className="h-1" />
          </div>
        )}

        {/* Status Change */}
        <Select
          value={application.status}
          onValueChange={(v) => onStatusChange(application.id, v)}
        >
          <SelectTrigger className="h-7 text-[11px] mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

const COLUMN_COLORS: Record<string, string> = {
  wishlist: "border-t-slate-400",
  in_progress: "border-t-blue-500",
  submitted: "border-t-amber-500",
  interview: "border-t-purple-500",
  accepted: "border-t-emerald-500",
  rejected: "border-t-red-500",
};

export function KanbanBoard({ applications: initialApps }: KanbanBoardProps) {
  const [applications, setApplications] = useState(initialApps);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, newStatus: string) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: newStatus as ApplicationWithScholarship["status"] } : a
      )
    );

    startTransition(async () => {
      const result = await updateApplicationStatusAction(id, newStatus);
      if (!result.success) {
        // Revert on failure
        setApplications(initialApps);
        toast({ variant: "destructive", title: "Failed to update status" });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteApplicationAction(id);
      if (result.success) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
        toast({ variant: "success", title: "Application deleted" });
      } else {
        toast({ variant: "destructive", title: "Failed to delete", description: result.error });
      }
    });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {KANBAN_COLUMNS.map((col) => {
        const colApps = applications.filter((a) => a.status === col.status);
        return (
          <div key={col.status} className="flex-shrink-0 w-64">
            <div
              className={cn(
                "rounded-lg border-t-2 bg-muted/40 p-3",
                COLUMN_COLORS[col.status] ?? "border-t-gray-400"
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {col.label}
                </h3>
                <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
                  {colApps.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colApps.length === 0 ? (
                  <p className="text-center text-[11px] text-muted-foreground py-4">
                    No applications
                  </p>
                ) : (
                  colApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
