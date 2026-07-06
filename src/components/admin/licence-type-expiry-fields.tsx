"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type ExpiryMode = "standard" | "birthday" | "never";

interface LicenceTypeExpiryFieldsProps {
  idPrefix: string;
  defaultMode?: ExpiryMode;
  defaultMonths?: number | null;
  defaultDays?: number | null;
}

export function LicenceTypeExpiryFields({
  idPrefix,
  defaultMode = "standard",
  defaultMonths,
  defaultDays,
}: LicenceTypeExpiryFieldsProps) {
  const [mode, setMode] = useState<ExpiryMode>(defaultMode);
  const showRules = mode !== "never";

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-expiry-mode`}>Expiry</Label>
        <Select
          id={`${idPrefix}-expiry-mode`}
          name="expiry_mode"
          value={mode}
          onChange={(event) => setMode(event.target.value as ExpiryMode)}
        >
          <option value="standard">Fixed period</option>
          <option value="birthday">Expires on birthday</option>
          <option value="never">Never expires</option>
        </Select>
      </div>

      {showRules ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-months`}>
              Expiration (months) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id={`${idPrefix}-months`}
              name="expiration_months"
              type="number"
              min={1}
              defaultValue={defaultMonths ?? ""}
              required
              placeholder="e.g. 60"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-days`}>
              Processing (days) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id={`${idPrefix}-days`}
              name="renewal_processing_days"
              type="number"
              min={0}
              defaultValue={defaultDays ?? ""}
              required
              placeholder="e.g. 90"
            />
            <p className="text-xs text-slate-500">
              {mode === "birthday"
                ? "Renewal window opens this many days before your birthday expiry."
                : "Renewal window opens this many days before expiry."}
            </p>
          </div>
        </>
      ) : null}
    </>
  );
}

export function expiryModeForType(type: {
  requires_renewal: boolean;
  expires_on_birthday: boolean;
}): ExpiryMode {
  if (!type.requires_renewal) return "never";
  if (type.expires_on_birthday) return "birthday";
  return "standard";
}
