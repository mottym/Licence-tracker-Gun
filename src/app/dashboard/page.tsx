import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getGunCourses, getGunLicences } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GunLicenceWithStatus } from "@/types/database";

export default async function DashboardPage() {
  const [licences, courses] = await Promise.all([getGunLicences(), getGunCourses()]);

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
          <p className="mt-1 text-xs text-slate-500">Jump straight into the most common tasks.</p>
          <div className="mt-4 space-y-2">
            <QuickLink
              href="/dashboard/gun-licences"
              label="Manage gun licences"
              icon={Target}
            />
            <QuickLink
              href="/dashboard/gun-courses"
              label="Manage gun courses"
              icon={GraduationCap}
            />
            <QuickLink href="/dashboard/settings" label="Notification settings" icon={CheckCircle2} />
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

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-white">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
