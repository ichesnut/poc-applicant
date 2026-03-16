"use server";

import { prisma } from "@/lib/db";
import { sendRegistrationInvite } from "@/lib/email";
import {
  loanDetailsSchema,
  personalInfoSchema,
  employmentSchema,
  financialSchema,
  reviewSchema,
  type LoanFormData,
} from "@/lib/apply-schemas";

export type SubmitResult =
  | { success: true; referenceId: string; isNewUser?: boolean; email?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitApplication(
  formData: LoanFormData
): Promise<SubmitResult> {
  // Validate each step's schema
  const stepResults = [
    loanDetailsSchema.safeParse(formData),
    personalInfoSchema.safeParse(formData),
    employmentSchema.safeParse(formData),
    financialSchema.safeParse(formData),
    reviewSchema.safeParse(formData),
  ];

  const errors: Record<string, string[]> = {};
  for (const result of stepResults) {
    if (!result.success) {
      for (const [key, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        if (msgs) errors[key] = msgs;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors in your application.",
      fieldErrors: errors,
    };
  }

  try {
    // Generate reference ID: LN-YYYY-NNNN
    const year = new Date().getFullYear();
    const count = await prisma.loanApplication.count({
      where: {
        referenceId: { startsWith: `LN-${year}-` },
      },
    });
    const referenceId = `LN-${year}-${String(count + 1).padStart(4, "0")}`;

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    });

    const application = await prisma.loanApplication.create({
      data: {
        referenceId,
        status: "SUBMITTED",
        userId: existingUser?.id ?? null,
        loanAmount: Number(formData.loanAmount),
        loanTerm: Number(formData.loanTerm),
        loanPurpose: formData.loanPurpose,
        purposeOther: formData.purposeOther || null,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth),
        email: formData.email,
        phone: formData.phone,
        street: formData.street,
        apartment: formData.apartment || null,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        employmentStatus: formData.employmentStatus,
        employerName: formData.employerName || null,
        jobTitle: formData.jobTitle || null,
        annualIncome: Number(formData.annualIncome),
        yearsAtJob: formData.yearsAtJob ? Number(formData.yearsAtJob) : null,
        totalAssets: Number(formData.totalAssets),
        totalDebts: Number(formData.totalDebts),
        monthlyExpenses: Number(formData.monthlyExpenses),
        certifiedAt: new Date(),
        submittedAt: new Date(),
      },
    });

    // Link any uploaded documents to the loan application
    if (formData.applicationToken) {
      await prisma.document.updateMany({
        where: { applicationToken: formData.applicationToken },
        data: { loanApplicationId: application.id },
      });
    }

    // If no existing user, send registration invite email
    if (!existingUser) {
      await sendRegistrationInvite({
        email: formData.email,
        firstName: formData.firstName,
        referenceId,
      });
    }

    // Sync to loan officer app (best-effort, don't fail the applicant submission)
    try {
      await syncToLoanOfficer(formData, referenceId);
    } catch (syncError) {
      console.error("Failed to sync application to loan officer app:", syncError);
    }

    return {
      success: true,
      referenceId,
      isNewUser: !existingUser,
      email: !existingUser ? formData.email : undefined,
    };
  } catch (error) {
    console.error("Failed to submit application:", error);
    return { success: false, error: "Failed to submit application. Please try again." };
  }
}

async function syncToLoanOfficer(
  formData: LoanFormData,
  referenceId: string
): Promise<void> {
  const syncUrl = process.env.LOAN_OFFICER_SYNC_URL;
  const syncKey = process.env.SYNC_API_KEY;

  if (!syncUrl || !syncKey) {
    console.warn("Loan officer sync not configured (LOAN_OFFICER_SYNC_URL or SYNC_API_KEY missing)");
    return;
  }

  const response = await fetch(syncUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-api-key": syncKey,
    },
    body: JSON.stringify({
      referenceId,
      loanAmount: Number(formData.loanAmount),
      loanTerm: Number(formData.loanTerm),
      loanPurpose: formData.loanPurpose,
      purposeOther: formData.purposeOther || null,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      street: formData.street,
      apartment: formData.apartment || null,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      employmentStatus: formData.employmentStatus,
      employerName: formData.employerName || null,
      jobTitle: formData.jobTitle || null,
      annualIncome: Number(formData.annualIncome),
      yearsAtJob: formData.yearsAtJob ? Number(formData.yearsAtJob) : null,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sync failed (${response.status}): ${body}`);
  }
}
