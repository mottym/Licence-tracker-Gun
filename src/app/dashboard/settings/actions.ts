"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_NOTIFY_DAYS } from "@/lib/licences/calculate";

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
