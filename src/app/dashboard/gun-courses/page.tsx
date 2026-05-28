import { GraduationCap } from "lucide-react";
import {
  confirmExpiredGunCourse,
  createGunCourse,
  deleteGunCourse,
  renewGunCourse,
  updateGunCourse,
} from "./actions";
import { getGunCourses, getTaxonomyOptions } from "@/lib/data";
import { GunCourseCard } from "@/components/licences/gun-course-card";
import { GunCourseFormDialog } from "@/components/licences/gun-course-form-dialog";

export default async function GunCoursesPage() {
  const [records, taxonomy] = await Promise.all([getGunCourses(), getTaxonomyOptions()]);
  const courseTypes = taxonomy.recordTypes.filter(
    (type) => type.record_categories?.key === "gun_course",
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Gun courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Log completed courses and (when required) keep certifications current.
          </p>
        </div>
        <GunCourseFormDialog
          mode="create"
          organizations={taxonomy.organizations}
          courseTypes={courseTypes}
          action={createGunCourse}
          triggerLabel="Add gun course"
        />
      </header>

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((course) => (
            <GunCourseCard
              key={course.id}
              course={course}
              organizations={taxonomy.organizations}
              courseTypes={courseTypes}
              renewAction={renewGunCourse}
              updateAction={updateGunCourse}
              confirmExpiredAction={confirmExpiredGunCourse}
              deleteAction={deleteGunCourse}
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
        <GraduationCap className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">No gun courses yet</h2>
      <p className="mt-1 text-sm text-slate-500">
        Add a completed course to track expiry and renewal requirements.
      </p>
    </div>
  );
}
