export type * from "./database";

// Enriched types with joins
export type ApplicationWithScholarship = {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: import("./database").ApplicationStatus;
  notes: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  scholarship: {
    id: string;
    title: string;
    country: string;
    degree_level: string;
    funding_type: string;
    deadline: string;
    link: string | null;
  };
  documents: {
    id: string;
    type: string;
    name: string;
    status: string;
  }[];
  reminders: {
    id: string;
    reminder_date: string;
    sent: boolean;
  }[];
};

export type DashboardStats = {
  totalApplications: number;
  activeApplications: number;
  acceptedApplications: number;
  pendingDocuments: number;
  upcomingDeadlines: UpcomingDeadline[];
  recentApplications: ApplicationWithScholarship[];
};

export type UpcomingDeadline = {
  id: string;
  scholarshipTitle: string;
  deadline: string;
  daysLeft: number;
  status: import("./database").ApplicationStatus;
};

export type ScholarshipFilters = {
  country?: string;
  degree_level?: string;
  funding_type?: string;
  search?: string;
};

export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
