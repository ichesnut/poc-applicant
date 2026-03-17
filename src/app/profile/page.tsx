import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CopiableText } from "@/components/copiable-text";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-12">
      <h1 className="text-2xl font-bold">Your Profile</h1>

      <div className="rounded-lg border border-border p-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="text-lg font-medium">{session.user.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-lg font-medium">
            <CopiableText value={session.user.email ?? ""} />
          </p>
        </div>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit" variant="outline">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
