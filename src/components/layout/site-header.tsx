"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

const baseItems = [
  { href: "/dashboard", label: "Dashboard", match: "/dashboard" },
  { href: "/dashboard/licences", label: "My Licences", match: "/dashboard/licences" },
  { href: "/dashboard/settings", label: "Settings", match: "/dashboard/settings" },
];

const adminItem = { href: "/admin", label: "Admin", match: "/admin" };

interface SiteHeaderProps {
  isAdmin?: boolean;
  userEmail?: string;
}

export function SiteHeader({ isAdmin = false, userEmail }: SiteHeaderProps) {
  const pathname = usePathname();
  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2.5 text-slate-900 transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            GL
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            Gun Licence Tracker
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const isActive =
              item.match === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.match);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {userEmail ? (
            <span
              className="hidden max-w-[140px] truncate text-xs text-slate-500 lg:inline"
              title={userEmail}
            >
              {userEmail}
            </span>
          ) : null}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
