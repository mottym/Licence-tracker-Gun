import Link from "next/link";
import { getGunCourses, getGunLicences } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LicencesPage() {
  const [gunLicences, gunCourses] = await Promise.all([getGunLicences(), getGunCourses()]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Records moved to structured modules</CardTitle>
          <CardDescription>
            Licence tracking is now split into gun licences and gun courses with structured jurisdiction and type trees.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Existing records were auto-mapped. Use the new pages below for add/edit/renew actions.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/gun-licences">Open Gun Licences</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/gun-courses">Open Gun Courses</Link>
            </Button>
          </div>
          <p className="text-sm text-slate-600">
            Auto-mapped totals: {gunLicences.length} gun licences, {gunCourses.length} gun courses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
