"use server";

import { createClient } from "@/lib/supabase/server";
import { scholarshipFilterSchema } from "@/lib/validations/schemas";
import type { Database } from "@/types";

type Scholarship = Database["public"]["Tables"]["scholarships"]["Row"];

export async function getScholarships(
  filters?: Record<string, string>
): Promise<Scholarship[]> {
  const supabase = await createClient();

  const parsed = scholarshipFilterSchema.safeParse(filters ?? {});
  const validFilters = parsed.success ? parsed.data : {};

  let query = supabase
    .from("scholarships")
    .select("*")
    .eq("is_active", true)
    .order("deadline", { ascending: true });

  if (validFilters.country) {
    query = query.eq("country", validFilters.country);
  }

  if (validFilters.degree_level) {
    query = query.eq("degree_level", validFilters.degree_level as never);
  }

  if (validFilters.funding_type) {
    query = query.eq("funding_type", validFilters.funding_type as never);
  }

  if (validFilters.search) {
    query = query.ilike("title", `%${validFilters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getScholarshipById(id: string): Promise<Scholarship | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scholarships")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getFeaturedScholarships(): Promise<Scholarship[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scholarships")
    .select("*")
    .eq("is_active", true)
    .gte("deadline", new Date().toISOString())
    .order("deadline", { ascending: true })
    .limit(6);

  if (error) return [];
  return data ?? [];
}
