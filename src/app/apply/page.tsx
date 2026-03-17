"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Upload, Loader2, FileText, X, Wand2 } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  type LoanFormData,
  type UploadedDocument,
  initialFormData,
  STEP_LABELS,
  LOAN_TERMS,
  LOAN_PURPOSES,
  EMPLOYMENT_STATUSES,
  US_STATES,
  stepSchemas,
} from "@/lib/apply-schemas";
import { submitApplication } from "@/lib/apply-actions";
import { cn } from "@/lib/utils";

type FieldErrors = Record<string, string[]>;

export default function ApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<LoanFormData>(initialFormData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<K extends keyof LoanFormData>(
    key: K,
    value: LoanFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field when user types
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validateCurrentStep(): boolean {
    const schema = stepSchemas[currentStep];
    const result = schema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0]?.toString() ?? "_root";
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    setErrors(fieldErrors);
    return false;
  }

  function handleContinue() {
    if (validateCurrentStep()) {
      setCurrentStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    }
  }

  function handlePrevious() {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function goToStep(step: number) {
    setErrors({});
    setCurrentStep(step);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitApplication(formData);
    setSubmitting(false);
    if (result.success) {
      const params = new URLSearchParams({ ref: result.referenceId });
      if (result.isNewUser && result.email) {
        params.set("email", result.email);
        if (result.firstName) params.set("firstName", result.firstName);
        if (result.lastName) params.set("lastName", result.lastName);
      }
      router.push(`/apply/success?${params.toString()}`);
    } else {
      setSubmitError(result.error);
    }
  }

  function fieldError(name: string) {
    return errors[name] ? (
      <p className="text-sm text-destructive mt-1">{errors[name][0]}</p>
    ) : null;
  }

  function getDemoDataForStep(step: number): Partial<LoanFormData> {
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;

    const firstNames = ["Jane", "John", "Maria", "James", "Sarah", "Michael", "Emily", "David", "Olivia", "Robert", "Sophia", "Carlos", "Aisha", "Wei", "Priya"];
    const lastNames = ["Smith", "Johnson", "Garcia", "Williams", "Brown", "Jones", "Martinez", "Davis", "Rodriguez", "Wilson", "Anderson", "Thomas", "Lee", "Patel", "Kim"];
    const streets = ["123 Main Street", "456 Oak Avenue", "789 Elm Drive", "321 Cedar Lane", "555 Maple Court", "901 Pine Road", "247 Birch Boulevard", "612 Walnut Way"];
    const cities: [string, string, string][] = [
      ["Austin", "TX", "78701"], ["Denver", "CO", "80202"], ["Portland", "OR", "97201"],
      ["Nashville", "TN", "37201"], ["Raleigh", "NC", "27601"], ["Seattle", "WA", "98101"],
      ["Chicago", "IL", "60601"], ["Phoenix", "AZ", "85001"], ["Miami", "FL", "33101"],
    ];
    const employers = ["Acme Corp", "Globex Industries", "Initech", "Umbrella Co", "Wayne Enterprises", "Stark Industries", "Hooli", "Piedmont Health"];
    const jobTitles = ["Software Engineer", "Product Manager", "Marketing Director", "Data Analyst", "Project Manager", "UX Designer", "Financial Analyst", "Operations Lead"];

    switch (step) {
      case 0: {
        const amounts = [5000, 10000, 15000, 25000, 50000, 75000, 100000, 150000];
        return {
          loanAmount: pick(amounts),
          loanTerm: pick(LOAN_TERMS),
          loanPurpose: pick(LOAN_PURPOSES.filter(p => p !== "Other")),
          purposeOther: "",
        };
      }
      case 1: {
        const [city, state, zip] = pick(cities);
        const dobYear = randInt(1960, 2000);
        const dobMonth = pad(randInt(1, 12));
        const dobDay = pad(randInt(1, 28));
        return {
          firstName: pick(firstNames),
          lastName: pick(lastNames),
          dateOfBirth: `${dobYear}-${dobMonth}-${dobDay}`,
          email: `ichesnut+${timestamp}@gmail.com`,
          phone: `(555) ${randInt(200, 999)}-${pad(randInt(0, 99))}${pad(randInt(0, 99))}`,
          street: pick(streets),
          apartment: Math.random() > 0.7 ? `Apt ${randInt(1, 20)}` : "",
          city,
          state,
          zipCode: zip,
        };
      }
      case 2: {
        const status = pick(["Employed", "Self-employed"] as const);
        return {
          employmentStatus: status,
          employerName: pick(employers),
          jobTitle: pick(jobTitles),
          annualIncome: randInt(4, 20) * 10000,
          yearsAtJob: randInt(1, 15),
        };
      }
      case 3:
        return {
          totalAssets: randInt(2, 50) * 10000,
          totalDebts: randInt(0, 10) * 5000,
          monthlyExpenses: randInt(15, 80) * 100,
        };
      case 4:
        return {};
      case 5:
        return { certified: true };
      default:
        return {};
    }
  }

  function handleFill() {
    const demoData = getDemoDataForStep(currentStep);
    setFormData((prev) => ({ ...prev, ...demoData }));
    setErrors({});
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Apply for a Loan</h1>

      {/* Progress indicator */}
      <StepProgress currentStep={currentStep} />

      {/* Step content */}
      <Card>
        {currentStep === 0 && (
          <StepLoanDetails
            data={formData}
            update={updateField}
            fieldError={fieldError}
          />
        )}
        {currentStep === 1 && (
          <StepPersonalInfo
            data={formData}
            update={updateField}
            fieldError={fieldError}
          />
        )}
        {currentStep === 2 && (
          <StepEmployment
            data={formData}
            update={updateField}
            fieldError={fieldError}
          />
        )}
        {currentStep === 3 && (
          <StepFinancial
            data={formData}
            update={updateField}
            fieldError={fieldError}
          />
        )}
        {currentStep === 4 && (
          <StepDocuments
            applicationToken={formData.applicationToken}
            documents={formData.uploadedDocuments}
            setDocuments={(docs) =>
              setFormData((prev) => ({ ...prev, uploadedDocuments: docs }))
            }
          />
        )}
        {currentStep === 5 && (
          <StepReview
            data={formData}
            update={updateField}
            fieldError={fieldError}
            goToStep={goToStep}
          />
        )}

        {/* Navigation buttons */}
        <CardContent className="pt-0">
          {submitError && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
              {submitError}
            </p>
          )}
          <Separator className="mb-6" />
          <div className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="size-4 mr-1" />
                  Previous
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={handleFill}>
                <Wand2 className="size-4 mr-1" />
                Fill
              </Button>
            </div>

            {currentStep < STEP_LABELS.length - 1 ? (
              <Button onClick={handleContinue}>
                Continue
                <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger
                  disabled={!formData.certified || submitting}
                  render={
                    <Button
                      size="lg"
                      disabled={!formData.certified || submitting}
                    />
                  }
                >
                  {submitting && (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  )}
                  Submit Application
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit your application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You won&apos;t be able to edit it after submission.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Progress Indicator ─────────────────────────────────────────────── */

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <>
      {/* Desktop stepper */}
      <ol
        className="hidden md:flex items-center gap-2"
        aria-label="Application progress"
      >
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {i < currentStep ? (
                <CheckCircle2 className="size-8 text-primary" />
              ) : i === currentStep ? (
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold ring-2 ring-primary ring-offset-2">
                  {i + 1}
                </div>
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-muted-foreground text-sm">
                  {i + 1}
                </div>
              )}
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  i <= currentStep
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 lg:w-12",
                  i < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        ))}
      </ol>

      {/* Mobile progress */}
      <div className="md:hidden space-y-2">
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {STEP_LABELS.length}
        </p>
        <p className="text-lg font-semibold">{STEP_LABELS[currentStep]}</p>
        <Progress
          value={((currentStep + 1) / STEP_LABELS.length) * 100}
        />
      </div>
    </>
  );
}

/* ── Step Components ────────────────────────────────────────────────── */

type StepProps = {
  data: LoanFormData;
  update: <K extends keyof LoanFormData>(key: K, value: LoanFormData[K]) => void;
  fieldError: (name: string) => React.ReactNode;
};

function StepLoanDetails({ data, update, fieldError }: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Loan Details</CardTitle>
        <CardDescription>Tell us about the loan you need.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="loanAmount">Loan amount ($)</Label>
          <Input
            id="loanAmount"
            type="number"
            placeholder="10,000"
            value={data.loanAmount}
            onChange={(e) =>
              update("loanAmount", e.target.value === "" ? "" : Number(e.target.value))
            }
          />
          <p className="text-sm text-muted-foreground">
            Min $1,000 &middot; Max $500,000
          </p>
          {fieldError("loanAmount")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="loanTerm">Loan term</Label>
          <Select
            value={data.loanTerm === "" ? "" : String(data.loanTerm)}
            onValueChange={(v) => update("loanTerm", Number(v))}
          >
            <SelectTrigger id="loanTerm">
              <SelectValue placeholder="Select term..." />
            </SelectTrigger>
            <SelectContent>
              {LOAN_TERMS.map((term) => (
                <SelectItem key={term} value={String(term)}>
                  {term} months
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("loanTerm")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="loanPurpose">Purpose of loan</Label>
          <Select
            value={data.loanPurpose}
            onValueChange={(v) => update("loanPurpose", v ?? "")}
          >
            <SelectTrigger id="loanPurpose">
              <SelectValue placeholder="Select purpose..." />
            </SelectTrigger>
            <SelectContent>
              {LOAN_PURPOSES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("loanPurpose")}
        </div>

        {data.loanPurpose === "Other" && (
          <div className="space-y-2">
            <Label htmlFor="purposeOther">Describe the purpose</Label>
            <Textarea
              id="purposeOther"
              placeholder="Describe the purpose..."
              value={data.purposeOther}
              onChange={(e) => update("purposeOther", e.target.value)}
              maxLength={500}
            />
            {fieldError("purposeOther")}
          </div>
        )}
      </CardContent>
    </>
  );
}

function StepPersonalInfo({ data, update, fieldError }: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          We need some basic details about you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
            {fieldError("firstName")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
            {fieldError("lastName")}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            You must be at least 18 years old
          </p>
          {fieldError("dateOfBirth")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {fieldError("email")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          {fieldError("phone")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">Street address</Label>
          <Input
            id="street"
            value={data.street}
            onChange={(e) => update("street", e.target.value)}
          />
          {fieldError("street")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apartment">Apartment / Suite (optional)</Label>
          <Input
            id="apartment"
            value={data.apartment}
            onChange={(e) => update("apartment", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => update("city", e.target.value)}
            />
            {fieldError("city")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={data.state}
              onValueChange={(v) => update("state", v ?? "")}
            >
              <SelectTrigger id="state" className="w-24">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("state")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP code</Label>
            <Input
              id="zipCode"
              placeholder="12345"
              className="w-28"
              value={data.zipCode}
              onChange={(e) => update("zipCode", e.target.value)}
              maxLength={5}
            />
            {fieldError("zipCode")}
          </div>
        </div>
      </CardContent>
    </>
  );
}

function StepEmployment({ data, update, fieldError }: StepProps) {
  const showEmployerFields =
    data.employmentStatus === "Employed" ||
    data.employmentStatus === "Self-employed";

  return (
    <>
      <CardHeader>
        <CardTitle>Employment &amp; Income</CardTitle>
        <CardDescription>
          Tell us about your current employment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employmentStatus">Employment status</Label>
          <Select
            value={data.employmentStatus}
            onValueChange={(v) => update("employmentStatus", v ?? "")}
          >
            <SelectTrigger id="employmentStatus">
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("employmentStatus")}
        </div>

        {showEmployerFields && (
          <>
            <div className="space-y-2">
              <Label htmlFor="employerName">Employer name</Label>
              <Input
                id="employerName"
                value={data.employerName}
                onChange={(e) => update("employerName", e.target.value)}
              />
              {fieldError("employerName")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input
                id="jobTitle"
                value={data.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
              />
              {fieldError("jobTitle")}
            </div>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="annualIncome">Annual income ($)</Label>
            <Input
              id="annualIncome"
              type="number"
              placeholder="0"
              value={data.annualIncome}
              onChange={(e) =>
                update(
                  "annualIncome",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />
            {fieldError("annualIncome")}
          </div>

          {data.employmentStatus === "Employed" && (
            <div className="space-y-2">
              <Label htmlFor="yearsAtJob">Years at job</Label>
              <Input
                id="yearsAtJob"
                type="number"
                placeholder="0"
                min={0}
                value={data.yearsAtJob}
                onChange={(e) =>
                  update(
                    "yearsAtJob",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              {fieldError("yearsAtJob")}
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
}

function StepFinancial({ data, update, fieldError }: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Financial Profile</CardTitle>
        <CardDescription>
          Help us understand your financial situation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totalAssets">Total assets ($)</Label>
          <Input
            id="totalAssets"
            type="number"
            placeholder="0"
            value={data.totalAssets}
            onChange={(e) =>
              update(
                "totalAssets",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
          <p className="text-sm text-muted-foreground">
            Savings, investments, property, etc.
          </p>
          {fieldError("totalAssets")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalDebts">Total outstanding debts ($)</Label>
          <Input
            id="totalDebts"
            type="number"
            placeholder="0"
            value={data.totalDebts}
            onChange={(e) =>
              update(
                "totalDebts",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
          <p className="text-sm text-muted-foreground">
            Credit cards, loans, mortgages, etc.
          </p>
          {fieldError("totalDebts")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyExpenses">Monthly expenses ($)</Label>
          <Input
            id="monthlyExpenses"
            type="number"
            placeholder="0"
            value={data.monthlyExpenses}
            onChange={(e) =>
              update(
                "monthlyExpenses",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
          <p className="text-sm text-muted-foreground">
            Rent, bills, subscriptions, etc.
          </p>
          {fieldError("monthlyExpenses")}
        </div>
      </CardContent>
    </>
  );
}

function StepDocuments({
  applicationToken,
  documents,
  setDocuments,
}: {
  applicationToken: string;
  documents: UploadedDocument[];
  setDocuments: (docs: UploadedDocument[]) => void;
}) {
  const docs = documents ?? [];
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploadError(null);

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("File type not allowed. Please upload PDF, JPG, or PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("applicationToken", applicationToken);

      const res = await fetch("/api/documents", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
        return;
      }

      setDocuments([...docs, data as UploadedDocument]);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function removeDocument(id: string) {
    try {
      await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, applicationToken }),
      });
      setDocuments(docs.filter((d) => d.id !== id));
    } catch {
      // Silently fail — user can retry
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      uploadFile(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      uploadFile(file);
    }
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          Upload supporting documents for your application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop zone */}
        <div
          className={cn(
            "rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mx-auto size-10 text-muted-foreground mb-3 animate-spin" />
          ) : (
            <Upload className="mx-auto size-10 text-muted-foreground mb-3" />
          )}
          <p className="text-sm">
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                Drag &amp; drop files here, or{" "}
                <span className="text-primary underline">browse files</span>
              </>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PDF, JPG, PNG up to 10MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {uploadError && (
          <p className="text-sm text-destructive">{uploadError}</p>
        )}

        {/* Uploaded files list */}
        {docs.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Uploaded ({docs.length})
            </p>
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{doc.fileName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatSize(doc.fileSize)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 size-8 p-0"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Recommended documents:</p>
          <ul className="list-disc list-inside">
            <li>Pay stubs (last 2 months)</li>
            <li>Government-issued ID</li>
            <li>Bank statements (last 3 months)</li>
          </ul>
        </div>
      </CardContent>
    </>
  );
}

function StepReview({
  data,
  update,
  fieldError,
  goToStep,
}: StepProps & { goToStep: (step: number) => void }) {
  const fmt = (n: number | "") =>
    n === "" ? "$0" : `$${Number(n).toLocaleString()}`;

  return (
    <>
      <CardHeader>
        <CardTitle>Review Your Application</CardTitle>
        <CardDescription>
          Please review your information before submitting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loan Details */}
        <ReviewSection title="Loan Details" onEdit={() => goToStep(0)}>
          <ReviewRow label="Amount" value={fmt(data.loanAmount)} />
          <ReviewRow
            label="Term"
            value={data.loanTerm ? `${data.loanTerm} months` : "—"}
          />
          <ReviewRow label="Purpose" value={data.loanPurpose || "—"} />
          {data.loanPurpose === "Other" && data.purposeOther && (
            <ReviewRow label="Details" value={data.purposeOther} />
          )}
        </ReviewSection>

        {/* Personal Information */}
        <ReviewSection title="Personal Information" onEdit={() => goToStep(1)}>
          <ReviewRow
            label="Name"
            value={`${data.firstName} ${data.lastName}`}
          />
          <ReviewRow
            label="DOB"
            value={
              data.dateOfBirth
                ? new Date(data.dateOfBirth + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )
                : "—"
            }
          />
          <ReviewRow label="Email" value={data.email || "—"} copiable />
          <ReviewRow label="Phone" value={data.phone || "—"} />
          <ReviewRow
            label="Address"
            value={
              [
                data.street,
                data.apartment,
                `${data.city}, ${data.state} ${data.zipCode}`,
              ]
                .filter(Boolean)
                .join(", ") || "—"
            }
          />
        </ReviewSection>

        {/* Employment & Income */}
        <ReviewSection
          title="Employment & Income"
          onEdit={() => goToStep(2)}
        >
          <ReviewRow label="Status" value={data.employmentStatus || "—"} />
          {(data.employmentStatus === "Employed" ||
            data.employmentStatus === "Self-employed") && (
            <>
              <ReviewRow label="Employer" value={data.employerName || "—"} />
              <ReviewRow label="Title" value={data.jobTitle || "—"} />
            </>
          )}
          <ReviewRow label="Income" value={`${fmt(data.annualIncome)}/yr`} />
          {data.employmentStatus === "Employed" && (
            <ReviewRow
              label="Tenure"
              value={
                data.yearsAtJob !== ""
                  ? `${data.yearsAtJob} year${Number(data.yearsAtJob) === 1 ? "" : "s"}`
                  : "—"
              }
            />
          )}
        </ReviewSection>

        {/* Financial Profile */}
        <ReviewSection title="Financial Profile" onEdit={() => goToStep(3)}>
          <ReviewRow label="Assets" value={fmt(data.totalAssets)} />
          <ReviewRow label="Debts" value={fmt(data.totalDebts)} />
          <ReviewRow
            label="Expenses"
            value={`${fmt(data.monthlyExpenses)}/mo`}
          />
        </ReviewSection>

        {/* Documents */}
        <ReviewSection title="Documents" onEdit={() => goToStep(4)}>
          {(data.uploadedDocuments ?? []).length > 0 ? (
            <>
              {(data.uploadedDocuments ?? []).map((doc) => (
                <React.Fragment key={doc.id}>
                  <dt className="text-sm text-muted-foreground">
                    <FileText className="inline size-3.5 mr-1" />
                    File
                  </dt>
                  <dd className="text-sm font-medium">{doc.fileName}</dd>
                </React.Fragment>
              ))}
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic col-span-2">
              No documents uploaded
            </p>
          )}
        </ReviewSection>

        {/* Certification */}
        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            id="certified"
            checked={data.certified}
            onCheckedChange={(checked) =>
              update("certified", checked === true)
            }
          />
          <Label htmlFor="certified" className="text-sm leading-relaxed">
            I certify that the information provided is accurate and complete to
            the best of my knowledge.
          </Label>
        </div>
        {fieldError("certified")}
      </CardContent>
    </>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          {children}
        </dl>
      </CardContent>
    </Card>
  );
}

function ReviewRow({ label, value, copiable }: { label: string; value: string; copiable?: boolean }) {
  return (
    <>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium inline-flex items-center gap-1">
        {value}
        {copiable && value && value !== "—" && <CopyButton value={value} />}
      </dd>
    </>
  );
}
