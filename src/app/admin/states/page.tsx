import { getStates } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { createState, deleteState, updateStateRules } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { ConfirmDeleteButton } from "@/components/licences/confirm-delete-button";
import { cn } from "@/lib/utils";

export default async function AdminStatesPage() {
  const [states, groups] = await Promise.all([
    getStates(),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase.from("state_groups").select("*").order("name");
      return data ?? [];
    })(),
  ]);

  const customCount = states.filter((s) => s.is_custom).length;
  const groupedCount = states.filter((s) => s.group_id).length;
  const birthdayCount = states.filter((s) => s.expires_on_birthday).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">State manager</h1>
          <p className="text-sm text-slate-500">
            Configure states, assign renewal groups, and override expiry rules per state.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <SummaryPill label="Total states" value={states.length} />
          <SummaryPill label="Custom" value={customCount} />
          <SummaryPill label="In a group" value={groupedCount} />
          <SummaryPill label="Birthday expiry" value={birthdayCount} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a custom state</CardTitle>
          <CardDescription>
            Create a new state that isn&apos;t in the default list. Optional overrides apply only to this state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createState} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="State name" htmlFor="new-name" required>
                <Input id="new-name" name="name" placeholder="e.g. Puerto Rico" required />
              </Field>
              <Field label="Code" htmlFor="new-code" required hint="Up to 8 characters">
                <Input id="new-code" name="code" placeholder="e.g. PR" maxLength={8} required />
              </Field>
              <Field label="Group" htmlFor="new-group" hint="Inherits group rules unless overridden">
                <SelectInput id="new-group" name="group_id" defaultValue="">
                  <option value="">No group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Gun renewal URL" htmlFor="new-url" hint="External link shown to users">
                <Input id="new-url" name="gun_renewal_url" type="url" placeholder="https://" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Expiration (months)" htmlFor="new-months" hint="Overrides group value">
                <Input id="new-months" name="expiration_months" type="number" min={1} placeholder="e.g. 60" />
              </Field>
              <Field
                label="Renewal processing (days)"
                htmlFor="new-processing"
                hint="Window opens this many days before expiry"
              >
                <Input
                  id="new-processing"
                  name="renewal_processing_days"
                  type="number"
                  min={0}
                  placeholder="e.g. 90"
                />
              </Field>
              <Field label="Birthday expiry">
                <Checkbox name="expires_on_birthday" label="Expires on user&apos;s birthday" />
              </Field>
            </div>

            <div className="flex justify-end">
              <SubmitButton pendingLabel="Adding...">Add custom state</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Existing states</CardTitle>
              <CardDescription>Update names, codes, group assignments, and renewal overrides.</CardDescription>
            </div>
            <p className="text-xs text-slate-500">{states.length} states</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {states.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No states yet. Add one above to get started.
            </p>
          ) : (
            states.map((state) => {
              const group = groups.find((g) => g.id === state.group_id) ?? null;
              const effectiveMonths = state.expiration_months ?? group?.expiration_months ?? null;
              const effectiveDays =
                state.renewal_processing_days ?? group?.renewal_processing_days ?? null;

              return (
                <div
                  key={state.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
                        {state.code}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{state.name}</p>
                        <p className="text-xs text-slate-500">
                          {effectiveMonths != null && effectiveDays != null
                            ? `Renews every ${effectiveMonths} mo · ${effectiveDays}-day processing window`
                            : "No renewal rules configured"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={state.is_custom ? "amber" : "slate"}>
                        {state.is_custom ? "Custom" : "Default"}
                      </Badge>
                      {group ? <Badge tone="indigo">{group.name}</Badge> : null}
                      {state.expires_on_birthday ? <Badge tone="rose">Birthday expiry</Badge> : null}
                    </div>
                  </div>

                  <form action={updateStateRules} className="space-y-4">
                    <input type="hidden" name="state_id" value={state.id} />

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="State name" htmlFor={`name-${state.id}`} required>
                        <Input id={`name-${state.id}`} name="name" defaultValue={state.name} required />
                      </Field>
                      <Field label="Code" htmlFor={`code-${state.id}`} required>
                        <Input
                          id={`code-${state.id}`}
                          name="code"
                          defaultValue={state.code}
                          maxLength={8}
                          required
                        />
                      </Field>
                      <Field label="Group" htmlFor={`group-${state.id}`}>
                        <SelectInput
                          id={`group-${state.id}`}
                          name="group_id"
                          defaultValue={state.group_id ?? ""}
                        >
                          <option value="">No group</option>
                          {groups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </SelectInput>
                      </Field>
                      <Field label="Gun renewal URL" htmlFor={`url-${state.id}`}>
                        <Input
                          id={`url-${state.id}`}
                          name="gun_renewal_url"
                          type="url"
                          placeholder="https://"
                          defaultValue={state.gun_renewal_url ?? ""}
                        />
                      </Field>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Field
                        label="Expiration (months)"
                        htmlFor={`months-${state.id}`}
                        hint={group ? `Group default: ${group.expiration_months}` : "No group default"}
                      >
                        <Input
                          id={`months-${state.id}`}
                          name="expiration_months"
                          type="number"
                          min={1}
                          placeholder={group ? String(group.expiration_months) : "e.g. 60"}
                          defaultValue={state.expiration_months ?? ""}
                        />
                      </Field>
                      <Field
                        label="Renewal processing (days)"
                        htmlFor={`days-${state.id}`}
                        hint={
                          group ? `Group default: ${group.renewal_processing_days}` : "No group default"
                        }
                      >
                        <Input
                          id={`days-${state.id}`}
                          name="renewal_processing_days"
                          type="number"
                          min={0}
                          placeholder={group ? String(group.renewal_processing_days) : "e.g. 90"}
                          defaultValue={state.renewal_processing_days ?? ""}
                        />
                      </Field>
                      <Field label="Birthday expiry">
                        <Checkbox
                          name="expires_on_birthday"
                          label="Expires on user's birthday"
                          defaultChecked={state.expires_on_birthday}
                        />
                      </Field>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-3">
                      {state.is_custom ? (
                        <DeleteStateForm stateId={state.id} />
                      ) : (
                        <span className="mr-auto text-xs text-slate-500">
                          Built-in state — code and name editable, but cannot be deleted.
                        </span>
                      )}
                      <SubmitButton variant="secondary" pendingLabel="Saving...">
                        Save changes
                      </SubmitButton>
                    </div>
                  </form>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
      <span className="font-semibold text-slate-900">{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="flex items-center gap-1">
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function SelectInput({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
        {...props}
      />
      <span className="text-slate-700">{label}</span>
    </label>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "slate" | "amber" | "indigo" | "rose";
  children: React.ReactNode;
}) {
  const tones: Record<typeof tone, string> = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function DeleteStateForm({ stateId }: { stateId: string }) {
  return (
    <form action={deleteState} className="mr-auto">
      <input type="hidden" name="state_id" value={stateId} />
      <ConfirmDeleteButton
        type="submit"
        variant="destructive"
        size="sm"
        message="Delete this custom state? Licences referencing it will be orphaned."
      >
        Delete state
      </ConfirmDeleteButton>
    </form>
  );
}
