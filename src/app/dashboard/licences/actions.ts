"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LICENCE_TYPES, type LicenceType } from "@/lib/licences/types";

const LICENCE_PHOTOS_BUCKET = "licence-photos";
const allowedTypes = new Set<string>(LICENCE_TYPES.map((entry) => entry.value));

function asOptionalText(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseLicenceType(value: FormDataEntryValue | null): LicenceType {
  if (typeof value === "string" && allowedTypes.has(value)) {
    return value as LicenceType;
  }
  return "drivers_licence";
}

async function uploadLicencePhoto(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  licenceId: string;
  file: FormDataEntryValue | null;
}) {
  const { supabase, userId, licenceId, file } = params;
  if (!(file instanceof File) || file.size === 0) return null;
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const safeExt = (extension ?? "jpg").toLowerCase();
  const path = `${userId}/${licenceId}-${Date.now()}.${safeExt}`;
  const { error } = await supabase.storage.from(LICENCE_PHOTOS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) return null;
  return path;
}

async function deletePhotoIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null | undefined,
) {
  if (!path) return;
  await supabase.storage.from(LICENCE_PHOTOS_BUCKET).remove([path]);
}

export async function createLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const licenceType = parseLicenceType(formData.get("type"));
  const { data: created, error } = await supabase
    .from("licences")
    .insert({
    user_id: user.id,
    state_id: formData.get("state_id"),
    last_renewed_at: formData.get("last_renewed_at"),
      type: licenceType,
      licence_number: asOptionalText(formData.get("licence_number")),
      notes: asOptionalText(formData.get("notes")),
    })
    .select("id")
    .single();

  if (!error && created?.id) {
    const photoPath = await uploadLicencePhoto({
      supabase,
      userId: user.id,
      licenceId: created.id,
      file: formData.get("photo"),
    });
    if (photoPath) {
      await supabase.from("licences").update({ photo_url: photoPath }).eq("id", created.id);
    }
  }

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

export async function updateLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const licenceId = String(formData.get("licence_id"));
  const licenceType = parseLicenceType(formData.get("type"));

  const { data: existing } = await supabase
    .from("licences")
    .select("photo_url")
    .eq("id", licenceId)
    .eq("user_id", user.id)
    .single();

  const shouldRemovePhoto = formData.get("remove_photo") === "on";
  const newPhotoPath = await uploadLicencePhoto({
    supabase,
    userId: user.id,
    licenceId,
    file: formData.get("photo"),
  });

  const updatedPhotoPath = shouldRemovePhoto ? null : (newPhotoPath ?? existing?.photo_url ?? null);
  if ((shouldRemovePhoto || newPhotoPath) && existing?.photo_url) {
    await deletePhotoIfPresent(supabase, existing.photo_url);
  }

  await supabase
    .from("licences")
    .update({
      state_id: formData.get("state_id"),
      last_renewed_at: formData.get("last_renewed_at"),
      type: licenceType,
      licence_number: asOptionalText(formData.get("licence_number")),
      notes: asOptionalText(formData.get("notes")),
      photo_url: updatedPhotoPath,
    })
    .eq("id", licenceId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/licences");
  revalidatePath("/dashboard");
}

export async function deleteLicence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const licenceId = String(formData.get("licence_id"));

  const { data: existing } = await supabase
    .from("licences")
    .select("photo_url")
    .eq("id", licenceId)
    .eq("user_id", user.id)
    .single();

  await supabase.from("licences").delete().eq("id", licenceId).eq("user_id", user.id);
  await deletePhotoIfPresent(supabase, existing?.photo_url);
  revalidatePath("/dashboard/licences");
  revalidatePath("/dashboard");
}
