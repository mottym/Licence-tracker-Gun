import { getTaxonomyOptions } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import {
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
  const [taxonomy, categories] = await Promise.all([
    getTaxonomyOptions(),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase.from("record_categories").select("*").order("name");
      return data ?? [];
    })(),
  ]);

  const courseCategory = categories.find((category) => category.key === "gun_course");
  const courseTypes = taxonomy.recordTypes.filter(
    (type) => type.record_categories?.key === "gun_course",
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Organizations and gun course types used in the dropdowns when adding a gun course.
          Gun licence types are managed per state on the States page.
        </p>
      </header>

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
          <CardTitle>Gun course types</CardTitle>
          <CardDescription>
            Manage course types, their organization, and optional renewal settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={createRecordType} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-7">
            <input type="hidden" name="category_id" value={courseCategory?.id ?? ""} />
            <Input name="name" placeholder="Type name" required />
            <Input name="key" placeholder="type_key" required />
            <select name="organization_id" className="h-10 rounded-md border border-slate-300 px-2 text-sm">
              <option value="">No organization</option>
              {taxonomy.organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
            <Input name="expiration_months" type="number" min={1} placeholder="Months" />
            <Input name="renewal_processing_days" type="number" min={0} placeholder="Processing days" />
            <div className="flex items-center gap-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="requires_renewal" />
                Renewal
              </label>
              <Button type="submit">Add type</Button>
            </div>
          </form>

          {courseTypes.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No course types yet. Add one above.
            </p>
          ) : (
            courseTypes.map((type) => (
              <div key={type.id} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-8">
                <form action={updateRecordType} className="contents">
                  <input type="hidden" name="id" value={type.id} />
                  <input type="hidden" name="category_id" value={type.category_id} />
                  <Input name="name" defaultValue={type.name} required />
                  <Input name="key" defaultValue={type.key} required />
                  <select name="organization_id" defaultValue={type.organization_id ?? ""} className="h-10 rounded-md border border-slate-300 px-2 text-sm">
                    <option value="">No organization</option>
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
