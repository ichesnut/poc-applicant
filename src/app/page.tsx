"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Apply for a Loan</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Submit your loan application online. Track your status in real time. Get funded faster.
      </p>
      <div className="flex gap-4">
        <Link href="/apply" className={cn(buttonVariants({ size: "lg" }))}>
          Start Application
        </Link>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          View Dashboard
        </Link>
      </div>
    </div>
  );
}
