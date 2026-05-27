import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Set up tracking for all your licences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm mode="signup" />
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-slate-900 underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
