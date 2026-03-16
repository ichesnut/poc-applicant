import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create demo users
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Johnson",
      hashedPassword: hashSync("password123", 10),
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob Smith",
      hashedPassword: hashSync("password123", 10),
    },
  });

  console.log(`Created users: ${alice.email}, ${bob.email}`);

  // Create loan applications in various statuses
  const apps = [
    {
      userId: alice.id,
      email: "alice@example.com",
      phone: "555-0101",
      status: "SUBMITTED" as const,
      loanAmount: 25000,
      loanTerm: 36,
      loanPurpose: "home_improvement",
      firstName: "Alice",
      lastName: "Johnson",
      dateOfBirth: new Date("1990-05-15"),
      street: "123 Oak Street",
      apartment: "Apt 4B",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      employmentStatus: "employed",
      employerName: "TechCorp Inc.",
      jobTitle: "Software Engineer",
      annualIncome: 95000,
      yearsAtJob: 3.5,
      totalAssets: 45000,
      totalDebts: 12000,
      monthlyExpenses: 3200,
      referenceId: "APP-2026-0001",
      submittedAt: new Date("2026-03-10T14:30:00Z"),
    },
    {
      userId: alice.id,
      email: "alice@example.com",
      phone: "555-0101",
      status: "DRAFT" as const,
      loanAmount: 10000,
      loanTerm: 12,
      loanPurpose: "debt_consolidation",
      firstName: "Alice",
      lastName: "Johnson",
      dateOfBirth: new Date("1990-05-15"),
      street: "123 Oak Street",
      apartment: "Apt 4B",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      employmentStatus: "employed",
      employerName: "TechCorp Inc.",
      jobTitle: "Software Engineer",
      annualIncome: 95000,
      yearsAtJob: 3.5,
      totalAssets: 45000,
      totalDebts: 12000,
      monthlyExpenses: 3200,
      referenceId: "APP-2026-0002",
    },
    {
      userId: bob.id,
      email: "bob@example.com",
      phone: "555-0202",
      status: "APPROVED" as const,
      loanAmount: 50000,
      loanTerm: 60,
      loanPurpose: "business",
      firstName: "Bob",
      lastName: "Smith",
      dateOfBirth: new Date("1985-11-22"),
      street: "456 Elm Avenue",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      employmentStatus: "self_employed",
      employerName: "Smith Consulting LLC",
      jobTitle: "Owner",
      annualIncome: 120000,
      yearsAtJob: 7,
      totalAssets: 180000,
      totalDebts: 35000,
      monthlyExpenses: 5500,
      referenceId: "APP-2026-0003",
      submittedAt: new Date("2026-03-01T09:00:00Z"),
    },
    {
      userId: bob.id,
      email: "bob@example.com",
      phone: "555-0202",
      status: "DENIED" as const,
      loanAmount: 200000,
      loanTerm: 60,
      loanPurpose: "other",
      purposeOther: "Investment property",
      firstName: "Bob",
      lastName: "Smith",
      dateOfBirth: new Date("1985-11-22"),
      street: "456 Elm Avenue",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      employmentStatus: "self_employed",
      employerName: "Smith Consulting LLC",
      jobTitle: "Owner",
      annualIncome: 120000,
      yearsAtJob: 7,
      totalAssets: 180000,
      totalDebts: 35000,
      monthlyExpenses: 5500,
      referenceId: "APP-2026-0004",
      submittedAt: new Date("2026-02-15T11:00:00Z"),
    },
  ];

  for (const app of apps) {
    await prisma.loanApplication.upsert({
      where: { referenceId: app.referenceId },
      update: {},
      create: app,
    });
  }

  console.log(`Created ${apps.length} loan applications`);
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
