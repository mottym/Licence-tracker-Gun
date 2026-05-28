"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function optionalNumber(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function updateStateRules(formData: FormData) {
  const supabase = await createClient();
  const stateId = String(formData.get("state_id"));
  const expirationMonths = optionalNumber(formData.get("expiration_months"));
  const renewalProcessingDays = optionalNumber(formData.get("renewal_processing_days"));
  const groupId = formData.get("group_id");
  const name = optionalText(formData.get("name"));
  const code = optionalText(formData.get("code"));
  const gunRenewalUrl = optionalText(formData.get("gun_renewal_url"));
  const expiresOnBirthday = formData.get("expires_on_birthday") === "on";

  await supabase
    .from("states")
    .update({
      name: name ?? undefined,
      code: code?.toUpperCase() ?? undefined,
      group_id: groupId ? String(groupId) : null,
      expiration_months: expirationMonths,
      renewal_processing_days: renewalProcessingDays,
      gun_renewal_url: gunRenewalUrl,
      expires_on_birthday: expiresOnBirthday,
    })
    .eq("id", stateId);

  revalidatePath("/admin/states");
  revalidatePath("/dashboard/licences");
}

export async function createState(formData: FormData) {
  const supabase = await createClient();
  const name = optionalText(formData.get("name"));
  const code = optionalText(formData.get("code"));
  if (!name || !code) return;

  await supabase.from("states").insert({
    name,
    code: code.toUpperCase(),
    is_custom: true,
    group_id: optionalText(formData.get("group_id")),
    expiration_months: optionalNumber(formData.get("expiration_months")),
    renewal_processing_days: optionalNumber(formData.get("renewal_processing_days")),
    gun_renewal_url: optionalText(formData.get("gun_renewal_url")),
    expires_on_birthday: formData.get("expires_on_birthday") === "on",
  });

  revalidatePath("/admin/states");
  revalidatePath("/dashboard/licences");
}

export async function deleteState(formData: FormData) {
  const supabase = await createClient();
  const stateId = String(formData.get("state_id"));
  await supabase.from("states").delete().eq("id", stateId).eq("is_custom", true);
  revalidatePath("/admin/states");
  revalidatePath("/dashboard/licences");
}
