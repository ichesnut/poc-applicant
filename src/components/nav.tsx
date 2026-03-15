import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Applicant
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">
            Dashboard
          </Link>
          <Link href="/apply" className="text-muted-foreground hover:text-foreground transition">
            Apply
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground transition">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
