"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PHOTOS_BUCKET = "licence-photos";

function optionalText(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
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
  const path = `${userId}/gun-licences/${recordId}-${Date.now()}.${(extension ?? "jpg").toLowerCase()}`;
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) return null;
  return path;
}

async function resolveStateIdFromJurisdiction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jurisdictionId: FormDataEntryValue | null,
): Promise<string | null> {
  if (typeof jurisdictionId !== "string" || jurisdictionId.length === 0) return null;
  const { data } = await supabase
    .from("jurisdictions")
    .select("state_id")
    .eq("id", jurisdictionId)
    .maybeSingle();
  return data?.state_id ?? null;
}

export async function createGunLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const jurisdictionId = formData.get("jurisdiction_id");
  const derivedStateId = await resolveStateIdFromJurisdiction(supabase, jurisdictionId);

  const { data: created } = await supabase
    .from("gun_licences")
    .insert({
      user_id: user.id,
      state_id: derivedStateId,
      jurisdiction_id: jurisdictionId,
      record_type_id: formData.get("record_type_id"),
      issued_at: optionalText(formData.get("issued_at")),
      last_renewed_at: formData.get("last_renewed_at"),
      licence_number: optionalText(formData.get("licence_number")),
      notes: optionalText(formData.get("notes")),
      birth_month: formData.get("birth_month") ? Number(formData.get("birth_month")) : null,
      birth_day: formData.get("birth_day") ? Number(formData.get("birth_day")) : null,
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
      await supabase.from("gun_licences").update({ photo_url: photoPath }).eq("id", created.id);
    }
  }

  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard");
}

export async function updateGunLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const { data: existing } = await supabase
    .from("gun_licences")
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

  const jurisdictionId = formData.get("jurisdiction_id");
  const derivedStateId = await resolveStateIdFromJurisdiction(supabase, jurisdictionId);

  await supabase
    .from("gun_licences")
    .update({
      state_id: derivedStateId,
      jurisdiction_id: jurisdictionId,
      record_type_id: formData.get("record_type_id"),
      issued_at: optionalText(formData.get("issued_at")),
      last_renewed_at: formData.get("last_renewed_at"),
      licence_number: optionalText(formData.get("licence_number")),
      notes: optionalText(formData.get("notes")),
      birth_month: formData.get("birth_month") ? Number(formData.get("birth_month")) : null,
      birth_day: formData.get("birth_day") ? Number(formData.get("birth_day")) : null,
      photo_url: photoUrl,
    })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard");
}

export async function renewGunLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const renewedAt = optionalText(formData.get("renewed_at"));
  if (!renewedAt) return;

  await supabase
    .from("gun_licences")
    .update({ last_renewed_at: renewedAt, manually_marked_expired: false })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard");
}

export async function confirmExpiredGunLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const value = formData.get("manually_marked_expired") === "true";
  await supabase
    .from("gun_licences")
    .update({ manually_marked_expired: value })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard");
}

export async function deleteGunLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const { data: existing } = await supabase
    .from("gun_licences")
    .select("photo_url")
    .eq("id", recordId)
    .eq("user_id", user.id)
    .single();

  await supabase.from("gun_licences").delete().eq("id", recordId).eq("user_id", user.id);
  if (existing?.photo_url) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([existing.photo_url]);
  }

  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard");
}
