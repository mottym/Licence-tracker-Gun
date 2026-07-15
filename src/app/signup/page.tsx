import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/marketing/auth-layout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Create account",
  description: `Create a free ${siteConfig.name} account to track gun license renewals across all US states with email and push reminders.`,
  alternates: {
    canonical: `${siteConfig.url}/signup`,
  },
  openGraph: {
    title: `Create account | ${siteConfig.name}`,
    description: `Start tracking gun license renewals for free with ${siteConfig.name}.`,
    url: `${siteConfig.url}/signup`,
  },
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Set up tracking for all your gun licenses in minutes."
    >
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
