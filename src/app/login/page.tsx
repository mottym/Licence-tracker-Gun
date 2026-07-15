import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/marketing/auth-layout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${siteConfig.name} to access your gun licence dashboard, renewal reminders, and compliance tracking.`,
  alternates: {
    canonical: `${siteConfig.url}/login`,
  },
  openGraph: {
    title: `Sign in | ${siteConfig.name}`,
    description: `Access your gun licence dashboard and renewal reminders on ${siteConfig.name}.`,
    url: `${siteConfig.url}/login`,
  },
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your licences and renewal reminders."
    >
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{" "}
        <Link href="/signup" className="font-medium text-slate-900 underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
