import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Application schemas
export const createApplicationSchema = z.object({
  scholarship_id: z.string().uuid("Invalid scholarship ID"),
  status: z
    .enum([
      "wishlist",
      "in_progress",
      "submitted",
      "interview",
      "accepted",
      "rejected",
      "waitlisted",
    ])
    .default("wishlist"),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
  deadline: z.string().optional(),
});

export const updateApplicationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "wishlist",
    "in_progress",
    "submitted",
    "interview",
    "accepted",
    "rejected",
    "waitlisted",
  ]),
  notes: z.string().max(2000).optional(),
  deadline: z.string().optional(),
});

// Document schemas
export const createDocumentSchema = z.object({
  application_id: z.string().uuid(),
  type: z.enum([
    "transcript",
    "recommendation_letter",
    "statement_of_purpose",
    "cv_resume",
    "passport",
    "language_test",
    "financial_statement",
    "portfolio",
    "other",
  ]),
  name: z.string().min(1, "Document name is required").max(200),
  status: z.enum(["pending", "in_progress", "complete", "not_required"]).default("pending"),
  notes: z.string().max(500).optional(),
});

export const updateDocumentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "complete", "not_required"]),
  notes: z.string().max(500).optional(),
});

// Reminder schemas
export const createReminderSchema = z.object({
  application_id: z.string().uuid(),
  reminder_date: z.string().min(1, "Reminder date is required"),
  message: z.string().max(500).optional(),
});

// Scholarship filter schema
export const scholarshipFilterSchema = z.object({
  country: z.string().optional(),
  degree_level: z.enum(["bachelor", "master", "phd", "any"]).optional(),
  funding_type: z.enum(["full", "partial", "stipend", "tuition"]).optional(),
  search: z.string().max(200).optional(),
});

// Profile update schema
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type ScholarshipFilterInput = z.infer<typeof scholarshipFilterSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
