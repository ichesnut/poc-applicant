import { z } from "zod";

export const LOAN_TERMS = [12, 24, 36, 48, 60] as const;

export const LOAN_PURPOSES = [
  "Home improvement",
  "Debt consolidation",
  "Business",
  "Education",
  "Vehicle",
  "Medical",
  "Other",
] as const;

export const EMPLOYMENT_STATUSES = [
  "Employed",
  "Self-employed",
  "Retired",
  "Unemployed",
  "Student",
] as const;

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  "DC",
] as const;

// Step 1: Loan Details
export const loanDetailsSchema = z
  .object({
    loanAmount: z.coerce
      .number({ message: "Loan amount is required" })
      .min(1000, "Minimum loan amount is $1,000")
      .max(500000, "Maximum loan amount is $500,000"),
    loanTerm: z.coerce
      .number({ message: "Please select a loan term" })
      .refine((v) => LOAN_TERMS.includes(v as (typeof LOAN_TERMS)[number]), {
        message: "Please select a valid loan term",
      }),
    loanPurpose: z.string().min(1, "Please select a loan purpose"),
    purposeOther: z.string().optional(),
  })
  .refine(
    (data) =>
      data.loanPurpose !== "Other" ||
      (data.purposeOther && data.purposeOther.trim().length > 0),
    {
      message: "Please describe the purpose of your loan",
      path: ["purposeOther"],
    }
  )
  .refine(
    (data) =>
      data.loanPurpose !== "Other" ||
      !data.purposeOther ||
      data.purposeOther.length <= 500,
    {
      message: "Description must be 500 characters or less",
      path: ["purposeOther"],
    }
  );

// Step 2: Personal Information
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => {
        const dob = new Date(val);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const adjustedAge =
          monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
            ? age - 1
            : age;
        return adjustedAge >= 18;
      },
      { message: "You must be at least 18 years old" }
    ),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
      "Please enter a valid US phone number"
    ),
  street: z.string().min(1, "Street address is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z
    .string()
    .min(1, "ZIP code is required")
    .regex(/^[0-9]{5}$/, "Please enter a valid 5-digit ZIP code"),
});

// Step 3: Employment & Income
export const employmentSchema = z
  .object({
    employmentStatus: z.string().min(1, "Please select your employment status"),
    employerName: z.string().optional(),
    jobTitle: z.string().optional(),
    annualIncome: z.coerce
      .number({ message: "Annual income is required" })
      .positive("Annual income must be greater than 0"),
    yearsAtJob: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (
        data.employmentStatus === "Employed" ||
        data.employmentStatus === "Self-employed"
      ) {
        return !!data.employerName && data.employerName.trim().length > 0;
      }
      return true;
    },
    { message: "Employer name is required", path: ["employerName"] }
  )
  .refine(
    (data) => {
      if (
        data.employmentStatus === "Employed" ||
        data.employmentStatus === "Self-employed"
      ) {
        return !!data.jobTitle && data.jobTitle.trim().length > 0;
      }
      return true;
    },
    { message: "Job title is required", path: ["jobTitle"] }
  )
  .refine(
    (data) => {
      if (data.employmentStatus === "Employed") {
        return data.yearsAtJob !== undefined && data.yearsAtJob >= 0;
      }
      return true;
    },
    { message: "Years at job is required", path: ["yearsAtJob"] }
  );

// Step 4: Financial Profile
export const financialSchema = z.object({
  totalAssets: z.coerce
    .number({ message: "Total assets is required" })
    .min(0, "Total assets cannot be negative"),
  totalDebts: z.coerce
    .number({ message: "Total debts is required" })
    .min(0, "Total debts cannot be negative"),
  monthlyExpenses: z.coerce
    .number({ message: "Monthly expenses is required" })
    .min(0, "Monthly expenses cannot be negative"),
});

// Step 5: Documents (placeholder - no validation needed)
export const documentsSchema = z.object({});

// Step 6: Review (certification)
export const reviewSchema = z.object({
  certified: z.literal(true, {
    message: "You must certify that your information is accurate",
  }),
});

// Combined form data type
export type LoanFormData = {
  // Step 1
  loanAmount: number | "";
  loanTerm: number | "";
  loanPurpose: string;
  purposeOther: string;
  // Step 2
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  // Step 3
  employmentStatus: string;
  employerName: string;
  jobTitle: string;
  annualIncome: number | "";
  yearsAtJob: number | "";
  // Step 4
  totalAssets: number | "";
  totalDebts: number | "";
  monthlyExpenses: number | "";
  // Step 6
  certified: boolean;
};

export const initialFormData: LoanFormData = {
  loanAmount: "",
  loanTerm: "",
  loanPurpose: "",
  purposeOther: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  street: "",
  apartment: "",
  city: "",
  state: "",
  zipCode: "",
  employmentStatus: "",
  employerName: "",
  jobTitle: "",
  annualIncome: "",
  yearsAtJob: "",
  totalAssets: "",
  totalDebts: "",
  monthlyExpenses: "",
  certified: false,
};

export const STEP_LABELS = [
  "Loan Details",
  "Personal Info",
  "Employment",
  "Financial",
  "Documents",
  "Review",
] as const;

export const stepSchemas = [
  loanDetailsSchema,
  personalInfoSchema,
  employmentSchema,
  financialSchema,
  documentsSchema,
  reviewSchema,
] as const;
