import { IdCard } from "lucide-react";
import {
  confirmExpiredCustomLicence,
  createCustomLicence,
  deleteCustomLicence,
  renewCustomLicence,
  updateCustomLicence,
} from "./actions";
import { getCustomLicences } from "@/lib/data";
import { CustomLicenceCard } from "@/components/licences/custom-licence-card";
import { CustomLicenceFormDialog } from "@/components/licences/custom-licence-form-dialog";

export default async function CustomLicencesPage() {
  const records = await getCustomLicences();

  return (
    <div className="space-y-6">
      <header className="sticky top-14 z-20 -mx-4 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-0 lg:-mx-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Custom licenses
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track any other credential — driver&apos;s license, OSHA card,
            professional certification — by entering its expiry date directly.
          </p>
        </div>
        <CustomLicenceFormDialog
          mode="create"
          action={createCustomLicence}
          triggerLabel="Add custom license"
        />
      </header>

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((licence) => (
            <CustomLicenceCard
              key={licence.id}
              licence={licence}
              updateAction={updateCustomLicence}
              renewAction={renewCustomLicence}
              confirmExpiredAction={confirmExpiredCustomLicence}
              deleteAction={deleteCustomLicence}
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
        <IdCard className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">
        No custom licenses yet
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Add credentials like a driver&apos;s license or OSHA card to track
        expiry alongside your other records.
      </p>
    </div>
  );
}
