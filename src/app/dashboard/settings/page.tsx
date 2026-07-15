import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data";
import { DEFAULT_NOTIFY_DAYS } from "@/lib/licences/calculate";
import { saveGeneralSettings, saveNotificationSettings } from "./actions";
import { PushSubscribe } from "@/components/notifications/push-subscribe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, { data: prefs }] = await Promise.all([
    getProfile(),
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user?.id ?? "")
      .maybeSingle(),
  ]);

  const notifyDays = prefs?.notify_days_before ?? DEFAULT_NOTIFY_DAYS;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General settings</CardTitle>
          <CardDescription>
            Your birthday is used when a license type expires on your birthday.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveGeneralSettings} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="birth-month">Birth month</Label>
                <Select
                  id="birth-month"
                  name="birth_month"
                  defaultValue={profile?.birth_month ? String(profile.birth_month) : ""}
                >
                  <option value="">Not set</option>
                  {MONTHS.map((month, idx) => (
                    <option key={month} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birth-day">Birth day</Label>
                <Input
                  id="birth-day"
                  name="birth_day"
                  type="number"
                  min={1}
                  max={31}
                  defaultValue={profile?.birth_day ? String(profile.birth_day) : ""}
                  placeholder="e.g. 15"
                />
              </div>
            </div>
            <SubmitButton>Save general settings</SubmitButton>
          </form>
        </CardContent>
      </Card>

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
            <Button type="submit">Save notification settings</Button>
          </form>
          <PushSubscribe />
        </CardContent>
      </Card>
    </div>
  );
}
