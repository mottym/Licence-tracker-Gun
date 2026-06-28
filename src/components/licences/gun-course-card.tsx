import { Building2, CalendarCheck, CalendarClock, FileCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { CardActionsMenu } from "@/components/licences/card-actions-menu";
import { GunCourseFormDialog } from "@/components/licences/gun-course-form-dialog";
import { RenewPopover } from "@/components/licences/renew-popover";
import type {
  GunCourseWithStatus,
  Organization,
  RecordType,
} from "@/types/database";

interface GunCourseCardProps {
  course: GunCourseWithStatus;
  organizations: Organization[];
  courseTypes: RecordType[];
  renewAction: (formData: FormData) => Promise<void> | void;
  updateAction: (formData: FormData) => Promise<void> | void;
  confirmExpiredAction: (formData: FormData) => Promise<void> | void;
  deleteAction: (formData: FormData) => Promise<void> | void;
}

export function GunCourseCard({
  course,
  organizations,
  courseTypes,
  renewAction,
  updateAction,
  confirmExpiredAction,
  deleteAction,
}: GunCourseCardProps) {
  const requiresRenewal = Boolean(course.record_types?.requires_renewal);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900">
            {course.record_types?.name ?? "Uncategorized"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Building2 className="h-3.5 w-3.5" />
            {course.organizations?.name ?? "No organization"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(course.status)}`}
        >
          {statusLabel(course.status)}
        </span>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Field icon={<CalendarCheck className="h-3.5 w-3.5" />} label="Completed">
          {formatDate(course.completed_at)}
        </Field>
        {course.expiresAt ? (
          <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Expires">
            {formatDate(course.expiresAt)}
          </Field>
        ) : (
          <Field icon={<CalendarClock className="h-3.5 w-3.5" />} label="Expires">
            No expiry
          </Field>
        )}
      </dl>

      {course.certificate_signed_url ? (
        <a
          href={course.certificate_signed_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          <FileCheck className="h-3.5 w-3.5" />
          View certificate
        </a>
      ) : null}

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        {requiresRenewal ? (
          <RenewPopover recordId={course.id} action={renewAction} />
        ) : null}

        <GunCourseFormDialog
          mode="edit"
          course={course}
          organizations={organizations}
          courseTypes={courseTypes}
          action={updateAction}
        />

        <div className="ml-auto">
          <CardActionsMenu
            recordId={course.id}
            isMarkedExpired={Boolean(course.manually_marked_expired)}
            confirmExpiredAction={confirmExpiredAction}
            deleteAction={deleteAction}
            deleteConfirmMessage="Delete this gun course? This cannot be undone."
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
