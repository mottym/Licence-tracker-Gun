import { createClient } from "@/lib/supabase/server";
import { DEFAULT_NOTIFY_DAYS } from "@/lib/licences/calculate";
import { saveNotificationSettings } from "./actions";
import { PushSubscribe } from "@/components/notifications/push-subscribe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const notifyDays = prefs?.notify_days_before ?? DEFAULT_NOTIFY_DAYS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification settings</CardTitle>
        <CardDescription>Control reminders for renewal windows and expiry dates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={saveNotificationSettings} className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="email_enabled" defaultChecked={prefs?.email_enabled ?? true} />
            Email notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="push_enabled" defaultChecked={prefs?.push_enabled ?? true} />
            Browser push notifications
          </label>
          <div className="space-y-2">
            <Label>Remind me this many days before renewal opens:</Label>
            <div className="flex flex-wrap gap-2">
              {[60, 30, 14, 7, 1].map((days) => (
                <label key={days} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    name="notify_days_before"
                    value={days}
                    defaultChecked={notifyDays.includes(days)}
                  />
                  {days} days
                </label>
              ))}
            </div>
          </div>
          <Button type="submit">Save settings</Button>
        </form>
        <PushSubscribe />
      </CardContent>
    </Card>
  );
}
