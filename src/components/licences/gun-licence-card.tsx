import { CalendarClock, Hash, Image as ImageIcon, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { CardActionsMenu } from "@/components/licences/card-actions-menu";
import { GunLicenceFormDialog } from "@/components/licences/gun-licence-form-dialog";
import { RenewPopover } from "@/components/licences/renew-popover";
import type {
  GunLicenceWithStatus,
  RecordType,
  State,
} from "@/types/database";

interface GunLicenceCardProps {
  licence: GunLicenceWithStatus;
  states: State[];
  licenceTypes: RecordType[];
  renewAction: (formData: FormData) => Promise<void> | void;
  updateAction: (formData: FormData) => Promise<void> | void;
  confirmExpiredAction: (formData: FormData) => Promise<void> | void;
  deleteAction: (formData: FormData) => Promise<void> | void;
}

export function GunLicenceCard({
  licence,
  states,
  licenceTypes,
  renewAction,
  updateAction,
  confirmExpiredAction,
  deleteAction,
}: GunLicenceCardProps) {
  const jurisdictionName = licence.states?.name ?? licence.jurisdictions?.name ?? "Unknown state";
  const typeName = licence.record_types?.name ?? "Uncategorized";
  const stateCode = licence.states?.code ?? licence.jurisdictions?.states?.code;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900">{typeName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {jurisdictionName}
            {stateCode ? <span className="text-slate-400">· {stateCode}</span> : null}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(licence.status)}`}
        >
          {statusLabel(licence.status)}
        </span>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Field icon={<Hash className="h-3.5 w-3.5" />} label="Licence #">
          {licence.licence_number ?? "Not set"}
        </Field>
        <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Last renewed">
          {formatDate(licence.last_renewed_at)}
        </Field>
        <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Renewal opens">
          {licence.startRenewalBy ? formatDate(licence.startRenewalBy) : "—"}
        </Field>
        <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Expires">
          {licence.expiresAt ? formatDate(licence.expiresAt) : "Does not expire"}
        </Field>
      </dl>

      {licence.photo_signed_url ? (
        <a
          href={licence.photo_signed_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          View licence photo
        </a>
      ) : null}

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        {licence.expiresAt ? (
          <RenewPopover recordId={licence.id} action={renewAction} />
        ) : null}

        <GunLicenceFormDialog
          mode="edit"
          licence={licence}
          states={states}
          licenceTypes={licenceTypes}
          action={updateAction}
        />

        <div className="ml-auto">
          <CardActionsMenu
            recordId={licence.id}
            isMarkedExpired={Boolean(licence.manually_marked_expired)}
            confirmExpiredAction={confirmExpiredAction}
            deleteAction={deleteAction}
            deleteConfirmMessage="Delete this gun licence? This cannot be undone."
          />
        </div>
      </div>
    </article>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <span className="ml-auto text-slate-700">{children}</span>
    </div>
  );
}
