"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function optionalText(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createJurisdiction(formData: FormData) {
  const supabase = await createClient();
  const name = optionalText(formData.get("name"));
  const code = optionalText(formData.get("code"));
  if (!name || !code) return;
  await supabase.from("jurisdictions").insert({
    name,
    code: code.toLowerCase(),
    state_id: optionalText(formData.get("state_id")),
    is_city: formData.get("is_city") === "on",
  });
  revalidatePath("/admin/taxonomy");
  revalidatePath("/dashboard/gun-licences");
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const name = optionalText(formData.get("name"));
  const code = optionalText(formData.get("code"));
  if (!name || !code) return;
  await supabase.from("organizations").insert({ name, code: code.toLowerCase() });
  revalidatePath("/admin/taxonomy");
  revalidatePath("/dashboard/gun-courses");
}

export async function createRecordType(formData: FormData) {
  const supabase = await createClient();
  const name = optionalText(formData.get("name"));
  const key = optionalText(formData.get("key"));
  const categoryId = optionalText(formData.get("category_id"));
  if (!name || !key || !categoryId) return;

  await supabase.from("record_types").insert({
    name,
    key: key.toLowerCase(),
    category_id: categoryId,
    jurisdiction_id: optionalText(formData.get("jurisdiction_id")),
    organization_id: optionalText(formData.get("organization_id")),
    requires_renewal: formData.get("requires_renewal") === "on",
    expiration_months: optionalNumber(formData.get("expiration_months")),
    renewal_processing_days: optionalNumber(formData.get("renewal_processing_days")),
    is_active: formData.get("is_active") !== "off",
  });

  revalidatePath("/admin/taxonomy");
  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard/gun-courses");
}

export async function updateRecordType(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase
    .from("record_types")
    .update({
      name: optionalText(formData.get("name")),
      key: optionalText(formData.get("key"))?.toLowerCase(),
      category_id: optionalText(formData.get("category_id")),
      jurisdiction_id: optionalText(formData.get("jurisdiction_id")),
      organization_id: optionalText(formData.get("organization_id")),
      requires_renewal: formData.get("requires_renewal") === "on",
      expiration_months: optionalNumber(formData.get("expiration_months")),
      renewal_processing_days: optionalNumber(formData.get("renewal_processing_days")),
      is_active: formData.get("is_active") !== "off",
    })
    .eq("id", id);

  revalidatePath("/admin/taxonomy");
  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard/gun-courses");
}

export async function deleteRecordType(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase.from("record_types").delete().eq("id", id);
  revalidatePath("/admin/taxonomy");
  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard/gun-courses");
}
