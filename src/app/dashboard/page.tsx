import Link from "next/link";
import { getGunCourses, getGunLicences } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const [licences, courses] = await Promise.all([getGunLicences(), getGunCourses()]);
  const expiringSoon = licences.filter((licence) => licence.daysUntilExpiry <= 30).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Your licence status at a glance.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 ring-1 ring-slate-900/5">
            <p className="text-sm font-medium text-slate-600">Gun licences</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {licences.length}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 ring-1 ring-amber-900/5">
            <p className="text-sm font-medium text-amber-800/80">Renewal within 30 days</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-amber-900">
              {expiringSoon}
            </p>
          </div>
          <div className="rounded-xl border border-red-200/80 bg-red-50/50 p-4 ring-1 ring-red-900/5">
            <p className="text-sm font-medium text-red-800/80">Expired</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-red-900">
              {licences.filter((licence) => licence.status === "expired").length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 ring-1 ring-slate-900/5">
            <p className="text-sm font-medium text-slate-600">Gun courses</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {courses.length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming renewals</CardTitle>
          <CardDescription>Licences with the nearest renewal windows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {licences.slice(0, 5).map((licence) => (
            <div
              key={licence.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/30 p-4 transition-colors hover:bg-slate-50/60"
            >
              <div>
                <p className="font-medium text-slate-900">{licence.states?.name}</p>
                <p className="text-sm text-slate-600">Expires {formatDate(licence.expiresAt)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(licence.status)}`}>
                {statusLabel(licence.status)}
              </span>
            </div>
          ))}
          {licences.length === 0 ? (
            <p className="text-sm text-slate-600">No licences yet. Add one to start tracking.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/gun-licences">Manage gun licences</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/gun-courses">Manage gun courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
