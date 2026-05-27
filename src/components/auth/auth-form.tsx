"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithoutEmailVerification } from "@/app/auth/actions";
import { skipEmailVerification } from "@/lib/auth-config";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      const redirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") ?? "/dashboard"
          : "/dashboard";
      router.push(redirect);
      router.refresh();
      return;
    }

    if (skipEmailVerification()) {
      const { error: createError } = await signUpWithoutEmailVerification(
        email,
        password,
      );
      if (createError) {
        setError(createError);
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Email verification enabled — requires Supabase SMTP / confirm-email flow
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      // options: {
      //   emailRedirectTo: `${window.location.origin}/auth/callback`,
      // },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      router.push("/login");
    }

    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-2">
        <Button className="w-full" type="submit" disabled={loading}>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          Continue with Google
        </Button>
      </div>
    </form>
  );
}
