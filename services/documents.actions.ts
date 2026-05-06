"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createDocumentSchema,
  updateDocumentSchema,
} from "@/lib/validations/schemas";
import type { ActionResult, Database } from "@/types";

type Document = Database["public"]["Tables"]["documents"]["Row"];

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function getDocumentsByApplication(
  applicationId: string
): Promise<Document[]> {
  const { supabase, user } = await getAuthenticatedUser();

  // Verify ownership via application
  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (!application) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function createDocumentAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const raw = {
      application_id: formData.get("application_id"),
      type: formData.get("type"),
      name: formData.get("name"),
      status: formData.get("status") ?? "pending",
      notes: formData.get("notes"),
    };

    const parsed = createDocumentSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    // Verify user owns the application
    const { data: application } = await supabase
      .from("applications")
      .select("id")
      .eq("id", parsed.data.application_id)
      .eq("user_id", user.id)
      .single();

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({
        application_id: parsed.data.application_id,
        type: parsed.data.type,
        name: parsed.data.name,
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: "Failed to create document." };

    revalidatePath("/documents");
    revalidatePath(`/applications/${parsed.data.application_id}`);
    return { success: true, data: { id: data.id } };
  } catch {
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function updateDocumentAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const raw = {
      id: formData.get("id"),
      status: formData.get("status"),
      notes: formData.get("notes"),
    };

    const parsed = updateDocumentSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    // Verify ownership through application join
    const { data: doc } = await supabase
      .from("documents")
      .select("id, application_id, applications!inner(user_id)")
      .eq("id", parsed.data.id)
      .single();

    if (!doc) return { success: false, error: "Document not found." };

    const appData = doc.applications as unknown as { user_id: string };
    if (appData.user_id !== user.id) {
      return { success: false, error: "Unauthorized." };
    }

    const { error } = await supabase
      .from("documents")
      .update({
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) return { success: false, error: "Failed to update document." };

    revalidatePath("/documents");
    revalidatePath(`/applications/${doc.application_id}`);
    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deleteDocumentAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    // Verify ownership
    const { data: doc } = await supabase
      .from("documents")
      .select("id, application_id, applications!inner(user_id)")
      .eq("id", id)
      .single();

    if (!doc) return { success: false, error: "Document not found." };

    const appData = doc.applications as unknown as { user_id: string };
    if (appData.user_id !== user.id) {
      return { success: false, error: "Unauthorized." };
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) return { success: false, error: "Failed to delete document." };

    revalidatePath("/documents");
    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function getAllUserDocuments(): Promise<
  (Document & { scholarship_title: string; application_status: string })[]
> {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      applications!inner(
        user_id,
        status,
        scholarships(title)
      )
    `
    )
    .eq("applications.user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((doc) => ({
    ...doc,
    scholarship_title:
      (doc.applications as unknown as { scholarships: { title: string } })
        ?.scholarships?.title ?? "Unknown",
    application_status:
      (doc.applications as unknown as { status: string })?.status ?? "unknown",
  }));
}
