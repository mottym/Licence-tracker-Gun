"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PHOTOS_BUCKET = "licence-photos";

function optionalText(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

async function uploadCertificate(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  recordId: string;
  file: FormDataEntryValue | null;
}) {
  const { supabase, userId, recordId, file } = params;
  if (!(file instanceof File) || file.size === 0) return null;
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${userId}/gun-courses/${recordId}-${Date.now()}.${(extension ?? "jpg").toLowerCase()}`;
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) return null;
  return path;
}

export async function createGunCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: created } = await supabase
    .from("gun_courses")
    .insert({
      user_id: user.id,
      organization_id: formData.get("organization_id"),
      record_type_id: formData.get("record_type_id"),
      completed_at: formData.get("completed_at"),
      renewed_at: optionalText(formData.get("renewed_at")),
      notes: optionalText(formData.get("notes")),
    })
    .select("id")
    .single();

  if (created?.id) {
    const certificatePath = await uploadCertificate({
      supabase,
      userId: user.id,
      recordId: created.id,
      file: formData.get("certificate"),
    });
    if (certificatePath) {
      await supabase.from("gun_courses").update({ certificate_url: certificatePath }).eq("id", created.id);
    }
  }

  revalidatePath("/dashboard/gun-courses");
  revalidatePath("/dashboard");
}

export async function updateGunCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const { data: existing } = await supabase
    .from("gun_courses")
    .select("certificate_url")
    .eq("id", recordId)
    .eq("user_id", user.id)
    .single();

  const removeCertificate = formData.get("remove_certificate") === "on";
  const newCertificatePath = await uploadCertificate({
    supabase,
    userId: user.id,
    recordId,
    file: formData.get("certificate"),
  });

  const certificateUrl = removeCertificate ? null : (newCertificatePath ?? existing?.certificate_url ?? null);
  if ((removeCertificate || newCertificatePath) && existing?.certificate_url) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([existing.certificate_url]);
  }

  await supabase
    .from("gun_courses")
    .update({
      organization_id: formData.get("organization_id"),
      record_type_id: formData.get("record_type_id"),
      completed_at: formData.get("completed_at"),
      renewed_at: optionalText(formData.get("renewed_at")),
      notes: optionalText(formData.get("notes")),
      certificate_url: certificateUrl,
    })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/gun-courses");
  revalidatePath("/dashboard");
}

export async function renewGunCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const renewedAt = optionalText(formData.get("renewed_at"));
  if (!renewedAt) return;

  await supabase
    .from("gun_courses")
    .update({ renewed_at: renewedAt, manually_marked_expired: false })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/gun-courses");
  revalidatePath("/dashboard");
}

export async function confirmExpiredGunCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const value = formData.get("manually_marked_expired") === "true";

  await supabase
    .from("gun_courses")
    .update({ manually_marked_expired: value })
    .eq("id", recordId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/gun-courses");
  revalidatePath("/dashboard");
}

export async function deleteGunCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const recordId = String(formData.get("record_id"));
  const { data: existing } = await supabase
    .from("gun_courses")
    .select("certificate_url")
    .eq("id", recordId)
    .eq("user_id", user.id)
    .single();

  await supabase.from("gun_courses").delete().eq("id", recordId).eq("user_id", user.id);
  if (existing?.certificate_url) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([existing.certificate_url]);
  }

  revalidatePath("/dashboard/gun-courses");
  revalidatePath("/dashboard");
}
