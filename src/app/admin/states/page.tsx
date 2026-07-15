import { getStates, getTaxonomyOptions } from "@/lib/data";
import {
  addStateLicenceType,
  createState,
  deleteState,
  deleteStateLicenceType,
  updateStateLicenceType,
  updateStateRules,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { ConfirmDeleteButton } from "@/components/licences/confirm-delete-button";
import { LicenceTypeExpiryFields } from "@/components/admin/licence-type-expiry-fields";
import { expiryModeForType } from "@/components/admin/licence-type-expiry-mode";
import { cn } from "@/lib/utils";
import type { RecordType } from "@/types/database";

export default async function AdminStatesPage() {
  const [states, taxonomy] = await Promise.all([getStates(), getTaxonomyOptions()]);

  const licenceTypes = taxonomy.recordTypes.filter(
    (type) => type.record_categories?.key === "gun_licence",
  );
  const licenceTypesByState = new Map<string, RecordType[]>();
  for (const type of licenceTypes) {
    if (!type.state_id) continue;
    const list = licenceTypesByState.get(type.state_id) ?? [];
    list.push(type);
    licenceTypesByState.set(type.state_id, list);
  }

  const customCount = states.filter((s) => s.is_custom).length;
  const birthdayTypeCount = licenceTypes.filter((t) => t.expires_on_birthday).length;
  const neverExpireCount = licenceTypes.filter((t) => !t.requires_renewal).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">State manager</h1>
          <p className="text-sm text-slate-500">
            Configure states and manage gun license types — each type has its own expiry rules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <SummaryPill label="Total states" value={states.length} />
          <SummaryPill label="Custom" value={customCount} />
          <SummaryPill label="License types" value={licenceTypes.length} />
          <SummaryPill label="Birthday expiry types" value={birthdayTypeCount} />
          <SummaryPill label="Never expire types" value={neverExpireCount} />
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="State name" htmlFor="new-name" required>
                <Input id="new-name" name="name" placeholder="e.g. Puerto Rico" required />
              </Field>
              <Field label="Code" htmlFor="new-code" required hint="Up to 8 characters">
                <Input id="new-code" name="code" placeholder="e.g. PR" maxLength={8} required />
              </Field>
              <Field label="Gun renewal URL" htmlFor="new-url" hint="External link shown to users">
                <Input id="new-url" name="gun_renewal_url" type="url" placeholder="https://" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Auto-renew">
                <Checkbox name="auto_renew" label="Auto-renew licenses in this state" />
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
              <CardDescription>Update state settings and manage license types with per-type expiry rules.</CardDescription>
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
              const stateLicenceTypes = licenceTypesByState.get(state.id) ?? [];
              const typesWithRules = stateLicenceTypes.filter(
                (type) =>
                  type.expiration_months != null && type.renewal_processing_days != null,
              ).length;

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
                          {stateLicenceTypes.length === 0
                            ? "No license types yet"
                            : `${stateLicenceTypes.length} license type${stateLicenceTypes.length === 1 ? "" : "s"} · ${typesWithRules} with expiry rules`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={state.is_custom ? "amber" : "slate"}>
                        {state.is_custom ? "Custom" : "Default"}
                      </Badge>
                      {state.auto_renew ? <Badge tone="indigo">Auto-renew</Badge> : null}
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
                      <Field label="Gun renewal URL" htmlFor={`url-${state.id}`}>
                        <Input
                          id={`url-${state.id}`}
                          name="gun_renewal_url"
                          type="url"
                          placeholder="https://"
                          defaultValue={state.gun_renewal_url ?? ""}
                        />
                      </Field>
                      <Field label="Auto-renew">
                        <Checkbox
                          name="auto_renew"
                          label="Auto-renew licenses in this state"
                          defaultChecked={state.auto_renew}
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

                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Gun license types
                    </p>
                    {stateLicenceTypes.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No license types yet. Add the first one below with its expiry rules.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {stateLicenceTypes.map((type) => (
                          <li
                            key={type.id}
                            className="rounded-md border border-slate-200 bg-white p-3"
                          >
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                              <form action={updateStateLicenceType} className="contents">
                                <input type="hidden" name="id" value={type.id} />
                                <Field label="Type name" htmlFor={`type-name-${type.id}`} required>
                                  <Input
                                    id={`type-name-${type.id}`}
                                    name="name"
                                    defaultValue={type.name}
                                    required
                                  />
                                </Field>
                                <LicenceTypeExpiryFields
                                  idPrefix={`type-${type.id}`}
                                  defaultMode={expiryModeForType(type)}
                                  defaultMonths={type.expiration_months}
                                  defaultDays={type.renewal_processing_days}
                                />
                                <div className="flex items-end gap-2">
                                  <SubmitButton size="sm" variant="secondary" pendingLabel="Saving...">
                                    Save type
                                  </SubmitButton>
                                </div>
                              </form>
                              <form action={deleteStateLicenceType} className="flex items-end">
                                <input type="hidden" name="id" value={type.id} />
                                <ConfirmDeleteButton
                                  type="submit"
                                  variant="destructive"
                                  size="sm"
                                  message="Remove this license type? It can't be removed while licenses still use it."
                                >
                                  Remove
                                </ConfirmDeleteButton>
                              </form>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form action={addStateLicenceType} className="space-y-3 border-t border-slate-200 pt-3">
                      <input type="hidden" name="state_id" value={state.id} />
                      <p className="text-xs font-medium text-slate-600">Add license type</p>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        <Field label="Type name" htmlFor={`new-type-${state.id}`} required>
                          <Input
                            id={`new-type-${state.id}`}
                            name="name"
                            placeholder="e.g. Premises License"
                            required
                          />
                        </Field>
                        <LicenceTypeExpiryFields idPrefix={`new-type-${state.id}`} />
                        <div className="flex items-end">
                          <Button type="submit" size="sm">
                            Add type
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
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
        message="Delete this custom state? Licenses referencing it will be orphaned."
      >
        Delete state
      </ConfirmDeleteButton>
    </form>
  );
}
