import { supabase } from "@/lib/supabase";
import { getLicenceStatus, resolveStateRules } from "@/lib/status";
import type {
  GunCourseWithStatus,
  GunLicenceWithStatus,
  Jurisdiction,
  Organization,
  RecordType,
  State,
} from "@/types/database";

const PHOTOS_BUCKET = "licence-photos";

export async function fetchTaxonomy() {
  const [{ data: jurisdictions }, { data: organizations }, { data: recordTypes }] =
    await Promise.all([
      supabase
        .from("jurisdictions")
        .select("*, states(*)")
        .order("name", { ascending: true }),
      supabase.from("organizations").select("*").order("name", { ascending: true }),
      supabase
        .from("record_types")
        .select("*, record_categories(*), jurisdictions(*), organizations(*)")
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

  return {
    jurisdictions: (jurisdictions ?? []) as Jurisdiction[],
    organizations: (organizations ?? []) as Organization[],
    recordTypes: (recordTypes ?? []) as RecordType[],
  };
}

export async function fetchGunLicences(): Promise<GunLicenceWithStatus[]> {
  const { data } = await supabase
    .from("gun_licences")
    .select(
      "*, states(*, state_groups(*)), jurisdictions(*, states(*)), record_types(*)",
    )
    .order("last_renewed_at", { ascending: false });

  const computed = (data ?? [])
    .map((licence) => {
      const rules = licence.states ? resolveStateRules(licence.states as State) : null;
      if (!rules) return null;
      const status = getLicenceStatus(
        new Date(licence.last_renewed_at),
        rules,
        {
          manuallyMarkedExpired: Boolean(licence.manually_marked_expired),
          expiresOnBirthday: Boolean(licence.states?.expires_on_birthday),
          birthMonth: licence.birth_month,
          birthDay: licence.birth_day,
        },
      );
      return { ...licence, rules, ...status } as GunLicenceWithStatus;
    })
    .filter((value): value is GunLicenceWithStatus => Boolean(value));

  return Promise.all(
    computed.map(async (licence) => {
      if (!licence.photo_url) return { ...licence, photo_signed_url: null };
      const { data: signed } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .createSignedUrl(licence.photo_url, 3600);
      return { ...licence, photo_signed_url: signed?.signedUrl ?? null };
    }),
  );
}

export async function fetchGunCourses(): Promise<GunCourseWithStatus[]> {
  const { data } = await supabase
    .from("gun_courses")
    .select("*, organizations(*), record_types(*)")
    .order("completed_at", { ascending: false });

  const computed = (data ?? []).map((course) => {
    const type = course.record_types as RecordType | null;
    if (!type?.requires_renewal || !type.expiration_months || type.renewal_processing_days == null) {
      return {
        ...course,
        status: course.manually_marked_expired ? "expired" : "valid",
        expiresAt: null,
        startRenewalBy: null,
        daysUntilRenewalWindow: null,
        daysUntilExpiry: null,
      } as GunCourseWithStatus;
    }

    const referenceDate = new Date(course.renewed_at ?? course.completed_at);
    const status = getLicenceStatus(
      referenceDate,
      {
        expiration_months: type.expiration_months,
        renewal_processing_days: type.renewal_processing_days,
      },
      { manuallyMarkedExpired: Boolean(course.manually_marked_expired) },
    );
    return { ...course, ...status } as GunCourseWithStatus;
  });

  return Promise.all(
    computed.map(async (course) => {
      if (!course.certificate_url) return { ...course, certificate_signed_url: null };
      const { data: signed } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .createSignedUrl(course.certificate_url, 3600);
      return { ...course, certificate_signed_url: signed?.signedUrl ?? null };
    }),
  );
}

async function resolveStateIdFromJurisdiction(
  jurisdictionId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("jurisdictions")
    .select("state_id")
    .eq("id", jurisdictionId)
    .maybeSingle();
  return data?.state_id ?? null;
}

export interface GunLicenceInput {
  jurisdiction_id: string;
  record_type_id: string;
  licence_number: string | null;
  last_renewed_at: string;
  issued_at: string | null;
  birth_month: number | null;
  birth_day: number | null;
  notes: string | null;
}

export async function createGunLicence(input: GunLicenceInput): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const stateId = await resolveStateIdFromJurisdiction(input.jurisdiction_id);
  const { data, error } = await supabase
    .from("gun_licences")
    .insert({
      user_id: auth.user.id,
      jurisdiction_id: input.jurisdiction_id,
      record_type_id: input.record_type_id,
      state_id: stateId,
      licence_number: input.licence_number,
      issued_at: input.issued_at,
      last_renewed_at: input.last_renewed_at,
      birth_month: input.birth_month,
      birth_day: input.birth_day,
      notes: input.notes,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data?.id ?? null;
}

export async function updateGunLicence(id: string, input: GunLicenceInput): Promise<void> {
  const stateId = await resolveStateIdFromJurisdiction(input.jurisdiction_id);
  const { error } = await supabase
    .from("gun_licences")
    .update({
      jurisdiction_id: input.jurisdiction_id,
      record_type_id: input.record_type_id,
      state_id: stateId,
      licence_number: input.licence_number,
      issued_at: input.issued_at,
      last_renewed_at: input.last_renewed_at,
      birth_month: input.birth_month,
      birth_day: input.birth_day,
      notes: input.notes,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function renewGunLicence(id: string, renewedAt: string): Promise<void> {
  const { error } = await supabase
    .from("gun_licences")
    .update({ last_renewed_at: renewedAt, manually_marked_expired: false })
    .eq("id", id);
  if (error) throw error;
}

export async function setGunLicenceExpired(id: string, expired: boolean): Promise<void> {
  const { error } = await supabase
    .from("gun_licences")
    .update({ manually_marked_expired: expired })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteGunLicence(id: string): Promise<void> {
  const { data: existing } = await supabase
    .from("gun_licences")
    .select("photo_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("gun_licences").delete().eq("id", id);
  if (error) throw error;
  if (existing?.photo_url) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([existing.photo_url]);
  }
}

export interface GunCourseInput {
  organization_id: string;
  record_type_id: string;
  completed_at: string;
  renewed_at: string | null;
  notes: string | null;
}

export async function createGunCourse(input: GunCourseInput): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("gun_courses")
    .insert({
      user_id: auth.user.id,
      organization_id: input.organization_id,
      record_type_id: input.record_type_id,
      completed_at: input.completed_at,
      renewed_at: input.renewed_at,
      notes: input.notes,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data?.id ?? null;
}

export async function updateGunCourse(id: string, input: GunCourseInput): Promise<void> {
  const { error } = await supabase
    .from("gun_courses")
    .update({
      organization_id: input.organization_id,
      record_type_id: input.record_type_id,
      completed_at: input.completed_at,
      renewed_at: input.renewed_at,
      notes: input.notes,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function renewGunCourse(id: string, renewedAt: string): Promise<void> {
  const { error } = await supabase
    .from("gun_courses")
    .update({ renewed_at: renewedAt, manually_marked_expired: false })
    .eq("id", id);
  if (error) throw error;
}

export async function setGunCourseExpired(id: string, expired: boolean): Promise<void> {
  const { error } = await supabase
    .from("gun_courses")
    .update({ manually_marked_expired: expired })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteGunCourse(id: string): Promise<void> {
  const { data: existing } = await supabase
    .from("gun_courses")
    .select("certificate_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("gun_courses").delete().eq("id", id);
  if (error) throw error;
  if (existing?.certificate_url) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([existing.certificate_url]);
  }
}

export async function uploadAttachment(params: {
  userId: string;
  subdir: "gun-licences" | "gun-courses";
  recordId: string;
  uri: string;
  mimeType: string;
}): Promise<string | null> {
  const { userId, subdir, recordId, uri, mimeType } = params;
  const extension = mimeType.split("/")[1] ?? "jpg";
  const path = `${userId}/${subdir}/${recordId}-${Date.now()}.${extension}`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: mimeType,
  });
  if (error) return null;
  return path;
}

export async function attachPhotoToGunLicence(id: string, photoPath: string) {
  await supabase.from("gun_licences").update({ photo_url: photoPath }).eq("id", id);
}

export async function attachCertificateToGunCourse(id: string, path: string) {
  await supabase.from("gun_courses").update({ certificate_url: path }).eq("id", id);
}

export async function removeGunLicencePhoto(id: string, photoPath: string | null) {
  if (photoPath) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([photoPath]);
  }
  await supabase.from("gun_licences").update({ photo_url: null }).eq("id", id);
}

export async function removeGunCourseCertificate(id: string, photoPath: string | null) {
  if (photoPath) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([photoPath]);
  }
  await supabase.from("gun_courses").update({ certificate_url: null }).eq("id", id);
}
