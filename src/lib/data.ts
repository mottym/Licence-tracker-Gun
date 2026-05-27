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

  return (data ?? [])
    .map((licence) => {
      const rules = licence.states ? resolveStateRules(licence.states as State) : null;
      if (!rules) return null;
      const status = getLicenceStatus(new Date(licence.last_renewed_at), rules);
      return { ...licence, rules, ...status };
    })
    .filter((value): value is LicenceWithStatus => Boolean(value));
}
