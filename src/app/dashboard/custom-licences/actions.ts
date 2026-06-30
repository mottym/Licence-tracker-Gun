"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PHOTOS_BUCKET = "licence-photos";

function optionalText(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function requiredText(value: FormDataEntryValue | null): string | null {
  const text = optionalText(value);
  return text;
}

function parseReminderDays(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || value.trim().length === 0) return 60;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 60;
  return Math.min(365, Math.max(0, parsed));
}

async function uploadPhoto(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  recordId: string;
  file: FormDataEntryValue | null;
}) {
  const { supabase, userId, recordId, file } = params;
  if (!(file instanceof File) || file.size === 0) return null;
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${userId}/custom-licences/${recordId}-${Date.now()}.${(extension ?? "jpg").toLowerCase()}`;
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) return null;
  return path;
}

export async function createCustomLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = requiredText(formData.get("name"));
  const expiresAt = requiredText(formData.get("expires_at"));
  if (!name || !expiresAt) return;

  const { data: created } = await supabase
    .from("custom_licences")
    .insert({
      user_id: user.id,
      name,
      issuer: optionalText(formData.get("issuer")),
      licence_number: optionalText(formData.get("licence_number")),
      issued_at: optionalText(formData.get("issued_at")),
      expires_at: expiresAt,
      renewal_reminder_days: parseReminderDays(formData.get("renewal_reminder_days")),
      auto_renew: formData.get("auto_renew") === "on",
      notes: optionalText(formData.get("notes")),
    })
    .select("id")
    .single();

  if (created?.id) {
    const photoPath = await uploadPhoto({
      supabase,
      userId: user.id,
      recordId: created.id,
      file: formData.get("photo"),
    });
    if (photoPath) {
      await supabase
        .from("custom_licences")
        .update({ photo_url: photoPath })
        .eq("id", created.id);
    }
  }

  revalidatePath("/dashboard/custom-licences");
  revalidatePath("/dashboard");
}

export async function updateCustomLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const name = requiredText(formData.get("name"));
  const expiresAt = requiredText(formData.get("expires_at"));
  if (!recordId || !name || !expiresAt) return;

  const { data: existing } = await supabase
    .from("custom_licences")
    .select("photo_url")
    .eq("id", recordId)
    .eq("user_id", user.id)
    .single();

  const removePhoto = formData.get("remove_photo") === "on";
  const newPhotoPath = await uploadPhoto({
    supabase,
    userId: user.id,
    recordId,
    file: formData.get("photo"),
  });

  const photoUrl = removePhoto ? null : (newPhotoPath ?? existing?.photo_url ?? null);
  if ((removePhoto || newPhotoPath) && existing?.photo_url) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([existing.photo_url]);
  }

  await supabase
    .from("custom_licences")
    .update({
      name,
      issuer: optionalText(formData.get("issuer")),
      licence_number: optionalText(formData.get("licence_number")),
      issued_at: optionalText(formData.get("issued_at")),
      expires_at: expiresAt,
      renewal_reminder_days: parseReminderDays(formData.get("renewal_reminder_days")),
      auto_renew: formData.get("auto_renew") === "on",
      notes: optionalText(formData.get("notes")),
      photo_url: photoUrl,
    })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/custom-licences");
  revalidatePath("/dashboard");
}

export async function renewCustomLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const newExpiresAt = optionalText(formData.get("expires_at"));
  if (!recordId || !newExpiresAt) return;

  await supabase
    .from("custom_licences")
    .update({ expires_at: newExpiresAt, manually_marked_expired: false })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/custom-licences");
  revalidatePath("/dashboard");
}

export async function confirmExpiredCustomLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const value = formData.get("manually_marked_expired") === "true";

  await supabase
    .from("custom_licences")
    .update({ manually_marked_expired: value })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/custom-licences");
  revalidatePath("/dashboard");
}

export async function deleteCustomLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const { data: existing } = await supabase
    .from("custom_licences")
    .select("photo_url")
    .eq("id", recordId)
    .eq("user_id", user.id)
    .single();

  await supabase
    .from("custom_licences")
    .delete()
    .eq("id", recordId)
    .eq("user_id", user.id);

  if (existing?.photo_url) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([existing.photo_url]);
  }

  revalidatePath("/dashboard/custom-licences");
  revalidatePath("/dashboard");
}
