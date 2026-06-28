import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarClock,
  GraduationCap,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getGunCourses, getGunLicences, getTaxonomyOptions } from "@/lib/data";
import { createGunLicence } from "@/app/dashboard/gun-licences/actions";
import { createGunCourse } from "@/app/dashboard/gun-courses/actions";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { Button } from "@/components/ui/button";
import { GunLicenceFormDialog } from "@/components/licences/gun-licence-form-dialog";
import { GunCourseFormDialog } from "@/components/licences/gun-course-form-dialog";
import { cn } from "@/lib/utils";
import type { GunLicenceWithStatus } from "@/types/database";

export default async function DashboardPage() {
  const [licences, courses, taxonomy] = await Promise.all([
    getGunLicences(),
    getGunCourses(),
    getTaxonomyOptions(),
  ]);
  const licenceTypes = taxonomy.recordTypes.filter(
    (type) => type.record_categories?.key === "gun_licence",
  );
  const courseTypes = taxonomy.recordTypes.filter(
    (type) => type.record_categories?.key === "gun_course",
  );

  const expiringSoonCount = licences.filter(
    (licence) => licence.daysUntilExpiry <= 30 && licence.status !== "expired",
  ).length;
  const expiredCount = licences.filter((licence) => licence.status === "expired").length;
  const validCount = licences.filter((licence) => licence.status === "valid").length;

  const upcomingRenewals: GunLicenceWithStatus[] = [...licences]
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          A snapshot of your licences and courses.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          label="Gun licences"
          value={licences.length}
          tone="slate"
          href="/dashboard/gun-licences"
        />
        <StatCard
          icon={GraduationCap}
          label="Gun courses"
          value={courses.length}
          tone="slate"
          href="/dashboard/gun-courses"
        />
        <StatCard
          icon={CalendarClock}
          label="Renewal soon"
          value={expiringSoonCount}
          tone="amber"
          hint="≤ 30 days"
        />
        <StatCard
          icon={AlertCircle}
          label="Expired"
          value={expiredCount}
          tone="red"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Upcoming renewals</h2>
              <p className="text-xs text-slate-500">Sorted by closest expiry date.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/gun-licences">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <ul className="divide-y divide-slate-100">
            {upcomingRenewals.length === 0 ? (
              <li className="px-6 py-8 text-sm text-slate-500">
                No licences yet. Add one to start tracking renewals.
              </li>
            ) : (
              upcomingRenewals.map((licence) => (
                <li
                  key={licence.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {licence.record_types?.name ?? "Licence"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {licence.jurisdictions?.name ?? licence.states?.name ?? "Unknown jurisdiction"}
                      {" · expires "}
                      {formatDate(licence.expiresAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                      statusColor(licence.status),
                    )}
                  >
                    {statusLabel(licence.status)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
          <p className="mt-1 text-xs text-slate-500">Add a record or tune your reminders.</p>
          <div className="mt-4 space-y-2">
            <GunLicenceFormDialog
              mode="create"
              jurisdictions={taxonomy.jurisdictions}
              licenceTypes={licenceTypes}
              action={createGunLicence}
              triggerLabel="Add gun licence"
              triggerVariant="outline"
              triggerClassName="w-full justify-start"
            />
            <GunCourseFormDialog
              mode="create"
              organizations={taxonomy.organizations}
              courseTypes={courseTypes}
              action={createGunCourse}
              triggerLabel="Add gun course"
              triggerVariant="outline"
              triggerClassName="w-full justify-start"
            />
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/settings">
                <Bell className="h-4 w-4 text-slate-500" />
                Notification settings
              </Link>
            </Button>
          </div>
          <div className="mt-6 rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Valid licences</p>
            <p className="mt-0.5 text-2xl font-semibold text-emerald-600">{validCount}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

type Tone = "slate" | "amber" | "red";

const toneStyles: Record<
  Tone,
  { card: string; icon: string; value: string; label: string }
> = {
  slate: {
    card: "bg-white",
    icon: "bg-slate-100 text-slate-600",
    value: "text-slate-900",
    label: "text-slate-500",
  },
  amber: {
    card: "bg-amber-50/60",
    icon: "bg-amber-100 text-amber-700",
    value: "text-amber-900",
    label: "text-amber-700",
  },
  red: {
    card: "bg-red-50/60",
    icon: "bg-red-100 text-red-700",
    value: "text-red-900",
    label: "text-red-700",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  hint,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: Tone;
  hint?: string;
  href?: string;
}) {
  const styles = toneStyles[tone];
  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-slate-200 p-4 shadow-sm transition-shadow",
        styles.card,
        href ? "hover:shadow-md" : "",
      )}
    >
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", styles.icon)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className={cn("text-xs font-medium uppercase tracking-wide", styles.label)}>{label}</p>
        <p className={cn("mt-1 text-2xl font-semibold tracking-tight", styles.value)}>{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

