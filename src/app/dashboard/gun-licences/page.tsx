import { Target } from "lucide-react";
import {
  confirmExpiredGunLicence,
  createGunLicence,
  deleteGunLicence,
  renewGunLicence,
  updateGunLicence,
} from "./actions";
import { getGunLicences, getStates, getTaxonomyOptions } from "@/lib/data";
import { GunLicenceCard } from "@/components/licences/gun-licence-card";
import { GunLicenceFormDialog } from "@/components/licences/gun-licence-form-dialog";

export default async function GunLicencesPage() {
  const [records, taxonomy, states] = await Promise.all([
    getGunLicences(),
    getTaxonomyOptions(),
    getStates(),
  ]);
  const licenceTypes = taxonomy.recordTypes.filter(
    (type) => type.record_categories?.key === "gun_licence",
  );

  return (
    <div className="space-y-6">
      <header className="sticky top-14 z-20 -mx-4 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-0 lg:-mx-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Gun licences</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track licence numbers, renewal windows, and expiry dates by jurisdiction.
          </p>
        </div>
        <GunLicenceFormDialog
          mode="create"
          states={states}
          licenceTypes={licenceTypes}
          action={createGunLicence}
          triggerLabel="Add gun licence"
        />
      </header>

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((licence) => (
            <GunLicenceCard
              key={licence.id}
              licence={licence}
              states={states}
              licenceTypes={licenceTypes}
              renewAction={renewGunLicence}
              updateAction={updateGunLicence}
              confirmExpiredAction={confirmExpiredGunLicence}
              deleteAction={deleteGunLicence}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Target className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">No gun licences yet</h2>
      <p className="mt-1 text-sm text-slate-500">
        Add your first licence to start tracking renewals and expiry.
      </p>
    </div>
  );
}
