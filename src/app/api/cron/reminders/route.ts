import { NextResponse } from "next/server";
import { format } from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import {
  getLicenceStatus,
  resolveGunLicenceRules,
  rollForwardCustomExpiry,
  rollForwardLastRenewed,
  shouldNotifyToday,
  DEFAULT_NOTIFY_DAYS,
} from "@/lib/licences/calculate";
import { sendRenewalEmail } from "@/lib/notifications/email";
import { sendPushNotification } from "@/lib/notifications/push";
import type { RecordType, State } from "@/types/database";

function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data: licences } = await supabase
    .from("gun_licences")
    .select("*, states(*), profiles(email), notification_preferences(*), record_types(*)");

  let sent = 0;
  let autoRenewed = 0;

  for (const licence of licences ?? []) {
    if (!licence.states) continue;
    const rules = resolveGunLicenceRules(
      licence.record_types as RecordType | null,
      licence.states as State | null,
    );
    if (!rules) continue;

    const renewalOptions = {
      expiresOnBirthday: Boolean(licence.states?.expires_on_birthday),
      birthMonth: licence.birth_month,
      birthDay: licence.birth_day,
    };

    // Auto-renew: advance the licence forward so it never lapses, then skip reminders.
    // Honours both the per-licence flag and the state-level default set by admins.
    if (licence.auto_renew || (licence.states as State)?.auto_renew) {
      const rolled = rollForwardLastRenewed(
        new Date(licence.last_renewed_at),
        rules,
        renewalOptions,
      );
      const rolledIso = toIsoDate(rolled);
      if (rolledIso !== licence.last_renewed_at) {
        await supabase
          .from("gun_licences")
          .update({ last_renewed_at: rolledIso, manually_marked_expired: false })
          .eq("id", licence.id);
        autoRenewed += 1;
      }
      continue;
    }

    if (!licence.legacy_licence_id) continue;

    const status = getLicenceStatus(new Date(licence.last_renewed_at), rules, {
      manuallyMarkedExpired: Boolean(licence.manually_marked_expired),
      ...renewalOptions,
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

  // Custom licences: roll the expiry forward for any flagged for auto-renew.
  const { data: customLicences } = await supabase
    .from("custom_licences")
    .select("id, issued_at, expires_at, auto_renew, manually_marked_expired");

  for (const custom of customLicences ?? []) {
    if (!custom.auto_renew || !custom.issued_at) continue;
    const rolled = rollForwardCustomExpiry(
      new Date(custom.issued_at),
      new Date(custom.expires_at),
    );
    const rolledIso = toIsoDate(rolled);
    if (rolledIso !== custom.expires_at) {
      await supabase
        .from("custom_licences")
        .update({ expires_at: rolledIso, manually_marked_expired: false })
        .eq("id", custom.id);
      autoRenewed += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, autoRenewed });
}
