"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createStateGroup(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("state_groups").insert({
    name: formData.get("name"),
    expiration_months: Number(formData.get("expiration_months")),
    renewal_processing_days: Number(formData.get("renewal_processing_days")),
  });
  revalidatePath("/admin/groups");
}
