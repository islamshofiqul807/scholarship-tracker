import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, formatDistanceToNow, isPast } from "date-fns";
import { APPLICATION_STATUSES, DOCUMENT_STATUSES, DOCUMENT_TYPES, COUNTRIES, DEGREE_LEVELS, FUNDING_TYPES } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDaysUntilDeadline(deadline: string | Date): number {
  return differenceInDays(new Date(deadline), new Date());
}

export function isDeadlinePast(deadline: string | Date): boolean {
  return isPast(new Date(deadline));
}

export function getDeadlineUrgency(daysLeft: number): "critical" | "warning" | "normal" | "past" {
  if (daysLeft < 0) return "past";
  if (daysLeft <= 7) return "critical";
  if (daysLeft <= 30) return "warning";
  return "normal";
}

export function getApplicationStatusConfig(status: string) {
  return APPLICATION_STATUSES.find((s) => s.value === status) ?? APPLICATION_STATUSES[0];
}

export function getDocumentStatusConfig(status: string) {
  return DOCUMENT_STATUSES.find((s) => s.value === status) ?? DOCUMENT_STATUSES[0];
}

export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPES.find((d) => d.value === type)?.label ?? type;
}

export function getCountryLabel(country: string): string {
  return COUNTRIES.find((c) => c.value === country)?.label ?? country;
}

export function getDegreeLevelLabel(level: string): string {
  return DEGREE_LEVELS.find((d) => d.value === level)?.label ?? level;
}

export function getFundingTypeLabel(type: string): string {
  return FUNDING_TYPES.find((f) => f.value === type)?.label ?? type;
}

export function calculateDocumentCompletion(
  documents: { status: string }[]
): number {
  if (documents.length === 0) return 0;
  const completed = documents.filter(
    (d) => d.status === "complete" || d.status === "not_required"
  ).length;
  return Math.round((completed / documents.length) * 100);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}
