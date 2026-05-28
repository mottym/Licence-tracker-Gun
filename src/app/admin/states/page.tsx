import { getStates } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { createState, deleteState, updateStateRules } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/licences/confirm-delete-button";

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
        <CardDescription>Add custom states and assign each state to a group or custom renewal rules.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <form action={createState} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-7">
          <Input name="name" placeholder="State name" required />
          <Input name="code" placeholder="Code" maxLength={8} required />
          <select name="group_id" className="h-10 rounded-md border border-slate-300 px-2 text-sm">
            <option value="">No group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <Input name="expiration_months" type="number" min={1} placeholder="Months" />
          <Input name="renewal_processing_days" type="number" min={0} placeholder="Processing days" />
          <Input name="gun_renewal_url" type="url" placeholder="Gun renewal URL" />
          <Button type="submit">Add custom state</Button>
        </form>

        {states.map((state) => (
          <div key={state.id} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-8">
            <form action={updateStateRules} className="contents">
              <input type="hidden" name="state_id" value={state.id} />
              <Input name="name" defaultValue={state.name} required />
              <Input name="code" defaultValue={state.code} maxLength={8} required />
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
              <Input
                name="gun_renewal_url"
                type="url"
                placeholder="Gun renewal URL"
                defaultValue={state.gun_renewal_url ?? ""}
              />
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </form>
            {state.is_custom ? (
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-slate-500">Custom</span>
                <form action={deleteState}>
                  <input type="hidden" name="state_id" value={state.id} />
                  <ConfirmDeleteButton
                    type="submit"
                    variant="destructive"
                    size="sm"
                    message="Delete this custom state?"
                  >
                    Delete
                  </ConfirmDeleteButton>
                </form>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Default</div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
