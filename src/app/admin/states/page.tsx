import { getStates } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { updateStateRules } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AdminStatesPage() {
  const [states, groups] = await Promise.all([
    getStates(),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase.from("state_groups").select("*").order("name");
      return data ?? [];
    })(),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage states</CardTitle>
        <CardDescription>Assign each state to a group or add custom expiry and processing rules.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {states.map((state) => (
          <form key={state.id} action={updateStateRules} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-5">
            <input type="hidden" name="state_id" value={state.id} />
            <div className="text-sm">
              <p className="font-medium">{state.name}</p>
              <p className="text-slate-500">{state.code}</p>
            </div>
            <select
              name="group_id"
              defaultValue={state.group_id ?? ""}
              className="h-10 rounded-md border border-slate-300 px-2 text-sm"
            >
              <option value="">No group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <Input
              name="expiration_months"
              type="number"
              min={1}
              placeholder="Months"
              defaultValue={state.expiration_months ?? ""}
            />
            <Input
              name="renewal_processing_days"
              type="number"
              min={0}
              placeholder="Processing days"
              defaultValue={state.renewal_processing_days ?? ""}
            />
            <Button type="submit" variant="secondary">
              Save
            </Button>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}
