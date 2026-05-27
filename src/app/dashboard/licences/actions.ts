"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("licences").insert({
    user_id: user.id,
    state_id: formData.get("state_id"),
    last_renewed_at: formData.get("last_renewed_at"),
    licence_number: formData.get("licence_number") || null,
    notes: formData.get("notes") || null,
  });

  revalidatePath("/dashboard/licences");
  revalidatePath("/dashboard");
}

export async function renewLicence(formData: FormData) {
  const supabase = await createClient();
  const licenceId = String(formData.get("licence_id"));

  await supabase
    .from("licences")
    .update({ last_renewed_at: new Date().toISOString().split("T")[0] })
    .eq("id", licenceId);

  revalidatePath("/dashboard/licences");
  revalidatePath("/dashboard");
}

export async function deleteLicence(formData: FormData) {
  const supabase = await createClient();
  const licenceId = String(formData.get("licence_id"));
  await supabase.from("licences").delete().eq("id", licenceId);
  revalidatePath("/dashboard/licences");
  revalidatePath("/dashboard");
}
