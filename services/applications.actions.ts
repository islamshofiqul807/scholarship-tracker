"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateApplicationSchema } from "@/lib/validations/schemas";
import { FREE_PLAN_LIMIT } from "@/lib/constants";
import type { ActionResult, ApplicationWithScholarship } from "@/types";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function getApplications(): Promise<ApplicationWithScholarship[]> {
  const { supabase, user } = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("applications")
    .select(`*, scholarship:scholarships(*), documents(*), reminders(*)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ApplicationWithScholarship[];
}

export async function getApplicationById(
  id: string
): Promise<ApplicationWithScholarship | null> {
  const { supabase, user } = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("applications")
    .select(`*, scholarship:scholarships(*), documents(*), reminders(*)`)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error) return null;
  return data as ApplicationWithScholarship;
}

export async function createApplicationAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await getAuthenticatedUser();

  const scholarship_id = formData.get("scholarship_id")?.toString();
  const status = formData.get("status")?.toString() ?? "wishlist";
  const notes = formData.get("notes")?.toString() ?? null;
  const deadline = formData.get("deadline")?.toString() ?? null;

  console.log("scholarship_id:", scholarship_id);
  console.log("user.id:", user.id);

  if (!scholarship_id) {
    return { success: false, error: "Scholarship ID is missing." };
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (userProfile?.plan === "free") {
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= FREE_PLAN_LIMIT) {
      return {
        success: false,
        error: `Free plan is limited to ${FREE_PLAN_LIMIT} applications. Upgrade to Premium.`,
      };
    }
  }

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("scholarship_id", scholarship_id)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "You already applied for this scholarship." };
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      scholarship_id: scholarship_id,
      status: status as never,
      notes: notes,
      deadline: deadline,
    })
    .select("id")
    .single();

  console.log("insert data:", data);
  console.log("insert error:", error);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true, data: { id: data.id } };
}

export async function updateApplicationAction(
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();
  const raw = {
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    deadline: formData.get("deadline"),
  };
  const parsed = updateApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }
  const { error } = await supabase
    .from("applications")
    .update({
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
      deadline: parsed.data.deadline ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);
  if (error) return { success: false, error: "Failed to update application." };
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteApplicationAction(id: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { success: false, error: "Failed to delete application." };
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplicationStatusAction(
  id: string,
  status: string
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();
  const { error } = await supabase
    .from("applications")
    .update({
      status: status as never,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { success: false, error: "Failed to update status." };
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true };
}