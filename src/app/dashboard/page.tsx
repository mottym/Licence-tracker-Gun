import Link from "next/link";
import { getUserLicences } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/licences/calculate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const licences = await getUserLicences();
  const expiringSoon = licences.filter((licence) => licence.daysUntilExpiry <= 30).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Your licence status at a glance.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Total licences</p>
            <p className="mt-1 text-2xl font-semibold">{licences.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Renewal within 30 days</p>
            <p className="mt-1 text-2xl font-semibold">{expiringSoon}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Expired</p>
            <p className="mt-1 text-2xl font-semibold">
              {licences.filter((licence) => licence.status === "expired").length}
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
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3"
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
          <Button asChild variant="outline">
            <Link href="/dashboard/licences">Manage licences</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
