"use client";

import { useRef, useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SubmitButton } from "@/components/ui/submit-button";

interface RenewPopoverProps {
  recordId: string;
  action: (formData: FormData) => Promise<void> | void;
  defaultDate?: string;
  triggerLabel?: string;
  fieldName?: string;
  fieldLabel?: string;
  helpText?: string;
  submitLabel?: string;
  pendingLabel?: string;
}

export function RenewPopover({
  recordId,
  action,
  defaultDate,
  triggerLabel = "Renew",
  fieldName = "renewed_at",
  fieldLabel = "Renewal date",
  helpText = "We'll recalculate the next expiry from this date.",
  submitLabel = "Confirm renewal",
  pendingLabel = "Renewing…",
}: RenewPopoverProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const today = defaultDate ?? new Date().toISOString().split("T")[0];

  const handleAction = async (formData: FormData) => {
    await action(formData);
    setOpen(false);
    formRef.current?.reset();
  };

  const inputId = `${fieldName}-${recordId}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="sm">
          <RefreshCw className="h-3.5 w-3.5" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <form ref={formRef} action={handleAction} className="space-y-3">
          <input type="hidden" name="record_id" value={recordId} />
          <div className="space-y-1.5">
            <Label
              htmlFor={inputId}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
            >
              <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
              {fieldLabel}
            </Label>
            <Input
              id={inputId}
              name={fieldName}
              type="date"
              defaultValue={today}
              required
              className="h-9"
            />
            <p className="text-[11px] text-slate-500">{helpText}</p>
          </div>
          <SubmitButton size="sm" className="w-full" pendingLabel={pendingLabel}>
            {submitLabel}
          </SubmitButton>
        </form>
      </PopoverContent>
    </Popover>
  );
}
