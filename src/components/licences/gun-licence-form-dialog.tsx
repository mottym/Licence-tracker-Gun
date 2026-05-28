"use client";

import { useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
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
import type { GunLicenceWithStatus, Jurisdiction, RecordType } from "@/types/database";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface GunLicenceFormDialogProps {
  mode: "create" | "edit";
  jurisdictions: Jurisdiction[];
  licenceTypes: RecordType[];
  action: (formData: FormData) => Promise<void> | void;
  licence?: GunLicenceWithStatus;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "lg";
}

export function GunLicenceFormDialog({
  mode,
  jurisdictions,
  licenceTypes,
  action,
  licence,
  triggerLabel,
  triggerVariant,
  triggerSize,
}: GunLicenceFormDialogProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    await action(formData);
    setOpen(false);
    formRef.current?.reset();
  };

  const idPrefix = mode === "create" ? "new" : `edit-${licence?.id ?? ""}`;
  const today = new Date().toISOString().split("T")[0];

  const defaultJurisdictionId = licence?.jurisdiction_id ?? "";
  const defaultTypeId = licence?.record_type_id ?? "";
  const defaultLicenceNumber = licence?.licence_number ?? "";
  const defaultIssuedAt = licence?.issued_at ?? "";
  const defaultRenewedAt = licence?.last_renewed_at ?? today;
  const defaultBirthMonth = licence?.birth_month ?? "";
  const defaultBirthDay = licence?.birth_day ?? "";
  const defaultNotes = licence?.notes ?? "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button variant={triggerVariant ?? "default"} size={triggerSize ?? "default"}>
            <Plus className="h-4 w-4" />
            {triggerLabel ?? "Add licence"}
          </Button>
        ) : (
          <Button variant={triggerVariant ?? "outline"} size={triggerSize ?? "sm"}>
            <Pencil className="h-3.5 w-3.5" />
            {triggerLabel ?? "Edit"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add gun licence" : "Edit gun licence"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Choose jurisdiction and licence type. We'll calculate renewal dates from the state's rules."
              : "Update any details that have changed. Renewing? Use the Renew button on the licence card instead."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={handleAction} className="space-y-5" encType="multipart/form-data">
          {mode === "edit" && licence ? (
            <input type="hidden" name="record_id" value={licence.id} />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-jurisdiction`}>Jurisdiction</Label>
              <Select
                id={`${idPrefix}-jurisdiction`}
                name="jurisdiction_id"
                defaultValue={defaultJurisdictionId}
                required
              >
                <option value="">Select jurisdiction…</option>
                {jurisdictions.map((jurisdiction) => (
                  <option key={jurisdiction.id} value={jurisdiction.id}>
                    {jurisdiction.name}
                    {jurisdiction.states ? ` (${jurisdiction.states.code})` : ""}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-type`}>Licence type</Label>
              <Select
                id={`${idPrefix}-type`}
                name="record_type_id"
                defaultValue={defaultTypeId}
                required
              >
                <option value="">Select type…</option>
                {licenceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-number`}>Licence number</Label>
              <Input
                id={`${idPrefix}-number`}
                name="licence_number"
                defaultValue={defaultLicenceNumber}
                placeholder="e.g. NYC-12345"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-issued`}>Issue date (optional)</Label>
              <Input
                id={`${idPrefix}-issued`}
                name="issued_at"
                type="date"
                defaultValue={defaultIssuedAt}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-renewed`}>Last renewed</Label>
              <Input
                id={`${idPrefix}-renewed`}
                name="last_renewed_at"
                type="date"
                defaultValue={defaultRenewedAt}
                required
              />
              <p className="text-xs text-slate-500">
                Used as the start date when calculating expiry.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-photo`}>
                {mode === "create" ? "Licence photo (optional)" : "Replace photo (optional)"}
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

          <details className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 group">
            <summary className="cursor-pointer list-none text-sm font-medium text-slate-700 group-open:mb-3">
              Advanced
              <span className="ml-2 text-xs font-normal text-slate-500">
                Birthday (only used by states that expire on birthday) · Notes
                {mode === "edit" && licence?.photo_url ? " · Remove existing photo" : ""}
              </span>
            </summary>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`${idPrefix}-birthmonth`}>Birth month</Label>
                  <Select
                    id={`${idPrefix}-birthmonth`}
                    name="birth_month"
                    defaultValue={defaultBirthMonth ? String(defaultBirthMonth) : ""}
                  >
                    <option value="">—</option>
                    {MONTHS.map((month, idx) => (
                      <option key={month} value={idx + 1}>
                        {month}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${idPrefix}-birthday`}>Birth day</Label>
                  <Input
                    id={`${idPrefix}-birthday`}
                    name="birth_day"
                    type="number"
                    min={1}
                    max={31}
                    defaultValue={defaultBirthDay ? String(defaultBirthDay) : ""}
                    placeholder="e.g. 15"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
                <textarea
                  id={`${idPrefix}-notes`}
                  name="notes"
                  defaultValue={defaultNotes}
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
            <SubmitButton>{mode === "create" ? "Add licence" : "Save changes"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
