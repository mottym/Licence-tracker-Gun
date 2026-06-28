import Link from "next/link";
import { getStates } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const [states, groups, taxonomyCounts] = await Promise.all([
    getStates(),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase.from("state_groups").select("*");
      return data ?? [];
    })(),
    (async () => {
      const supabase = await createClient();
      const [{ count: jurisdictions }, { count: organizations }, { count: recordTypes }] = await Promise.all([
        supabase.from("jurisdictions").select("id", { count: "exact", head: true }),
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("record_types").select("id", { count: "exact", head: true }),
      ]);
      return {
        jurisdictions: jurisdictions ?? 0,
        organizations: organizations ?? 0,
        recordTypes: recordTypes ?? 0,
      };
    })(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>States configured</CardTitle>
          <CardDescription>Total states in system</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{states.length}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>State groups</CardTitle>
          <CardDescription>Reusable rule sets</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{groups.length}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
          <CardDescription>Manage rules, states, and categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><Link className="underline" href="/admin/users">Users &amp; admins — promote or invite</Link></p>
          <p><Link className="underline" href="/admin/groups">Manage groups</Link></p>
          <p><Link className="underline" href="/admin/states">Manage states</Link></p>
          <p><Link className="underline" href="/admin/taxonomy">Manage categories</Link></p>
          <p className="text-slate-500">
            {taxonomyCounts.jurisdictions} jurisdictions · {taxonomyCounts.organizations} organizations ·{" "}
            {taxonomyCounts.recordTypes} record types
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
