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
  const name = optionalText(formData.get("name"));
  const code = optionalText(formData.get("code"));
  const gunRenewalUrl = optionalText(formData.get("gun_renewal_url"));
  const expiresOnBirthday = formData.get("expires_on_birthday") === "on";

  await supabase
    .from("states")
    .update({
      name: name ?? undefined,
      code: code?.toUpperCase() ?? undefined,
      expiration_months: expirationMonths,
      renewal_processing_days: renewalProcessingDays,
      gun_renewal_url: gunRenewalUrl,
      expires_on_birthday: expiresOnBirthday,
    })
    .eq("id", stateId);

  revalidatePath("/admin/states");
  revalidatePath("/dashboard/gun-licences");
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
    expiration_months: optionalNumber(formData.get("expiration_months")),
    renewal_processing_days: optionalNumber(formData.get("renewal_processing_days")),
    gun_renewal_url: optionalText(formData.get("gun_renewal_url")),
    expires_on_birthday: formData.get("expires_on_birthday") === "on",
  });

  revalidatePath("/admin/states");
  revalidatePath("/dashboard/gun-licences");
}

export async function deleteState(formData: FormData) {
  const supabase = await createClient();
  const stateId = String(formData.get("state_id"));
  await supabase.from("states").delete().eq("id", stateId).eq("is_custom", true);
  revalidatePath("/admin/states");
  revalidatePath("/dashboard/gun-licences");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function addStateLicenceType(formData: FormData) {
  const supabase = await createClient();
  const stateId = optionalText(formData.get("state_id"));
  const name = optionalText(formData.get("name"));
  if (!stateId || !name) return;

  const { data: category } = await supabase
    .from("record_categories")
    .select("id")
    .eq("key", "gun_licence")
    .maybeSingle();
  if (!category?.id) return;

  const baseSlug = slugify(name) || "licence_type";
  const key = `${baseSlug}_${Date.now().toString(36)}`;

  await supabase.from("record_types").insert({
    category_id: category.id,
    state_id: stateId,
    key,
    name,
    requires_renewal: true,
    is_active: true,
  });

  revalidatePath("/admin/states");
  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard");
}

export async function deleteStateLicenceType(formData: FormData) {
  const supabase = await createClient();
  const id = optionalText(formData.get("id"));
  if (!id) return;
  await supabase.from("record_types").delete().eq("id", id);
  revalidatePath("/admin/states");
  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard");
}
