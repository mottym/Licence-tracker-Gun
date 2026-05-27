import { createClient } from "@/lib/supabase/server";
import { createStateGroup } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminGroupsPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase.from("state_groups").select("*").order("name");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create state group</CardTitle>
          <CardDescription>Group states with the same expiry and renewal processing rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createStateGroup} className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration_months">Expiration (months)</Label>
              <Input id="expiration_months" name="expiration_months" type="number" min={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renewal_processing_days">Renewal processing (days)</Label>
              <Input id="renewal_processing_days" name="renewal_processing_days" type="number" min={0} required />
            </div>
            <Button type="submit">Save group</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(groups ?? []).map((group) => (
            <div key={group.id} className="rounded-md border border-slate-200 p-3 text-sm">
              <p className="font-medium">{group.name}</p>
              <p className="text-slate-600">
                Expires after {group.expiration_months} months, renewal processing {group.renewal_processing_days} days
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
