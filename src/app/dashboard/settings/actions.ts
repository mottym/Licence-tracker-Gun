"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_NOTIFY_DAYS } from "@/lib/licences/calculate";

function optionalNumber(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function saveNotificationSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const notifyDaysBefore = formData
    .getAll("notify_days_before")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      email_enabled: formData.get("email_enabled") === "on",
      push_enabled: formData.get("push_enabled") === "on",
      notify_days_before: notifyDaysBefore.length ? notifyDaysBefore : DEFAULT_NOTIFY_DAYS,
    })
    .eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
}

export async function saveGeneralSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const birthMonth = optionalNumber(formData.get("birth_month"));
  const birthDay = optionalNumber(formData.get("birth_day"));

  await supabase
    .from("profiles")
    .update({
      birth_month: birthMonth,
      birth_day: birthDay,
    })
    .eq("id", user.id);

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/gun-licences");
  revalidatePath("/dashboard");
}
