import { createClient } from "@/lib/supabase/server";
import { getLicenceStatus, resolveStateRules } from "@/lib/licences/calculate";
import type { LicenceWithStatus, State } from "@/types/database";

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

export async function getUserLicences(): Promise<LicenceWithStatus[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("licences")
    .select("*, states(*, state_groups(*))")
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
    .filter((value): value is LicenceWithStatus => Boolean(value));

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
