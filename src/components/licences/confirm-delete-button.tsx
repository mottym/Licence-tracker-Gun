"use client";

import type { MouseEvent } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ConfirmDeleteButtonProps extends Omit<ButtonProps, "onClick"> {
  message?: string;
  pendingLabel?: string;
}

export function ConfirmDeleteButton({
  message = "Are you sure you want to delete this licence?",
  pendingLabel = "Deleting...",
  children,
  disabled,
  ...props
}: ConfirmDeleteButtonProps) {
  const { pending } = useFormStatus();

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (pending) {
      event.preventDefault();
      return;
    }
    if (!window.confirm(message)) {
      event.preventDefault();
    }
  };

  return (
    <Button
      {...props}
      onClick={onClick}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          <span>{pendingLabel}</span>
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
