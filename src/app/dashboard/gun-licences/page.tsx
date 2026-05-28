import {
  confirmExpiredGunLicence,
  createGunLicence,
  deleteGunLicence,
  renewGunLicence,
  updateGunLicence,
} from "./actions";
import { getGunLicences, getStates, getTaxonomyOptions } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDeleteButton } from "@/components/licences/confirm-delete-button";

export default async function GunLicencesPage() {
  const [states, records, taxonomy] = await Promise.all([
    getStates(),
    getGunLicences(),
    getTaxonomyOptions(),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const licenceTypes = taxonomy.recordTypes.filter((type) => type.record_categories?.key === "gun_licence");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add gun licence</CardTitle>
          <CardDescription>
            Select jurisdiction and licence type. Include licence number and dates for accurate tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createGunLicence} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="state_id">State (optional)</Label>
              <select
                id="state_id"
                name="state_id"
                className="h-10 w-full rounded-md border border-slate-300 px-3"
                defaultValue=""
              >
                <option value="">No state linked</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name} ({state.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jurisdiction_id">Jurisdiction</Label>
              <select
                id="jurisdiction_id"
                name="jurisdiction_id"
                className="h-10 w-full rounded-md border border-slate-300 px-3"
                required
              >
                <option value="">Select jurisdiction</option>
                {taxonomy.jurisdictions.map((jurisdiction) => (
                  <option key={jurisdiction.id} value={jurisdiction.id}>
                    {jurisdiction.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="record_type_id">Licence type</Label>
              <select
                id="record_type_id"
                name="record_type_id"
                className="h-10 w-full rounded-md border border-slate-300 px-3"
                required
              >
                <option value="">Select type</option>
                {licenceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="licence_number">Licence number</Label>
              <Input id="licence_number" name="licence_number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issued_at">Issue date (optional)</Label>
              <Input id="issued_at" name="issued_at" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_renewed_at">Renewed date</Label>
              <Input id="last_renewed_at" name="last_renewed_at" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_month">Birth month (birthday expiry states)</Label>
              <Input id="birth_month" name="birth_month" type="number" min={1} max={12} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_day">Birth day (birthday expiry states)</Label>
              <Input id="birth_day" name="birth_day" type="number" min={1} max={31} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Licence photo</Label>
              <Input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit">Save gun licence</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My gun licences</CardTitle>
          <CardDescription>Includes number, jurisdiction, type, status, and renewal controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{record.jurisdictions?.name ?? record.states?.name}</p>
                  <p className="text-sm text-slate-600">{record.record_types?.name ?? "Uncategorized"}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(record.status)}`}>
                  {statusLabel(record.status)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Licence number: {record.licence_number ?? "Not set"}</p>
              <p className="text-sm text-slate-600">Last renewed: {formatDate(record.last_renewed_at)}</p>
              <p className="text-sm text-slate-600">Renewal opens: {formatDate(record.startRenewalBy)}</p>
              <p className="text-sm text-slate-600">Expires: {formatDate(record.expiresAt)}</p>
              {record.photo_signed_url ? (
                <p className="text-sm text-slate-600">
                  <a
                    href={record.photo_signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline underline-offset-2"
                  >
                    View licence photo
                  </a>
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={renewGunLicence} className="flex items-center gap-2">
                  <input type="hidden" name="record_id" value={record.id} />
                  <Input name="renewed_at" type="date" defaultValue={today} required className="h-10 w-[170px]" />
                  <Button type="submit" variant="secondary">
                    Renew
                  </Button>
                </form>
                <form action={confirmExpiredGunLicence}>
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
                <form action={deleteGunLicence}>
                  <input type="hidden" name="record_id" value={record.id} />
                  <ConfirmDeleteButton type="submit" variant="destructive">
                    Delete
                  </ConfirmDeleteButton>
                </form>
              </div>
              <form action={updateGunLicence} className="mt-4 grid gap-2 border-t border-slate-100 pt-3 md:grid-cols-2">
                <input type="hidden" name="record_id" value={record.id} />
                <div className="space-y-2">
                  <Label htmlFor={`edit_state_${record.id}`}>State</Label>
                  <select
                    id={`edit_state_${record.id}`}
                    name="state_id"
                    defaultValue={record.state_id ?? ""}
                    className="h-10 w-full rounded-md border border-slate-300 px-3"
                  >
                    <option value="">No state linked</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name} ({state.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_jurisdiction_${record.id}`}>Jurisdiction</Label>
                  <select
                    id={`edit_jurisdiction_${record.id}`}
                    name="jurisdiction_id"
                    defaultValue={record.jurisdiction_id}
                    className="h-10 w-full rounded-md border border-slate-300 px-3"
                    required
                  >
                    {taxonomy.jurisdictions.map((jurisdiction) => (
                      <option key={jurisdiction.id} value={jurisdiction.id}>
                        {jurisdiction.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_type_${record.id}`}>Licence type</Label>
                  <select
                    id={`edit_type_${record.id}`}
                    name="record_type_id"
                    defaultValue={record.record_type_id}
                    className="h-10 w-full rounded-md border border-slate-300 px-3"
                    required
                  >
                    {licenceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_number_${record.id}`}>Licence number</Label>
                  <Input id={`edit_number_${record.id}`} name="licence_number" defaultValue={record.licence_number ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_issued_${record.id}`}>Issue date</Label>
                  <Input id={`edit_issued_${record.id}`} name="issued_at" type="date" defaultValue={record.issued_at ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_renewed_${record.id}`}>Last renewed</Label>
                  <Input
                    id={`edit_renewed_${record.id}`}
                    name="last_renewed_at"
                    type="date"
                    defaultValue={record.last_renewed_at}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_birth_month_${record.id}`}>Birth month</Label>
                  <Input
                    id={`edit_birth_month_${record.id}`}
                    name="birth_month"
                    type="number"
                    min={1}
                    max={12}
                    defaultValue={record.birth_month ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_birth_day_${record.id}`}>Birth day</Label>
                  <Input
                    id={`edit_birth_day_${record.id}`}
                    name="birth_day"
                    type="number"
                    min={1}
                    max={31}
                    defaultValue={record.birth_day ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_photo_${record.id}`}>Replace photo</Label>
                  <Input
                    id={`edit_photo_${record.id}`}
                    name="photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                  />
                </div>
                <label className="mt-8 flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="remove_photo" />
                  Remove existing photo
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
          {records.length === 0 ? <p className="text-sm text-slate-600">No gun licences added yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
