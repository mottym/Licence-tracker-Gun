import {
  confirmExpiredGunCourse,
  createGunCourse,
  deleteGunCourse,
  renewGunCourse,
  updateGunCourse,
} from "./actions";
import { getGunCourses, getTaxonomyOptions } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDeleteButton } from "@/components/licences/confirm-delete-button";

export default async function GunCoursesPage() {
  const [records, taxonomy] = await Promise.all([getGunCourses(), getTaxonomyOptions()]);
  const courseTypes = taxonomy.recordTypes.filter((type) => type.record_categories?.key === "gun_course");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add gun course</CardTitle>
          <CardDescription>
            Track completed courses by organization and type, with optional renewal dates when required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createGunCourse} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organization_id">Organization</Label>
              <select
                id="organization_id"
                name="organization_id"
                className="h-10 w-full rounded-md border border-slate-300 px-3"
                required
              >
                <option value="">Select organization</option>
                {taxonomy.organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="record_type_id">Course type</Label>
              <select
                id="record_type_id"
                name="record_type_id"
                className="h-10 w-full rounded-md border border-slate-300 px-3"
                required
              >
                <option value="">Select type</option>
                {courseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="completed_at">Completed date</Label>
              <Input id="completed_at" name="completed_at" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renewed_at">Renewed date (optional)</Label>
              <Input id="renewed_at" name="renewed_at" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificate">Certificate / photo (optional)</Label>
              <Input id="certificate" name="certificate" type="file" accept="image/png,image/jpeg,image/webp" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit">Save gun course</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My gun courses</CardTitle>
          <CardDescription>Course details with optional renewal tracking and expiry confirmation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{record.organizations?.name}</p>
                  <p className="text-sm text-slate-600">{record.record_types?.name ?? "Uncategorized"}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(record.status)}`}>
                  {statusLabel(record.status)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Completed: {formatDate(record.completed_at)}</p>
              {record.expiresAt ? <p className="text-sm text-slate-600">Expires: {formatDate(record.expiresAt)}</p> : null}
              {record.certificate_signed_url ? (
                <p className="text-sm text-slate-600">
                  <a
                    href={record.certificate_signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline underline-offset-2"
                  >
                    View certificate
                  </a>
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {record.record_types?.requires_renewal ? (
                  <form action={renewGunCourse} className="flex items-center gap-2">
                    <input type="hidden" name="record_id" value={record.id} />
                    <Input name="renewed_at" type="date" defaultValue={today} required className="h-10 w-[170px]" />
                    <Button type="submit" variant="secondary">
                      Renew
                    </Button>
                  </form>
                ) : null}
                <form action={confirmExpiredGunCourse}>
                  <input type="hidden" name="record_id" value={record.id} />
                  <input
                    type="hidden"
                    name="manually_marked_expired"
                    value={record.manually_marked_expired ? "false" : "true"}
                  />
                  <Button type="submit" variant="outline">
                    {record.manually_marked_expired ? "Clear expired confirmation" : "Confirm expired"}
                  </Button>
                </form>
                <form action={deleteGunCourse}>
                  <input type="hidden" name="record_id" value={record.id} />
                  <ConfirmDeleteButton type="submit" variant="destructive">
                    Delete
                  </ConfirmDeleteButton>
                </form>
              </div>
              <form action={updateGunCourse} className="mt-4 grid gap-2 border-t border-slate-100 pt-3 md:grid-cols-2">
                <input type="hidden" name="record_id" value={record.id} />
                <div className="space-y-2">
                  <Label htmlFor={`edit_org_${record.id}`}>Organization</Label>
                  <select
                    id={`edit_org_${record.id}`}
                    name="organization_id"
                    defaultValue={record.organization_id}
                    className="h-10 w-full rounded-md border border-slate-300 px-3"
                    required
                  >
                    {taxonomy.organizations.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_type_${record.id}`}>Course type</Label>
                  <select
                    id={`edit_type_${record.id}`}
                    name="record_type_id"
                    defaultValue={record.record_type_id}
                    className="h-10 w-full rounded-md border border-slate-300 px-3"
                    required
                  >
                    {courseTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_completed_${record.id}`}>Completed</Label>
                  <Input
                    id={`edit_completed_${record.id}`}
                    name="completed_at"
                    type="date"
                    defaultValue={record.completed_at}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_renewed_${record.id}`}>Renewed</Label>
                  <Input id={`edit_renewed_${record.id}`} name="renewed_at" type="date" defaultValue={record.renewed_at ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_certificate_${record.id}`}>Replace certificate</Label>
                  <Input
                    id={`edit_certificate_${record.id}`}
                    name="certificate"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                  />
                </div>
                <label className="mt-8 flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="remove_certificate" />
                  Remove existing certificate
                </label>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`edit_notes_${record.id}`}>Notes</Label>
                  <textarea
                    id={`edit_notes_${record.id}`}
                    name="notes"
                    defaultValue={record.notes ?? ""}
                    className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <Button type="submit" className="md:col-span-2">
                  Save changes
                </Button>
              </form>
            </div>
          ))}
          {records.length === 0 ? <p className="text-sm text-slate-600">No gun courses added yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
