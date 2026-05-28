import { getStates, getTaxonomyOptions } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import {
  createJurisdiction,
  createOrganization,
  createRecordType,
  deleteRecordType,
  updateRecordType,
} from "./actions";
import { ConfirmDeleteButton } from "@/components/licences/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AdminTaxonomyPage() {
  const [states, taxonomy, categories] = await Promise.all([
    getStates(),
    getTaxonomyOptions(),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase.from("record_categories").select("*").order("name");
      return data ?? [];
    })(),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Jurisdictions</CardTitle>
          <CardDescription>Add state/city jurisdictions for gun licences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createJurisdiction} className="grid gap-2 md:grid-cols-5">
            <Input name="name" placeholder="Name" required />
            <Input name="code" placeholder="Code (e.g. nyc)" required />
            <select name="state_id" className="h-10 rounded-md border border-slate-300 px-2 text-sm">
              <option value="">No state</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-2 text-sm">
              <input type="checkbox" name="is_city" />
              City jurisdiction
            </label>
            <Button type="submit">Add jurisdiction</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>Add organizations used by gun courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createOrganization} className="grid gap-2 md:grid-cols-3">
            <Input name="name" placeholder="Organization name" required />
            <Input name="code" placeholder="Code (e.g. nra)" required />
            <Button type="submit">Add organization</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record types</CardTitle>
          <CardDescription>
            Manage licence/course types, parent links, and optional renewal settings for course types.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={createRecordType} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-8">
            <Input name="name" placeholder="Type name" required />
            <Input name="key" placeholder="type_key" required />
            <select name="category_id" className="h-10 rounded-md border border-slate-300 px-2 text-sm" required>
              <option value="">Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select name="jurisdiction_id" className="h-10 rounded-md border border-slate-300 px-2 text-sm">
              <option value="">No jurisdiction parent</option>
              {taxonomy.jurisdictions.map((jurisdiction) => (
                <option key={jurisdiction.id} value={jurisdiction.id}>
                  {jurisdiction.name}
                </option>
              ))}
            </select>
            <select name="organization_id" className="h-10 rounded-md border border-slate-300 px-2 text-sm">
              <option value="">No organization parent</option>
              {taxonomy.organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
            <Input name="expiration_months" type="number" min={1} placeholder="Months" />
            <Input name="renewal_processing_days" type="number" min={0} placeholder="Processing days" />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="requires_renewal" />
                Renewal
              </label>
              <Button type="submit">Add type</Button>
            </div>
          </form>

          {taxonomy.recordTypes.map((type) => (
            <div key={type.id} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-9">
              <form action={updateRecordType} className="contents">
                <input type="hidden" name="id" value={type.id} />
                <Input name="name" defaultValue={type.name} required />
                <Input name="key" defaultValue={type.key} required />
                <select name="category_id" defaultValue={type.category_id} className="h-10 rounded-md border border-slate-300 px-2 text-sm" required>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select name="jurisdiction_id" defaultValue={type.jurisdiction_id ?? ""} className="h-10 rounded-md border border-slate-300 px-2 text-sm">
                  <option value="">No jurisdiction parent</option>
                  {taxonomy.jurisdictions.map((jurisdiction) => (
                    <option key={jurisdiction.id} value={jurisdiction.id}>
                      {jurisdiction.name}
                    </option>
                  ))}
                </select>
                <select name="organization_id" defaultValue={type.organization_id ?? ""} className="h-10 rounded-md border border-slate-300 px-2 text-sm">
                  <option value="">No organization parent</option>
                  {taxonomy.organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
                <Input name="expiration_months" type="number" min={1} defaultValue={type.expiration_months ?? ""} />
                <Input
                  name="renewal_processing_days"
                  type="number"
                  min={0}
                  defaultValue={type.renewal_processing_days ?? ""}
                />
                <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-2 text-sm">
                  <input type="checkbox" name="requires_renewal" defaultChecked={type.requires_renewal} />
                  Renewal
                </label>
                <Button type="submit" variant="secondary">
                  Save
                </Button>
              </form>
              <form action={deleteRecordType}>
                <input type="hidden" name="id" value={type.id} />
                <ConfirmDeleteButton type="submit" variant="destructive" size="sm">
                  Delete
                </ConfirmDeleteButton>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
