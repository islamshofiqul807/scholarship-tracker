"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validations/schemas";
import type { ActionResult } from "@/types";

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Unauthorized" };

  const raw = { name: formData.get("name") };
  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { error } = await supabase
    .from("users")
    .update({ name: parsed.data.name, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { success: false, error: "Failed to update profile." };

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: true };
}
