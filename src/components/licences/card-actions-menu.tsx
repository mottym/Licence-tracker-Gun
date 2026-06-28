"use client";

import { useState } from "react";
import { MoreHorizontal, AlertOctagon, Undo2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CardActionsMenuProps {
  recordId: string;
  isMarkedExpired: boolean;
  confirmExpiredAction: (formData: FormData) => Promise<void> | void;
  deleteAction: (formData: FormData) => Promise<void> | void;
  deleteConfirmMessage?: string;
}

export function CardActionsMenu({
  recordId,
  isMarkedExpired,
  confirmExpiredAction,
  deleteAction,
  deleteConfirmMessage = "Delete this record? This cannot be undone.",
}: CardActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const handleToggleExpired = () => {
    const data = new FormData();
    data.set("record_id", recordId);
    data.set("manually_marked_expired", isMarkedExpired ? "false" : "true");
    void confirmExpiredAction(data);
    setOpen(false);
  };

  const handleDelete = () => {
    if (!window.confirm(deleteConfirmMessage)) {
      setOpen(false);
      return;
    }
    const data = new FormData();
    data.set("record_id", recordId);
    void deleteAction(data);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="More actions"
          className="h-9 w-9 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onSelect={handleToggleExpired}>
          {isMarkedExpired ? (
            <>
              <Undo2 className="h-3.5 w-3.5 text-slate-500" />
              Clear expired
            </>
          ) : (
            <>
              <AlertOctagon className="h-3.5 w-3.5 text-amber-600" />
              Mark expired
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
