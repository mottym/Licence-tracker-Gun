import { createClient } from "@/lib/supabase/server";
import { getLicenceStatus, resolveStateRules } from "@/lib/licences/calculate";
import type {
  GunCourseWithStatus,
  GunLicenceWithStatus,
  Jurisdiction,
  Organization,
  RecordType,
  State,
} from "@/types/database";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export async function getStates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("states")
    .select("*, state_groups(*)")
    .order("name", { ascending: true });
  return (data ?? []) as State[];
}

export async function getTaxonomyOptions() {
  const supabase = await createClient();
  const [{ data: jurisdictions }, { data: organizations }, { data: recordTypes }] =
    await Promise.all([
      supabase.from("jurisdictions").select("*, states(*)").order("name", { ascending: true }),
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

export async function getGunLicences(): Promise<GunLicenceWithStatus[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("gun_licences")
    .select("*, states(*, state_groups(*)), jurisdictions(*), record_types(*)")
    .eq("user_id", user.id)
    .order("last_renewed_at", { ascending: false });

  const licencesWithStatus = (data ?? [])
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
      return { ...licence, rules, ...status };
    })
    .filter((value): value is GunLicenceWithStatus => Boolean(value));

  const licencesWithPhotos = await Promise.all(
    licencesWithStatus.map(async (licence) => {
      if (!licence.photo_url) return { ...licence, photo_signed_url: null };
      const { data: signed } = await supabase.storage
        .from("licence-photos")
        .createSignedUrl(licence.photo_url, 3600);
      return { ...licence, photo_signed_url: signed?.signedUrl ?? null };
    }),
  );

  return licencesWithPhotos;
}

export async function getGunCourses(): Promise<GunCourseWithStatus[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("gun_courses")
    .select("*, organizations(*), record_types(*)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  const coursesWithStatus = (data ?? []).map((course) => {
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

  const withSignedCertificates = await Promise.all(
    coursesWithStatus.map(async (course) => {
      if (!course.certificate_url) return { ...course, certificate_signed_url: null };
      const { data: signed } = await supabase.storage
        .from("licence-photos")
        .createSignedUrl(course.certificate_url, 3600);
      return { ...course, certificate_signed_url: signed?.signedUrl ?? null };
    }),
  );

  return withSignedCertificates;
}
