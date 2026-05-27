import { requireAdmin } from "@/lib/admin";
import { cancelInvitation } from "./actions";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { UserRoleControls } from "@/components/admin/user-role-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function AdminUsersPage() {
  const { profile: currentAdmin } = await requireAdmin();
  const service = await createServiceClient();

  const [{ data: invitations }, { data: profiles }] = await Promise.all([
    service
      .from("invitations")
      .select("*")
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
    service.from("profiles").select("*").order("email", { ascending: true }),
  ]);

  const admins = (profiles ?? []).filter((p) => p.role === "admin");
  const users = (profiles ?? []).filter((p) => p.role !== "admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Users &amp; admins
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Promote existing users to admin or add new people by email.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admins ({admins.length})</CardTitle>
          <CardDescription>
            Admins can manage states, groups, and other users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {admins.length === 0 ? (
            <p className="text-sm text-slate-600">No admins yet.</p>
          ) : (
            admins.map((user: Profile) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4"
              >
                <p className="font-medium text-slate-900">{user.email}</p>
                <UserRoleControls
                  userId={user.id}
                  role={user.role}
                  isCurrentUser={user.id === currentAdmin.id}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>
            Click &quot;Make admin&quot; to grant admin panel access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-slate-600">No regular users yet.</p>
          ) : (
            users.map((user: Profile) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 p-4"
              >
                <p className="font-medium text-slate-900">{user.email}</p>
                <UserRoleControls
                  userId={user.id}
                  role={user.role}
                  isCurrentUser={user.id === currentAdmin.id}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add someone</CardTitle>
          <CardDescription>
            Add by email and role. Without SMTP, they sign up at /signup with that
            email — choose Admin to make them an admin when they join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending sign-ups</CardTitle>
          <CardDescription>
            Waiting for them to register at /signup with this email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(invitations ?? []).length === 0 ? (
            <p className="text-sm text-slate-600">No pending sign-ups.</p>
          ) : (
            (invitations ?? []).map((invite) => (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/30 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{invite.email}</p>
                  <p className="text-sm text-slate-600">
                    Will join as{" "}
                    <span className="capitalize font-medium">{invite.role}</span>
                    {" · "}
                    Added {new Date(invite.created_at).toLocaleDateString()}
                  </p>
                </div>
                <form action={cancelInvitation}>
                  <input type="hidden" name="id" value={invite.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Cancel
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
