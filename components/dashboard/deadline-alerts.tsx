import Link from "next/link";
import { AlertTriangle, Clock, CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getDeadlineUrgency } from "@/utils";
import type { UpcomingDeadline } from "@/types";
import { cn } from "@/utils";

interface DeadlineAlertsProps {
  deadlines: UpcomingDeadline[];
}

export function DeadlineAlerts({ deadlines }: DeadlineAlertsProps) {
  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="text-xs h-7">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map((deadline) => {
          const urgency = getDeadlineUrgency(deadline.daysLeft);
          return (
            <div
              key={deadline.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3 border",
                urgency === "critical" && "border-red-200 bg-red-50",
                urgency === "warning" && "border-amber-200 bg-amber-50",
                urgency === "normal" && "border-border bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex-shrink-0",
                  urgency === "critical" && "text-red-500",
                  urgency === "warning" && "text-amber-500",
                  urgency === "normal" && "text-muted-foreground"
                )}
              >
                {urgency === "critical" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : urgency === "warning" ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {deadline.scholarshipTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(deadline.deadline)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs flex-shrink-0",
                  urgency === "critical" && "border-red-300 text-red-700",
                  urgency === "warning" && "border-amber-300 text-amber-700"
                )}
              >
                {deadline.daysLeft === 0
                  ? "Today!"
                  : deadline.daysLeft === 1
                  ? "Tomorrow"
                  : `${deadline.daysLeft}d left`}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
