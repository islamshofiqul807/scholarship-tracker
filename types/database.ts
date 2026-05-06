export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          plan: "free" | "premium";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          plan?: "free" | "premium";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          plan?: "free" | "premium";
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      scholarships: {
        Row: {
          id: string;
          title: string;
          country: string;
          degree_level: "bachelor" | "master" | "phd" | "any";
          funding_type: "full" | "partial" | "stipend" | "tuition";
          deadline: string;
          description: string | null;
          link: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          country: string;
          degree_level: "bachelor" | "master" | "phd" | "any";
          funding_type: "full" | "partial" | "stipend" | "tuition";
          deadline: string;
          description?: string | null;
          link?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          country?: string;
          degree_level?: "bachelor" | "master" | "phd" | "any";
          funding_type?: "full" | "partial" | "stipend" | "tuition";
          deadline?: string;
          description?: string | null;
          link?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          scholarship_id: string;
          status: ApplicationStatus;
          notes: string | null;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scholarship_id: string;
          status?: ApplicationStatus;
          notes?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: ApplicationStatus;
          notes?: string | null;
          deadline?: string | null;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          application_id: string;
          type: DocumentType;
          name: string;
          status: DocumentStatus;
          file_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          type: DocumentType;
          name: string;
          status?: DocumentStatus;
          file_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: DocumentType;
          name?: string;
          status?: DocumentStatus;
          file_url?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          application_id: string;
          reminder_date: string;
          message: string | null;
          sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          reminder_date: string;
          message?: string | null;
          sent?: boolean;
          created_at?: string;
        };
        Update: {
          reminder_date?: string;
          message?: string | null;
          sent?: boolean;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "premium";
          status: "active" | "canceled" | "past_due" | "trialing";
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "premium";
          status?: "active" | "canceled" | "past_due" | "trialing";
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan?: "free" | "premium";
          status?: "active" | "canceled" | "past_due" | "trialing";
          current_period_start?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};

export type ApplicationStatus =
  | "wishlist"
  | "in_progress"
  | "submitted"
  | "interview"
  | "accepted"
  | "rejected"
  | "waitlisted";

export type DocumentType =
  | "transcript"
  | "recommendation_letter"
  | "statement_of_purpose"
  | "cv_resume"
  | "passport"
  | "language_test"
  | "financial_statement"
  | "portfolio"
  | "other";

export type DocumentStatus = "pending" | "in_progress" | "complete" | "not_required";

export type Plan = "free" | "premium";
export type DegreeLevel = "bachelor" | "master" | "phd" | "any";
export type FundingType = "full" | "partial" | "stipend" | "tuition";
export type Country = "USA" | "UK" | "Canada" | "Germany" | "Australia" | string;
