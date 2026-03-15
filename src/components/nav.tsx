import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Nav() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Applicant
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Dashboard
              </Link>
              <Link
                href="/apply"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Apply
              </Link>
              <Link
                href="/profile"
                className="text-muted-foreground hover:text-foreground transition"
              >
                {session.user.name ?? "Profile"}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
