import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {session.user.name ?? session.user.email}. Your loan
        applications will appear here.
      </p>

      <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
        No applications yet. Start a new application to get going.
      </div>
    </div>
  );
}
