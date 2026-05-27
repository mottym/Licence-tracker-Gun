"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateStateRules(formData: FormData) {
  const supabase = await createClient();
  const stateId = String(formData.get("state_id"));
  const expirationMonths = formData.get("expiration_months");
  const renewalProcessingDays = formData.get("renewal_processing_days");
  const groupId = formData.get("group_id");

  await supabase
    .from("states")
    .update({
      group_id: groupId ? String(groupId) : null,
      expiration_months: expirationMonths ? Number(expirationMonths) : null,
      renewal_processing_days: renewalProcessingDays ? Number(renewalProcessingDays) : null,
    })
    .eq("id", stateId);

  revalidatePath("/admin/states");
}
