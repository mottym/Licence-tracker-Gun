"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  pendingLabel?: string;
}

export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(className)}
      {...props}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          <span>{pendingLabel ?? "Saving..."}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
