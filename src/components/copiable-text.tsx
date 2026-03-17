"use client";

import { CopyButton } from "@/components/copy-button";

interface CopiableTextProps {
  value: string;
  className?: string;
}

export function CopiableText({ value, className }: CopiableTextProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      {value}
      <CopyButton value={value} />
    </span>
  );
}
