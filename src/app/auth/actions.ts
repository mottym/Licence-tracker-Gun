"use server";

import { skipEmailVerification } from "@/lib/auth-config";
import { createServiceClient } from "@/lib/supabase/server";

export async function signUpWithoutEmailVerification(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  if (!skipEmailVerification()) {
    return { error: "Email verification is enabled." };
  }

  const service = await createServiceClient();
  const { error } = await service.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}
