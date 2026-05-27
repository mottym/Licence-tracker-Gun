/**
 * Email verification is disabled while SMTP is not configured.
 * Set NEXT_PUBLIC_DISABLE_EMAIL_VERIFICATION=false when Supabase SMTP is ready.
 */
export function skipEmailVerification(): boolean {
  return process.env.NEXT_PUBLIC_DISABLE_EMAIL_VERIFICATION !== "false";
}
