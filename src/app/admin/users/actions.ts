"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { skipEmailVerification } from "@/lib/auth-config";
import { createServiceClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export type InviteActionState = {
  error?: string;
  success?: string;
} | null;

function normalizeEmail(value: FormDataEntryValue | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function parseRole(value: FormDataEntryValue | null): UserRole {
  return value === "admin" ? "admin" : "user";
}

export async function inviteUser(
  _prevState: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  try {
    const { userId } = await requireAdmin();
    const email = normalizeEmail(formData.get("email"));
    const role = parseRole(formData.get("role"));

    if (!email || !email.includes("@")) {
      return { error: "Enter a valid email address." };
    }

    const service = await createServiceClient();

    const { data: existingProfile } = await service
      .from("profiles")
      .select("id, role")
      .ilike("email", email)
      .maybeSingle();

    if (existingProfile) {
      const { error: updateError } = await service
        .from("profiles")
        .update({ role })
        .eq("id", existingProfile.id);

      if (updateError) {
        return { error: updateError.message };
      }

      await service
        .from("invitations")
        .update({ accepted_at: new Date().toISOString() })
        .ilike("email", email)
        .is("accepted_at", null);

      revalidatePath("/admin/users");
      return {
        success:
          role === "admin"
            ? `${email} is already registered — promoted to admin.`
            : `${email} is already registered — role set to user.`,
      };
    }

    await service
      .from("invitations")
      .delete()
      .ilike("email", email)
      .is("accepted_at", null);

    const { error: insertError } = await service.from("invitations").insert({
      email,
      role,
      invited_by: userId,
    });

    if (insertError) {
      return { error: insertError.message };
    }

    if (!skipEmailVerification()) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const { error: inviteError } = await service.auth.admin.inviteUserByEmail(
        email,
        { redirectTo: `${siteUrl}/auth/callback` },
      );

      if (inviteError) {
        await service
          .from("invitations")
          .delete()
          .ilike("email", email)
          .is("accepted_at", null);
        return { error: inviteError.message };
      }

      revalidatePath("/admin/users");
      const roleLabel = role === "admin" ? "admin" : "user";
      return {
        success: `Invitation email sent to ${email} as ${roleLabel}.`,
      };
    }

    // SMTP not configured — no invite email; user signs up at /signup with this email
    revalidatePath("/admin/users");
    const roleLabel = role === "admin" ? "admin" : "user";
    return {
      success: `Added ${email} as pending ${roleLabel}. They can create an account at /signup with this email (no email sent).`,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}

export async function cancelInvitation(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const service = await createServiceClient();
  await service.from("invitations").delete().eq("id", id).is("accepted_at", null);

  revalidatePath("/admin/users");
}

export async function updateUserRole(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const role = parseRole(formData.get("role"));

  if (!userId) return;

  const { profile } = await requireAdmin();
  if (userId === profile.id && role !== "admin") {
    return;
  }

  const service = await createServiceClient();
  await service.from("profiles").update({ role }).eq("id", userId);

  revalidatePath("/admin/users");
}
