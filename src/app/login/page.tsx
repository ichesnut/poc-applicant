"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Log in to your account to continue
        </p>
      </div>

      <form action={action} className="space-y-4">
        {state.error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Your password"
            required
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Logging in…" : "Log In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary underline underline-offset-4"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
