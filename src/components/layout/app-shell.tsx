import type { ReactNode } from "react";
import { getProfile } from "@/lib/data";
import { SiteHeader } from "@/components/layout/site-header";

export const dynamic = "force-dynamic";

export async function AppShell({ children }: { children: ReactNode }) {
  const profile = await getProfile();

  return (
    <>
      <SiteHeader
        isAdmin={profile?.role === "admin"}
        userEmail={profile?.email}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
