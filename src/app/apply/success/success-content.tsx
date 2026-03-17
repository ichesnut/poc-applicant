"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const email = searchParams.get("email");
  const firstName = searchParams.get("firstName");
  const lastName = searchParams.get("lastName");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-2">
            <CheckCircle2 className="size-12 text-green-600" />
          </div>
          <CardTitle className="text-xl">Application Submitted</CardTitle>
          <CardDescription>
            Your loan application has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ref && (
            <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
              Reference ID:{" "}
              <span className="font-mono font-semibold text-foreground">
                {ref}
              </span>
              <CopyButton value={ref} />
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            We&apos;ll review your application and get back to you soon. You can
            track its status from your dashboard.
          </p>
          {email && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
              <p className="font-medium text-blue-900">
                Complete your account setup
              </p>
              <p className="mt-1 text-blue-700">
                Create a password so you can log in anytime to check your
                application status.
              </p>
              <Link
                href={`/register?email=${encodeURIComponent(email)}${firstName ? `&firstName=${encodeURIComponent(firstName)}` : ""}${lastName ? `&lastName=${encodeURIComponent(lastName)}` : ""}`}
                className={cn(buttonVariants(), "mt-3")}
              >
                Create Account
              </Link>
            </div>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/apply"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              New Application
            </Link>
            {!email && (
              <Link href="/dashboard" className={cn(buttonVariants())}>
                Go to Dashboard
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
