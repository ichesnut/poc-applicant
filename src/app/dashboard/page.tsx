import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NewApplicationLink } from "./new-application-link";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-yellow-100 text-yellow-700",
  },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
  DENIED: { label: "Denied", className: "bg-red-100 text-red-700" },
  MORE_INFO_NEEDED: {
    label: "More Info Needed",
    className: "bg-orange-100 text-orange-700",
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const applications = await prisma.loanApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name ?? session.user.email}.
          </p>
        </div>
        <NewApplicationLink />
      </div>

      {applications.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          No applications yet. Start a new application to get going.
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => {
            const status = STATUS_LABELS[app.status] ?? {
              label: app.status,
              className: "bg-gray-100 text-gray-700",
            };
            return (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{app.referenceId}</CardTitle>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <CardDescription>
                    {app.loanPurpose === "other" && app.purposeOther
                      ? app.purposeOther
                      : app.loanPurpose.replace(/_/g, " ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-medium">
                        {formatCurrency(app.loanAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Term: </span>
                      <span className="font-medium">
                        {app.loanTerm} months
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Applied: </span>
                      <span className="font-medium">
                        {formatDate(app.submittedAt ?? app.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
