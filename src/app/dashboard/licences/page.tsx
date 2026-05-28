import { createLicence, deleteLicence, renewLicence, updateLicence } from "./actions";
import { getStates, getUserLicences } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { isGunRelatedType, LICENCE_TYPES } from "@/lib/licences/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDeleteButton } from "@/components/licences/confirm-delete-button";
import { RenewAction } from "@/components/licences/renew-action";

export default async function LicencesPage() {
  const [states, licences] = await Promise.all([getStates(), getUserLicences()]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add licence</CardTitle>
          <CardDescription>Add a licence and we will calculate your renewal timeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createLicence} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Licence type</Label>
              <select
                id="type"
                name="type"
                defaultValue="drivers_licence"
                className="h-10 w-full rounded-md border border-slate-300 px-3"
                required
              >
                {LICENCE_TYPES.map((typeOption) => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state_id">State</Label>
              <select
                id="state_id"
                name="state_id"
                className="h-10 w-full rounded-md border border-slate-300 px-3"
                required
              >
                <option value="">Select state</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name} ({state.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_renewed_at">Last renewed date</Label>
              <Input id="last_renewed_at" name="last_renewed_at" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licence_number">Licence number (optional)</Label>
              <Input id="licence_number" name="licence_number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo (optional)</Label>
              <Input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                name="notes"
                className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit">Save licence</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My licences</CardTitle>
          <CardDescription>Renew, update, or remove licences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {licences.map((licence) => (
            <div
              key={licence.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{licence.states?.name}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(licence.status)}`}>
                  {statusLabel(licence.status)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Type: {LICENCE_TYPES.find((typeOption) => typeOption.value === licence.type)?.label ?? "Other"}
              </p>
              <p className="mt-2 text-sm text-slate-600">Last renewed: {formatDate(licence.last_renewed_at)}</p>
              <p className="text-sm text-slate-600">Renewal opens: {formatDate(licence.startRenewalBy)}</p>
              <p className="text-sm text-slate-600">Expires: {formatDate(licence.expiresAt)}</p>
              {licence.photo_signed_url ? (
                <p className="text-sm text-slate-600">
                  <a
                    href={licence.photo_signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline underline-offset-2"
                  >
                    View licence photo
                  </a>
                </p>
              ) : null}
              {licence.notes ? <p className="text-sm text-slate-600">Notes: {licence.notes}</p> : null}
              <div className="mt-3 flex gap-2">
                <form action={renewLicence}>
                  <input type="hidden" name="licence_id" value={licence.id} />
                  <RenewAction
                    isExternal={isGunRelatedType(licence.type)}
                    externalUrl={licence.states?.gun_renewal_url ?? null}
                  />
                </form>
                <form action={deleteLicence}>
                  <input type="hidden" name="licence_id" value={licence.id} />
                  <ConfirmDeleteButton type="submit" variant="destructive">
                    Delete
                  </ConfirmDeleteButton>
                </form>
              </div>
              <form action={updateLicence} className="mt-4 grid gap-2 border-t border-slate-100 pt-3 md:grid-cols-2">
                <input type="hidden" name="licence_id" value={licence.id} />
                <div className="space-y-2">
                  <Label htmlFor={`edit_type_${licence.id}`}>Type</Label>
                  <select
                    id={`edit_type_${licence.id}`}
                    name="type"
                    defaultValue={licence.type}
                    className="h-10 w-full rounded-md border border-slate-300 px-3"
                    required
                  >
                    {LICENCE_TYPES.map((typeOption) => (
                      <option key={typeOption.value} value={typeOption.value}>
                        {typeOption.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_state_${licence.id}`}>State</Label>
                  <select
                    id={`edit_state_${licence.id}`}
                    name="state_id"
                    defaultValue={licence.state_id}
                    className="h-10 w-full rounded-md border border-slate-300 px-3"
                    required
                  >
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name} ({state.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_date_${licence.id}`}>Last renewed</Label>
                  <Input
                    id={`edit_date_${licence.id}`}
                    name="last_renewed_at"
                    type="date"
                    defaultValue={licence.last_renewed_at}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_number_${licence.id}`}>Licence number</Label>
                  <Input id={`edit_number_${licence.id}`} name="licence_number" defaultValue={licence.licence_number ?? ""} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`edit_notes_${licence.id}`}>Notes</Label>
                  <textarea
                    id={`edit_notes_${licence.id}`}
                    name="notes"
                    defaultValue={licence.notes ?? ""}
                    className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit_photo_${licence.id}`}>Replace photo</Label>
                  <Input
                    id={`edit_photo_${licence.id}`}
                    name="photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                  />
                </div>
                <label className="mt-8 flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="remove_photo" />
                  Remove existing photo
                </label>
                <Button type="submit" className="md:col-span-2">
                  Save changes
                </Button>
              </form>
            </div>
          ))}
          {licences.length === 0 ? <p className="text-sm text-slate-600">No licences added yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
