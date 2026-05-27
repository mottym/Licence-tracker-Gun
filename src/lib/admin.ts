import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function requireAdmin(): Promise<{
  profile: Profile;
  userId: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return { profile: profile as Profile, userId: user.id };
}
