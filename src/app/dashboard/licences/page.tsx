import { createLicence, deleteLicence, renewLicence } from "./actions";
import { getStates, getUserLicences } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
              <p className="mt-2 text-sm text-slate-600">Last renewed: {formatDate(licence.last_renewed_at)}</p>
              <p className="text-sm text-slate-600">Renewal opens: {formatDate(licence.startRenewalBy)}</p>
              <p className="text-sm text-slate-600">Expires: {formatDate(licence.expiresAt)}</p>
              <div className="mt-3 flex gap-2">
                <form action={renewLicence}>
                  <input type="hidden" name="licence_id" value={licence.id} />
                  <Button type="submit" variant="secondary">
                    Mark renewed
                  </Button>
                </form>
                <form action={deleteLicence}>
                  <input type="hidden" name="licence_id" value={licence.id} />
                  <Button type="submit" variant="destructive">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          ))}
          {licences.length === 0 ? <p className="text-sm text-slate-600">No licences added yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
