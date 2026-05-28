import { NextResponse } from "next/server";
import { format } from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import { getLicenceStatus, shouldNotifyToday, DEFAULT_NOTIFY_DAYS } from "@/lib/licences/calculate";
import { sendRenewalEmail } from "@/lib/notifications/email";
import { sendPushNotification } from "@/lib/notifications/push";
import type { State } from "@/types/database";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data: licences } = await supabase
    .from("gun_licences")
    .select("*, states(*, state_groups(*)), profiles(email), notification_preferences(*), record_types(*)");

  let sent = 0;

  for (const licence of licences ?? []) {
    if (!licence.states) continue;
    if (!licence.legacy_licence_id) continue;
    const rules = {
      expiration_months:
        licence.states.expiration_months ?? (licence.states as State).state_groups?.expiration_months,
      renewal_processing_days:
        licence.states.renewal_processing_days ??
        (licence.states as State).state_groups?.renewal_processing_days,
    };
    if (!rules.expiration_months || rules.renewal_processing_days == null) continue;

    const status = getLicenceStatus(new Date(licence.last_renewed_at), rules, {
      manuallyMarkedExpired: Boolean(licence.manually_marked_expired),
      expiresOnBirthday: Boolean(licence.states?.expires_on_birthday),
      birthMonth: licence.birth_month,
      birthDay: licence.birth_day,
    });
    const prefs = licence.notification_preferences?.[0];
    const notifyDays = prefs?.notify_days_before ?? DEFAULT_NOTIFY_DAYS;
    const type = shouldNotifyToday(status.daysUntilRenewalWindow, notifyDays);
    if (!type) continue;

    const { data: existing } = await supabase
      .from("notification_log")
      .select("id")
      .eq("licence_id", licence.legacy_licence_id ?? licence.id)
      .eq("channel", "email")
      .eq("notification_type", type)
      .maybeSingle();

    if (existing) continue;

    if (prefs?.email_enabled !== false && licence.profiles?.email) {
      await sendRenewalEmail({
        to: licence.profiles.email,
        stateName: licence.states.name,
        renewalDate: format(status.startRenewalBy, "MMM d, yyyy"),
        expiryDate: format(status.expiresAt, "MMM d, yyyy"),
      });
      sent += 1;
      await supabase.from("notification_log").insert({
        user_id: licence.user_id,
        licence_id: licence.legacy_licence_id ?? licence.id,
        channel: "email",
        notification_type: type,
      });
    }

    if (prefs?.push_enabled !== false) {
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", licence.user_id);
      for (const sub of subscriptions ?? []) {
        await sendPushNotification({
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
          title: `${licence.states.name} renewal reminder`,
          body: `Renewal window opens ${format(status.startRenewalBy, "MMM d, yyyy")}.`,
        });
        await supabase.from("notification_log").insert({
          user_id: licence.user_id,
          licence_id: licence.legacy_licence_id ?? licence.id,
          channel: "push",
          notification_type: type,
        });
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
