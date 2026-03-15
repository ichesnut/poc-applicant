"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

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
            <p className="text-sm text-muted-foreground">
              Reference ID:{" "}
              <span className="font-mono font-semibold text-foreground">
                {ref}
              </span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            We&apos;ll review your application and get back to you soon. You can
            track its status from your dashboard.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/apply"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              New Application
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Go to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
