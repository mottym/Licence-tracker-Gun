"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/database";

interface UserRoleControlsProps {
  userId: string;
  role: UserRole;
  isCurrentUser: boolean;
}

export function UserRoleControls({
  userId,
  role,
  isCurrentUser,
}: UserRoleControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const changeRole = (nextRole: UserRole) => {
    startTransition(async () => {
      const result = await setUserRole(userId, nextRole);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  const isAdmin = role === "admin";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={
          isAdmin
            ? "rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white"
            : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
        }
      >
        {isAdmin ? "Admin" : "User"}
      </span>
      {!isAdmin ? (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => changeRole("admin")}
        >
          Make admin
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || isCurrentUser}
          onClick={() => changeRole("user")}
          title={isCurrentUser ? "You cannot remove your own admin access" : undefined}
        >
          Remove admin
        </Button>
      )}
      {isCurrentUser && isAdmin ? (
        <span className="text-xs text-slate-500">(you)</span>
      ) : null}
    </div>
  );
}
