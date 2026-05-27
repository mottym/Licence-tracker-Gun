import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your licences and renewal reminders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm mode="login" />
          <p className="text-sm text-slate-600">
            New here?{" "}
            <Link href="/signup" className="font-medium text-slate-900 underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
