import type { ReactNode } from "react";
import { getProfile } from "@/lib/data";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export const dynamic = "force-dynamic";

export async function AppShell({ children }: { children: ReactNode }) {
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <SidebarNav
        isAdmin={profile?.role === "admin"}
        userEmail={profile?.email}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
