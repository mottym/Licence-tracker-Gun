"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/licences", label: "My Licences" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold text-slate-900">
          Gun Licence Tracker
        </Link>
        <nav className="flex items-center gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                pathname.startsWith(item.href) && "bg-slate-100 text-slate-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
