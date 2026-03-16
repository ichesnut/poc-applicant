"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewApplicationLink() {
  return (
    <Link href="/apply" className={cn(buttonVariants())}>
      New Application
    </Link>
  );
}
