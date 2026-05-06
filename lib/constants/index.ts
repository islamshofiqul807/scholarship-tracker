export const APP_NAME = "ScholarTrack";
export const APP_DESCRIPTION = "Track your scholarship applications with confidence";

export const FREE_PLAN_LIMIT = parseInt(
  process.env.FREE_PLAN_APPLICATION_LIMIT ?? "3",
  10
);

export const COUNTRIES = [
  { value: "USA", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Germany", label: "Germany" },
  { value: "Australia", label: "Australia" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Sweden", label: "Sweden" },
  { value: "France", label: "France" },
  { value: "Japan", label: "Japan" },
  { value: "Singapore", label: "Singapore" },
] as const;

export const DEGREE_LEVELS = [
  { value: "bachelor", label: "Bachelor's" },
  { value: "master", label: "Master's" },
  { value: "phd", label: "PhD" },
  { value: "any", label: "Any Level" },
] as const;

export const FUNDING_TYPES = [
  { value: "full", label: "Full Funding" },
  { value: "partial", label: "Partial Funding" },
  { value: "stipend", label: "Stipend Only" },
  { value: "tuition", label: "Tuition Only" },
] as const;

export const APPLICATION_STATUSES = [
  { value: "wishlist", label: "Wishlist", color: "bg-slate-100 text-slate-700" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "submitted", label: "Submitted", color: "bg-amber-100 text-amber-700" },
  { value: "interview", label: "Interview", color: "bg-purple-100 text-purple-700" },
  { value: "accepted", label: "Accepted", color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "waitlisted", label: "Waitlisted", color: "bg-orange-100 text-orange-700" },
] as const;

export const DOCUMENT_TYPES = [
  { value: "transcript", label: "Academic Transcript" },
  { value: "recommendation_letter", label: "Recommendation Letter" },
  { value: "statement_of_purpose", label: "Statement of Purpose" },
  { value: "cv_resume", label: "CV / Resume" },
  { value: "passport", label: "Passport Copy" },
  { value: "language_test", label: "Language Test Score" },
  { value: "financial_statement", label: "Financial Statement" },
  { value: "portfolio", label: "Portfolio" },
  { value: "other", label: "Other" },
] as const;

export const DOCUMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-600" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-600" },
  { value: "complete", label: "Complete", color: "bg-emerald-100 text-emerald-600" },
  { value: "not_required", label: "Not Required", color: "bg-gray-100 text-gray-500" },
] as const;

export const KANBAN_COLUMNS = [
  { status: "wishlist", label: "Wishlist" },
  { status: "in_progress", label: "In Progress" },
  { status: "submitted", label: "Submitted" },
  { status: "interview", label: "Interview" },
  { status: "accepted", label: "Accepted" },
  { status: "rejected", label: "Rejected" },
] as const;

export const PLAN_FEATURES = {
  free: {
    applicationLimit: FREE_PLAN_LIMIT,
    features: [
      `Up to ${FREE_PLAN_LIMIT} applications`,
      "Document checklist",
      "Deadline tracking",
      "Basic reminders",
    ],
  },
  premium: {
    applicationLimit: Infinity,
    price: "$9.99/month",
    features: [
      "Unlimited applications",
      "Document checklist",
      "Deadline tracking",
      "Advanced reminders",
      "Priority support",
      "Export to PDF",
      "Application analytics",
    ],
  },
} as const;
