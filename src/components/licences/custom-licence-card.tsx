import {
  Building2,
  CalendarClock,
  Hash,
  Image as ImageIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { CardActionsMenu } from "@/components/licences/card-actions-menu";
import { CustomLicenceFormDialog } from "@/components/licences/custom-licence-form-dialog";
import { RenewPopover } from "@/components/licences/renew-popover";
import type { CustomLicenceWithStatus } from "@/types/database";

interface CustomLicenceCardProps {
  licence: CustomLicenceWithStatus;
  updateAction: (formData: FormData) => Promise<void> | void;
  renewAction: (formData: FormData) => Promise<void> | void;
  confirmExpiredAction: (formData: FormData) => Promise<void> | void;
  deleteAction: (formData: FormData) => Promise<void> | void;
}

export function CustomLicenceCard({
  licence,
  updateAction,
  renewAction,
  confirmExpiredAction,
  deleteAction,
}: CustomLicenceCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900">{licence.name}</p>
          {licence.issuer ? (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              {licence.issuer}
            </p>
          ) : null}
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
        <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Issued">
          {licence.issued_at ? formatDate(licence.issued_at) : "Not set"}
        </Field>
        <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Expires">
          {formatDate(licence.expiresAt)}
        </Field>
        <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Reminder">
          {licence.renewal_reminder_days} days before
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
        <RenewPopover
          recordId={licence.id}
          action={renewAction}
          triggerLabel="Renew"
          fieldName="expires_at"
          fieldLabel="New expiry date"
          helpText="Set the licence's new expiration date."
          submitLabel="Update expiry"
          pendingLabel="Updating…"
        />

        <CustomLicenceFormDialog
          mode="edit"
          licence={licence}
          action={updateAction}
        />

        <div className="ml-auto">
          <CardActionsMenu
            recordId={licence.id}
            isMarkedExpired={Boolean(licence.manually_marked_expired)}
            confirmExpiredAction={confirmExpiredAction}
            deleteAction={deleteAction}
            deleteConfirmMessage="Delete this custom licence? This cannot be undone."
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
