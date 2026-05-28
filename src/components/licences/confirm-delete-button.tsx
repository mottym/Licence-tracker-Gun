"use client";

import type { MouseEvent } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ConfirmDeleteButtonProps extends Omit<ButtonProps, "onClick"> {
  message?: string;
}

export function ConfirmDeleteButton({
  message = "Are you sure you want to delete this licence?",
  ...props
}: ConfirmDeleteButtonProps) {
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(message)) {
      event.preventDefault();
    }
  };

  return <Button {...props} onClick={onClick} />;
}
