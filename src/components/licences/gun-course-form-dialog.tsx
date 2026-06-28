"use client";

import { useRef, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { GunCourseWithStatus, Organization, RecordType } from "@/types/database";

interface GunCourseFormDialogProps {
  mode: "create" | "edit";
  organizations: Organization[];
  courseTypes: RecordType[];
  action: (formData: FormData) => Promise<void> | void;
  course?: GunCourseWithStatus;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
  triggerClassName?: string;
}

export function GunCourseFormDialog({
  mode,
  organizations,
  courseTypes,
  action,
  course,
  triggerLabel,
  triggerVariant,
  triggerClassName,
}: GunCourseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    await action(formData);
    setOpen(false);
    formRef.current?.reset();
  };

  const idPrefix = mode === "create" ? "new-course" : `edit-course-${course?.id ?? ""}`;
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button variant={triggerVariant ?? "default"} className={triggerClassName}>
            <Plus className="h-4 w-4" />
            {triggerLabel ?? "Add course"}
          </Button>
        ) : (
          <Button variant={triggerVariant ?? "outline"} size="sm" className={triggerClassName}>
            <Pencil className="h-3.5 w-3.5" />
            {triggerLabel ?? "Edit"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add gun course" : "Edit gun course"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Log a completed course. Renewal tracking applies only when the course type requires renewal."
              : "Update course details. To record a renewal, use the Renew button on the course card."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={handleAction} className="space-y-5" encType="multipart/form-data">
          {mode === "edit" && course ? (
            <input type="hidden" name="record_id" value={course.id} />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-org`}>Organization</Label>
              <Select
                id={`${idPrefix}-org`}
                name="organization_id"
                defaultValue={course?.organization_id ?? ""}
                required
              >
                <option value="">Select organization…</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-type`}>Course type</Label>
              <Select
                id={`${idPrefix}-type`}
                name="record_type_id"
                defaultValue={course?.record_type_id ?? ""}
                required
              >
                <option value="">Select type…</option>
                {courseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-completed`}>Completed</Label>
              <Input
                id={`${idPrefix}-completed`}
                name="completed_at"
                type="date"
                defaultValue={course?.completed_at ?? today}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-renewed`}>Last renewed (optional)</Label>
              <Input
                id={`${idPrefix}-renewed`}
                name="renewed_at"
                type="date"
                defaultValue={course?.renewed_at ?? ""}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor={`${idPrefix}-certificate`}>
                {mode === "create" ? "Certificate (optional)" : "Replace certificate (optional)"}
              </Label>
              <Input
                id={`${idPrefix}-certificate`}
                name="certificate"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>
          </div>

          <details className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 group">
            <summary className="cursor-pointer list-none text-sm font-medium text-slate-700 group-open:mb-3">
              Notes
              {mode === "edit" && course?.certificate_url ? " · Remove existing certificate" : ""}
            </summary>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
                <textarea
                  id={`${idPrefix}-notes`}
                  name="notes"
                  defaultValue={course?.notes ?? ""}
                  className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
              </div>

              {mode === "edit" && course?.certificate_url ? (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="remove_certificate" />
                  Remove existing certificate
                </label>
              ) : null}
            </div>
          </details>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton>{mode === "create" ? "Add course" : "Save changes"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
