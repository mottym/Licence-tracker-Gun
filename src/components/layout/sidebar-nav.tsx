"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  IdCard,
  LayoutDashboard,
  Layers,
  Map,
  Menu,
  Settings,
  ShieldCheck,
  Sliders,
  Target,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: string;
  exact?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const userSection: NavSection = {
  label: "Records",
  items: [
    { href: "/dashboard", label: "Overview", match: "/dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/gun-licences", label: "Gun licences", match: "/dashboard/gun-licences", icon: Target },
    { href: "/dashboard/gun-courses", label: "Gun courses", match: "/dashboard/gun-courses", icon: GraduationCap },
    { href: "/dashboard/custom-licences", label: "Custom licences", match: "/dashboard/custom-licences", icon: IdCard },
  ],
};

const settingsSection: NavSection = {
  label: "Account",
  items: [{ href: "/dashboard/settings", label: "Settings", match: "/dashboard/settings", icon: Settings }],
};

const adminSection: NavSection = {
  label: "Admin",
  items: [
    { href: "/admin", label: "Admin home", match: "/admin", icon: ShieldCheck, exact: true },
    { href: "/admin/users", label: "Users", match: "/admin/users", icon: Users },
    { href: "/admin/states", label: "States", match: "/admin/states", icon: Map },
    { href: "/admin/groups", label: "Groups", match: "/admin/groups", icon: Layers },
    { href: "/admin/taxonomy", label: "Categories", match: "/admin/taxonomy", icon: Sliders },
  ],
};

interface SidebarNavProps {
  isAdmin?: boolean;
  userEmail?: string;
}

function isItemActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.match;
  if (item.match === "/dashboard") return pathname === "/dashboard";
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}

export function SidebarNav({ isAdmin = false, userEmail }: SidebarNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sections = [userSection, settingsSection, ...(isAdmin ? [adminSection] : [])];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-900" onClick={closeMobile}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            GL
          </span>
          <span className="text-sm font-semibold tracking-tight">Licence Tracker</span>
        </Link>
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={closeMobile}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <SidebarContent
              pathname={pathname}
              sections={sections}
              userEmail={userEmail}
              onNavigate={closeMobile}
            />
          </div>
        </div>
      ) : null}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <SidebarContent pathname={pathname} sections={sections} userEmail={userEmail} />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  pathname: string;
  sections: NavSection[];
  userEmail?: string;
  onNavigate?: () => void;
}

function SidebarContent({ pathname, sections, userEmail, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          GL
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-slate-900">Licence Tracker</p>
          <p className="text-xs text-slate-500">Stay on top of renewals</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isItemActive(pathname, item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-400")} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        {userEmail ? (
          <div className="mb-3">
            <p className="text-xs uppercase tracking-wider text-slate-400">Signed in</p>
            <p className="truncate text-sm text-slate-700" title={userEmail}>
              {userEmail}
            </p>
          </div>
        ) : null}
        <SignOutButton />
      </div>
    </div>
  );
}
