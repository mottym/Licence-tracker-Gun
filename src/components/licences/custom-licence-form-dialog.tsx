"use client";

import { useRef, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CustomLicenceWithStatus } from "@/types/database";

interface CustomLicenceFormDialogProps {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void> | void;
  licence?: CustomLicenceWithStatus;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "lg";
  triggerClassName?: string;
}

export function CustomLicenceFormDialog({
  mode,
  action,
  licence,
  triggerLabel,
  triggerVariant,
  triggerSize,
  triggerClassName,
}: CustomLicenceFormDialogProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    await action(formData);
    setOpen(false);
    formRef.current?.reset();
  };

  const idPrefix =
    mode === "create" ? "new-custom" : `edit-custom-${licence?.id ?? ""}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button
            variant={triggerVariant ?? "default"}
            size={triggerSize ?? "default"}
            className={triggerClassName}
          >
            <Plus className="h-4 w-4" />
            {triggerLabel ?? "Add custom license"}
          </Button>
        ) : (
          <Button
            variant={triggerVariant ?? "outline"}
            size={triggerSize ?? "sm"}
            className={triggerClassName}
          >
            <Pencil className="h-3.5 w-3.5" />
            {triggerLabel ?? "Edit"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add custom license" : "Edit custom license"}
          </DialogTitle>
          <DialogDescription>
            Track any credential — driver&apos;s license, OSHA card,
            certification — by entering its expiry date directly.
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          action={handleAction}
          className="space-y-5"
          encType="multipart/form-data"
        >
          {mode === "edit" && licence ? (
            <input type="hidden" name="record_id" value={licence.id} />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor={`${idPrefix}-name`}>Name</Label>
              <Input
                id={`${idPrefix}-name`}
                name="name"
                defaultValue={licence?.name ?? ""}
                placeholder="e.g. NJ Driver's License, OSHA 30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-issuer`}>Issuer (optional)</Label>
              <Input
                id={`${idPrefix}-issuer`}
                name="issuer"
                defaultValue={licence?.issuer ?? ""}
                placeholder="e.g. NJ MVC, OSHA"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-number`}>
                License number (optional)
              </Label>
              <Input
                id={`${idPrefix}-number`}
                name="licence_number"
                defaultValue={licence?.licence_number ?? ""}
                placeholder="e.g. D1234-56789"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-issued`}>Issue date (optional)</Label>
              <Input
                id={`${idPrefix}-issued`}
                name="issued_at"
                type="date"
                defaultValue={licence?.issued_at ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-expires`}>Expires on</Label>
              <Input
                id={`${idPrefix}-expires`}
                name="expires_at"
                type="date"
                defaultValue={licence?.expires_at ?? ""}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-reminder`}>
                Remind me (days before expiry)
              </Label>
              <Input
                id={`${idPrefix}-reminder`}
                name="renewal_reminder_days"
                type="number"
                min={0}
                max={365}
                defaultValue={licence?.renewal_reminder_days ?? 60}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-photo`}>
                {mode === "create"
                  ? "License photo (optional)"
                  : "Replace photo (optional)"}
              </Label>
              <Input
                id={`${idPrefix}-photo`}
                name="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
            <input
              type="checkbox"
              name="auto_renew"
              defaultChecked={licence?.auto_renew ?? false}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium text-slate-700">Auto-renew</span>
              <span className="block text-xs text-slate-500">
                Roll the expiry forward automatically each cycle. Requires an issue
                date so the renewal period can be calculated.
              </span>
            </span>
          </label>

          <details className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 group">
            <summary className="cursor-pointer list-none text-sm font-medium text-slate-700 group-open:mb-3">
              Notes
              {mode === "edit" && licence?.photo_url
                ? " · Remove existing photo"
                : ""}
            </summary>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
                <textarea
                  id={`${idPrefix}-notes`}
                  name="notes"
                  defaultValue={licence?.notes ?? ""}
                  className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  placeholder="Anything to remember"
                />
              </div>

              {mode === "edit" && licence?.photo_url ? (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="remove_photo" />
                  Remove existing photo
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
            <SubmitButton>
              {mode === "create" ? "Add license" : "Save changes"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
