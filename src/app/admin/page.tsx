import Link from "next/link";
import { getStates } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const [states, groups] = await Promise.all([
    getStates(),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase.from("state_groups").select("*");
      return data ?? [];
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
          <CardDescription>Manage rules and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><Link className="underline" href="/admin/groups">Manage groups</Link></p>
          <p><Link className="underline" href="/admin/states">Manage states</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
