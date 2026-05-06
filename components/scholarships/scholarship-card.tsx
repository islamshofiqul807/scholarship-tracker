import Link from "next/link";
import { MapPin, GraduationCap, DollarSign, Calendar, ExternalLink, Plus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getDaysUntilDeadline,
  getDeadlineUrgency,
  getDegreeLevelLabel,
  getFundingTypeLabel,
  truncate,
} from "@/utils";
import { cn } from "@/utils";
import type { Database } from "@/types";

type Scholarship = Database["public"]["Tables"]["scholarships"]["Row"];

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isApplied?: boolean;
  onApply?: (scholarshipId: string) => void;
}

const fundingColorMap: Record<string, string> = {
  full: "bg-emerald-100 text-emerald-700",
  partial: "bg-blue-100 text-blue-700",
  stipend: "bg-purple-100 text-purple-700",
  tuition: "bg-amber-100 text-amber-700",
};

export function ScholarshipCard({ scholarship, isApplied, onApply }: ScholarshipCardProps) {
  const daysLeft = getDaysUntilDeadline(scholarship.deadline);
  const urgency = getDeadlineUrgency(daysLeft);

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">
            {scholarship.title}
          </h3>
          <span
            className={cn(
              "inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
              fundingColorMap[scholarship.funding_type] ?? "bg-gray-100 text-gray-700"
            )}
          >
            {getFundingTypeLabel(scholarship.funding_type)}
          </span>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{scholarship.country}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{getDegreeLevelLabel(scholarship.degree_level)}</span>
          </div>
        </div>

        {/* Description */}
        {scholarship.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {truncate(scholarship.description, 120)}
          </p>
        )}

        {/* Deadline */}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
            urgency === "critical" && "bg-red-50 text-red-700",
            urgency === "warning" && "bg-amber-50 text-amber-700",
            urgency === "normal" && "bg-muted text-muted-foreground",
            urgency === "past" && "bg-gray-50 text-gray-500"
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {urgency === "past"
              ? "Deadline passed"
              : `Deadline: ${formatDate(scholarship.deadline)}`}
          </span>
          {urgency !== "past" && (
            <span className="ml-auto">
              {daysLeft === 0
                ? "Today!"
                : daysLeft === 1
                ? "Tomorrow"
                : `${daysLeft}d left`}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 p-5 pt-0">
        {scholarship.link && (
          <a
            href={scholarship.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Button>
          </a>
        )}
        {isApplied ? (
          <Link href="/applications" className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Applied ✓
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onApply?.(scholarship.id)}
            disabled={urgency === "past"}
          >
            <Plus className="h-3.5 w-3.5" />
            Apply
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
