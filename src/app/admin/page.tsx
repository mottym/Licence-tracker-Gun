import Link from "next/link";
import { getStates } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const [states, taxonomyCounts] = await Promise.all([
    getStates(),
    (async () => {
      const supabase = await createClient();
      const [{ count: organizations }, { count: recordTypes }] = await Promise.all([
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("record_types").select("id", { count: "exact", head: true }),
      ]);
      return {
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
          <CardTitle>Course types</CardTitle>
          <CardDescription>Organizations &amp; record types</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{taxonomyCounts.recordTypes}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
          <CardDescription>Manage states and categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><Link className="underline" href="/admin/users">Users &amp; admins — promote or invite</Link></p>
          <p><Link className="underline" href="/admin/states">Manage states &amp; licence types</Link></p>
          <p><Link className="underline" href="/admin/taxonomy">Manage course categories</Link></p>
          <p className="text-slate-500">
            {taxonomyCounts.organizations} organizations · {taxonomyCounts.recordTypes} record types
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
