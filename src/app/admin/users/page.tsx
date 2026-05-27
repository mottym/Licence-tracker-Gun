import { cancelInvitation, updateUserRole } from "./actions";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function AdminUsersPage() {
  const service = await createServiceClient();

  const [{ data: invitations }, { data: profiles }] = await Promise.all([
    service
      .from("invitations")
      .select("*")
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
    service.from("profiles").select("*").order("email", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite someone</CardTitle>
          <CardDescription>
            Send an email invitation. They choose a password when they accept. Pick
            User or Admin — the role is applied when they join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>Waiting for the recipient to accept the email invite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(invitations ?? []).length === 0 ? (
            <p className="text-sm text-slate-600">No pending invitations.</p>
          ) : (
            (invitations ?? []).map((invite) => (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/30 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{invite.email}</p>
                  <p className="text-sm text-slate-600">
                    Role: <span className="capitalize">{invite.role}</span>
                    {" · "}
                    Sent {new Date(invite.created_at).toLocaleDateString()}
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

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>
            Change roles for existing accounts. Inviting an existing email updates their
            role immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(profiles ?? []).map((user: Profile) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{user.email}</p>
                <p className="text-sm capitalize text-slate-600">Current: {user.role}</p>
              </div>
              <form action={updateUserRole} className="flex items-center gap-2">
                <input type="hidden" name="user_id" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <Button type="submit" variant="secondary" size="sm">
                  Update
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
