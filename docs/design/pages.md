# Applicant - Page Design Specifications

Tech stack: Next.js 15 (App Router) + Tailwind CSS 4 + shadcn/ui (base-nova style, neutral palette) + Lucide icons.
All designs are mobile-first, WCAG 2.1 AA compliant.
Max content width: `max-w-7xl` (1280px). Base radius: `0.625rem`.

---

## 1. Base Layout & Navigation Shell

**File:** `src/app/layout.tsx` (existing), `src/components/nav.tsx` (existing, needs update)

### Structure

```
<html>
  <body>
    <Nav />            ← sticky top bar
    <main>             ← page content, min-h-screen
      {children}
    </main>
    <Footer />         ← minimal footer
    <Toaster />        ← toast notifications (shadcn)
  </body>
</html>
```

### Nav Component (update existing)

```
┌──────────────────────────────────────────────────────────┐
│  [Logo: "Applicant"]    Dashboard  Apply     [UserMenu]  │
│                                                          │
│  (mobile: hamburger ☰ replaces nav links + user menu)    │
└──────────────────────────────────────────────────────────┘
```

**Desktop (≥768px):**
- `<header>` — sticky top-0, z-50, `bg-background/95 backdrop-blur`, `border-b border-border`
- Left: Logo link (`/`) — `text-xl font-semibold tracking-tight`
- Center/right: nav links — `text-sm text-muted-foreground hover:text-foreground`
  - "Dashboard" → `/dashboard`
  - "Apply" → `/apply`
- Far right: User menu (avatar dropdown)
  - When logged out: "Login" button (outline variant) + "Register" button (default variant)
  - When logged in: Avatar circle (initials fallback) → dropdown with: Profile, Settings, Sign out

**Mobile (<768px):**
- Same sticky header, but nav links collapse behind a hamburger `<Menu />` icon button
- Opens a slide-down sheet or full-width dropdown with stacked nav links + user actions
- Use shadcn `Sheet` component (side="top" or side="right")

**shadcn components needed:** `Sheet`, `DropdownMenu`, `Avatar`, `Separator`

**Accessibility:**
- `<nav aria-label="Main navigation">`
- Mobile menu: `aria-expanded`, focus trap when open
- Skip-to-content link as first focusable element in `<body>`

### Footer

```
┌──────────────────────────────────────────────────────────┐
│  © 2026 Applicant. All rights reserved.                  │
│  Privacy Policy · Terms of Service                       │
└──────────────────────────────────────────────────────────┘
```

- `border-t border-border`, `py-8`, `text-sm text-muted-foreground`
- Centered text, max-w-7xl container
- Links are `hover:text-foreground`

---

## 2. Registration Page

**Route:** `/register`
**File:** `src/app/(auth)/register/page.tsx`

### Layout

Centered card on a minimal background. No nav bar (auth pages use a separate layout without the main nav).

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              [Logo: "Applicant"]                         │
│                                                          │
│         ┌─────────────────────────────┐                  │
│         │   Create your account       │                  │
│         │                             │                  │
│         │   Full name                 │                  │
│         │   ┌───────────────────────┐ │                  │
│         │   │                       │ │                  │
│         │   └───────────────────────┘ │                  │
│         │                             │                  │
│         │   Email address             │                  │
│         │   ┌───────────────────────┐ │                  │
│         │   │                       │ │                  │
│         │   └───────────────────────┘ │                  │
│         │                             │                  │
│         │   Password                  │                  │
│         │   ┌───────────────────────┐ │                  │
│         │   │             [Eye 👁]  │ │                  │
│         │   └───────────────────────┘ │                  │
│         │   Min 8 chars, 1 number     │                  │
│         │                             │                  │
│         │   Confirm password          │                  │
│         │   ┌───────────────────────┐ │                  │
│         │   │             [Eye 👁]  │ │                  │
│         │   └───────────────────────┘ │                  │
│         │                             │                  │
│         │   [  Create account     ]   │                  │
│         │                             │                  │
│         │   Already have an account?  │                  │
│         │   Sign in →                 │                  │
│         └─────────────────────────────┘                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Component Structure

```tsx
<div className="flex min-h-screen items-center justify-center px-4">
  <div className="w-full max-w-sm space-y-6">
    <Logo />                          {/* centered, links to / */}
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <FormField label="Full name" />
          <FormField label="Email address" type="email" />
          <FormField label="Password" type="password" toggle />
          <FormField label="Confirm password" type="password" toggle />
          <Button type="submit" className="w-full">Create account</Button>
        </form>
      </CardContent>
      <CardFooter>
        <p>Already have an account? <Link href="/login">Sign in</Link></p>
      </CardFooter>
    </Card>
  </div>
</div>
```

### Interaction Notes

- Client-side validation with Zod: name required, valid email, password ≥ 8 chars with 1 number, confirm must match
- Inline error messages below each field in `text-destructive text-sm`
- Submit button shows `<Loader2 className="animate-spin" />` spinner while loading, is disabled
- On success: redirect to `/login` with toast "Account created. Please sign in."
- On error (e.g., email exists): show error in a destructive `Alert` above the form

### Responsive

- Card is `max-w-sm` (384px) on all breakpoints
- On mobile: card fills width with `px-4` margin
- No horizontal scroll

**shadcn components needed:** `Card`, `Input`, `Label`, `Button`, `Alert`

---

## 3. Login Page

**Route:** `/login`
**File:** `src/app/(auth)/login/page.tsx`

### Layout

Same centered card pattern as registration.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              [Logo: "Applicant"]                         │
│                                                          │
│         ┌─────────────────────────────┐                  │
│         │   Welcome back              │                  │
│         │   Sign in to your account   │                  │
│         │                             │                  │
│         │   Email address             │                  │
│         │   ┌───────────────────────┐ │                  │
│         │   │                       │ │                  │
│         │   └───────────────────────┘ │                  │
│         │                             │                  │
│         │   Password                  │                  │
│         │   ┌───────────────────────┐ │                  │
│         │   │             [Eye 👁]  │ │                  │
│         │   └───────────────────────┘ │                  │
│         │   [Forgot password?]        │                  │
│         │                             │                  │
│         │   [      Sign in        ]   │                  │
│         │                             │                  │
│         │   Don't have an account?    │                  │
│         │   Create one →              │                  │
│         └─────────────────────────────┘                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Component Structure

```tsx
<div className="flex min-h-screen items-center justify-center px-4">
  <div className="w-full max-w-sm space-y-6">
    <Logo />
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <FormField label="Email address" type="email" />
          <div>
            <FormField label="Password" type="password" toggle />
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary mt-1 block text-right">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </CardContent>
      <CardFooter>
        <p>Don't have an account? <Link href="/register">Create one</Link></p>
      </CardFooter>
    </Card>
  </div>
</div>
```

### Interaction Notes

- Validation: email required + valid format, password required
- Loading state on button during submission
- On success: redirect to `/dashboard`
- On error: destructive `Alert` — "Invalid email or password"
- "Forgot password?" link can be a placeholder for v1 (goes to a "coming soon" page or is omitted)

**shadcn components needed:** `Card`, `Input`, `Label`, `Button`, `Alert`

---

## 4. Multi-Step Loan Application Form

**Route:** `/apply` (or `/apply/[step]` if using route-per-step)
**File:** `src/app/(app)/apply/page.tsx` + step components

### Overall Layout

```
┌──────────────────────────────────────────────────────────┐
│  [Nav bar]                                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Apply for a Loan                                        │
│                                                          │
│  ┌─ Progress Bar ─────────────────────────────────────┐  │
│  │ ● Loan ── ● Personal ── ○ Employment ── ○ ...     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Step Content Card ────────────────────────────────┐  │
│  │                                                    │  │
│  │  [Step-specific form fields]                       │  │
│  │                                                    │  │
│  │  ┌──────────────┐          ┌──────────────────┐    │  │
│  │  │  ← Previous  │          │  Continue →       │    │  │
│  │  └──────────────┘          └──────────────────┘    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Progress Indicator

A horizontal stepper showing all 6 steps. Each step shows:
- **Completed:** Filled circle with checkmark (`<CheckCircle2 />`), `text-primary`
- **Current:** Filled circle with step number, `bg-primary text-primary-foreground`, ring highlight
- **Upcoming:** Hollow circle with step number, `text-muted-foreground`
- Steps connected by horizontal lines: completed = `bg-primary`, upcoming = `bg-border`

**Mobile:** Steps collapse to show "Step 2 of 6 — Personal Info" with a thin progress bar underneath.

```tsx
// Desktop
<ol className="flex items-center gap-2" aria-label="Application progress">
  {steps.map((step, i) => (
    <li key={i} className="flex items-center gap-2">
      <StepCircle status={getStatus(i)} number={i+1} label={step.label} />
      {i < steps.length - 1 && <StepConnector completed={i < currentStep} />}
    </li>
  ))}
</ol>

// Mobile
<div className="flex flex-col gap-2">
  <p className="text-sm text-muted-foreground">Step {current} of {total}</p>
  <p className="text-lg font-semibold">{steps[current].label}</p>
  <Progress value={(current / total) * 100} />
</div>
```

**shadcn components needed:** `Progress`

### Step 1: Loan Details

```
┌────────────────────────────────────────────────────┐
│  Loan Details                                      │
│  Tell us about the loan you need.                  │
│                                                    │
│  Loan amount ($)                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  $                                    10,000 │  │
│  └──────────────────────────────────────────────┘  │
│  Min $1,000 · Max $500,000                         │
│                                                    │
│  Loan term                                         │
│  ┌──────────────────────────────────────────────┐  │
│  │  Select term...                           ▼  │  │
│  └──────────────────────────────────────────────┘  │
│  Options: 12 / 24 / 36 / 48 / 60 months           │
│                                                    │
│  Purpose of loan                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  Select purpose...                        ▼  │  │
│  └──────────────────────────────────────────────┘  │
│  Options: Home improvement, Debt consolidation,    │
│  Business, Education, Vehicle, Medical, Other      │
│                                                    │
│  If "Other":                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │  Describe the purpose...                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│                            [  Continue →  ]        │
└────────────────────────────────────────────────────┘
```

**Fields:**
| Field | Type | Validation |
|---|---|---|
| `loanAmount` | Number input with $ prefix | Required, 1000–500000 |
| `loanTerm` | Select | Required, enum: 12/24/36/48/60 |
| `loanPurpose` | Select | Required, enum list |
| `purposeOther` | Textarea | Required if purpose="other", max 500 chars |

**shadcn components needed:** `Input`, `Select`, `Textarea`, `Label`

### Step 2: Personal Information

```
┌────────────────────────────────────────────────────┐
│  Personal Information                              │
│  We need some basic details about you.             │
│                                                    │
│  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ First name      │  │ Last name               │  │
│  └─────────────────┘  └─────────────────────────┘  │
│                                                    │
│  Date of birth                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  MM / DD / YYYY                     [Cal 📅] │  │
│  └──────────────────────────────────────────────┘  │
│  You must be at least 18 years old                 │
│                                                    │
│  Phone number                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  (555) 123-4567                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Street address                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Apartment / Suite (optional)                      │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────┐ ┌────────┐ ┌──────────────────┐  │
│  │ City         │ │ State  │ │ ZIP code         │  │
│  └──────────────┘ └────────┘ └──────────────────┘  │
│                                                    │
│  [ ← Previous ]                [  Continue →  ]    │
└────────────────────────────────────────────────────┘
```

**Fields:**
| Field | Type | Validation |
|---|---|---|
| `firstName` | Text input | Required, 1–50 chars |
| `lastName` | Text input | Required, 1–50 chars |
| `dateOfBirth` | Date picker | Required, must be ≥ 18 years old |
| `phone` | Text input with mask | Required, valid US phone |
| `street` | Text input | Required |
| `apartment` | Text input | Optional |
| `city` | Text input | Required |
| `state` | Select (US states) | Required |
| `zipCode` | Text input | Required, 5-digit US ZIP |

**Layout:** First/last name side by side on ≥640px, stacked on mobile. City/state/zip in a 3-column grid on ≥640px (6-col / 2-col / 4-col), stacked on mobile.

**shadcn components needed:** `Input`, `Select`, `Label`, `Popover`, `Calendar`

### Step 3: Employment & Income

```
┌────────────────────────────────────────────────────┐
│  Employment & Income                               │
│  Tell us about your current employment.            │
│                                                    │
│  Employment status                                 │
│  ┌──────────────────────────────────────────────┐  │
│  │  Select status...                         ▼  │  │
│  └──────────────────────────────────────────────┘  │
│  Options: Employed, Self-employed, Retired,        │
│  Unemployed, Student                               │
│                                                    │
│  (If employed/self-employed:)                      │
│                                                    │
│  Employer name                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Job title                                         │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────┐ ┌─────────────────────┐  │
│  │ Annual income ($)    │ │ Years at job        │  │
│  └──────────────────────┘ └─────────────────────┘  │
│                                                    │
│  [ ← Previous ]                [  Continue →  ]    │
└────────────────────────────────────────────────────┘
```

**Fields:**
| Field | Type | Validation |
|---|---|---|
| `employmentStatus` | Select | Required |
| `employerName` | Text input | Required if employed/self-employed |
| `jobTitle` | Text input | Required if employed/self-employed |
| `annualIncome` | Number input with $ | Required, > 0 |
| `yearsAtJob` | Number input | Required if employed, ≥ 0 |

**Conditional rendering:** Employer name, job title, and years at job fields only show when status is "Employed" or "Self-employed". Annual income always shows.

**shadcn components needed:** `Input`, `Select`, `Label`

### Step 4: Financial Profile

```
┌────────────────────────────────────────────────────┐
│  Financial Profile                                 │
│  Help us understand your financial situation.      │
│                                                    │
│  Total assets ($)                                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  $ 0                                        │  │
│  └──────────────────────────────────────────────┘  │
│  Savings, investments, property, etc.              │
│                                                    │
│  Total outstanding debts ($)                       │
│  ┌──────────────────────────────────────────────┐  │
│  │  $ 0                                        │  │
│  └──────────────────────────────────────────────┘  │
│  Credit cards, loans, mortgages, etc.              │
│                                                    │
│  Monthly expenses ($)                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  $ 0                                        │  │
│  └──────────────────────────────────────────────┘  │
│  Rent, bills, subscriptions, etc.                  │
│                                                    │
│  [ ← Previous ]                [  Continue →  ]    │
└────────────────────────────────────────────────────┘
```

**Fields:**
| Field | Type | Validation |
|---|---|---|
| `totalAssets` | Number input with $ | Required, ≥ 0 |
| `totalDebts` | Number input with $ | Required, ≥ 0 |
| `monthlyExpenses` | Number input with $ | Required, ≥ 0 |

**shadcn components needed:** `Input`, `Label`

### Step 5: Document Upload

```
┌────────────────────────────────────────────────────┐
│  Documents                                         │
│  Upload supporting documents for your application. │
│                                                    │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│  │                                              │  │
│  │     [Upload icon]                            │  │
│  │                                              │  │
│  │     Drag & drop files here, or               │  │
│  │     [Browse files]                           │  │
│  │                                              │  │
│  │     PDF, JPG, PNG up to 10MB each            │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
│                                                    │
│  Recommended documents:                            │
│  • Pay stubs (last 2 months)                       │
│  • Government-issued ID                            │
│  • Bank statements (last 3 months)                 │
│                                                    │
│  Uploaded files:                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📄 paystub_jan.pdf    120 KB    [✕ Remove]   │  │
│  │ 📄 drivers_license.jpg 2.1 MB   [✕ Remove]   │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [ ← Previous ]                [  Continue →  ]    │
└────────────────────────────────────────────────────┘
```

**Component Structure:**

```tsx
<div className="space-y-6">
  {/* Drop zone */}
  <div
    className="border-2 border-dashed border-border rounded-lg p-8 text-center
               hover:border-primary/50 hover:bg-muted/50 transition cursor-pointer
               data-[dragging]:border-primary data-[dragging]:bg-primary/5"
    onDragOver={...} onDrop={...}
  >
    <Upload className="mx-auto size-10 text-muted-foreground mb-3" />
    <p>Drag & drop files here, or <button className="text-primary underline">browse files</button></p>
    <p className="text-sm text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB each</p>
    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only" />
  </div>

  {/* Recommended docs hint */}
  <div className="text-sm text-muted-foreground space-y-1">
    <p className="font-medium text-foreground">Recommended documents:</p>
    <ul className="list-disc list-inside">...</ul>
  </div>

  {/* File list */}
  <ul className="space-y-2">
    {files.map(file => <FileRow key={file.id} file={file} onRemove={...} />)}
  </ul>
</div>
```

**Interaction Notes:**
- Drag state: dashed border changes to `border-primary`, background tints to `bg-primary/5`
- Upload progress: show a small progress bar inside each `FileRow` while uploading
- File row: icon (based on mime type), filename (truncated), file size, remove button (ghost icon button with `<X />`)
- Max 10 files total. Show warning if user tries to exceed
- Validation: at least 1 file recommended but not required (soft warning, not blocking)

**shadcn components needed:** `Button` (already have)

### Step 6: Review & Submit

```
┌────────────────────────────────────────────────────┐
│  Review Your Application                           │
│  Please review your information before submitting. │
│                                                    │
│  ┌── Loan Details ──────────────── [Edit ✏️] ──┐   │
│  │  Amount:    $25,000                         │   │
│  │  Term:      36 months                       │   │
│  │  Purpose:   Home improvement                │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  ┌── Personal Information ──────── [Edit ✏️] ──┐   │
│  │  Name:      Jane Smith                      │   │
│  │  DOB:       Mar 15, 1990                    │   │
│  │  Phone:     (555) 123-4567                  │   │
│  │  Address:   123 Main St, Apt 4B             │   │
│  │             San Francisco, CA 94102         │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  ┌── Employment & Income ──────── [Edit ✏️] ──┐    │
│  │  Status:    Employed                        │   │
│  │  Employer:  Acme Corp                       │   │
│  │  Title:     Software Engineer               │   │
│  │  Income:    $120,000/yr                     │   │
│  │  Tenure:    3 years                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  ┌── Financial Profile ────────── [Edit ✏️] ──┐    │
│  │  Assets:    $50,000                         │   │
│  │  Debts:     $15,000                         │   │
│  │  Expenses:  $3,200/mo                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  ┌── Documents ────────────────── [Edit ✏️] ──┐    │
│  │  📄 paystub_jan.pdf                        │   │
│  │  📄 drivers_license.jpg                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  ☐ I certify that the information provided is      │
│    accurate and complete to the best of my         │
│    knowledge.                                      │
│                                                    │
│  [ ← Previous ]          [ Submit Application ]    │
└────────────────────────────────────────────────────┘
```

**Component Structure:**

Each section is a `Card` with:
- `CardHeader`: section title + ghost "Edit" button (navigates to that step)
- `CardContent`: key-value pairs in a `<dl>` with `grid grid-cols-[auto_1fr] gap-x-4 gap-y-2`
- `<dt>` = `text-sm text-muted-foreground`, `<dd>` = `text-sm font-medium`

**Interaction Notes:**
- "Edit" buttons navigate to the corresponding step, preserving all data
- Certification checkbox must be checked to enable "Submit Application" button
- Submit button: `variant="default" size="lg"` — disabled until checkbox is checked
- On submit: confirmation dialog (shadcn `AlertDialog`): "Submit your application? You won't be able to edit it after submission."
- After submit: redirect to `/dashboard` with toast "Application submitted successfully"

**shadcn components needed:** `Card`, `Checkbox`, `AlertDialog`

---

## 5. Dashboard Page

**Route:** `/dashboard`
**File:** `src/app/(app)/dashboard/page.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  [Nav bar]                                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  My Applications               [ + New Application ]    │
│                                                          │
│  ┌── Filter/Sort Bar ─────────────────────────────────┐  │
│  │  All (5)  Drafts (1)  Submitted (2)  Approved (1)  │  │
│  │                                        Sort: Date ▼│  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── Application Card ────────────────────────────────┐  │
│  │                                                    │  │
│  │  Home Improvement Loan          [Submitted]        │  │
│  │  $25,000 · 36 months                               │  │
│  │  Submitted Mar 12, 2026                             │  │
│  │                                              →     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── Application Card ────────────────────────────────┐  │
│  │                                                    │  │
│  │  Vehicle Purchase Loan          [Approved ✓]       │  │
│  │  $18,500 · 60 months                               │  │
│  │  Approved Mar 10, 2026                              │  │
│  │                                              →     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── Application Card ────────────────────────────────┐  │
│  │                                                    │  │
│  │  Business Expansion Loan        [Draft]            │  │
│  │  $50,000 · 48 months                               │  │
│  │  Last edited Mar 14, 2026                           │  │
│  │                              [Continue →]          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ── Empty state (when no applications) ──────────────    │
│                                                          │
│     [Clipboard icon]                                     │
│     No applications yet                                  │
│     Start your first loan application.                   │
│     [ Start Application ]                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Status Badges

Use shadcn `Badge` component with these variants:

| Status | Style | Label |
|---|---|---|
| `draft` | `variant="outline"` | Draft |
| `submitted` | `variant="secondary"` | Submitted |
| `under_review` | `bg-chart-1/10 text-chart-1 border-chart-1/20` | Under Review |
| `approved` | `bg-green-500/10 text-green-600 border-green-500/20` | Approved |
| `denied` | `variant="destructive"` | Denied |
| `more_info_needed` | `bg-amber-500/10 text-amber-600 border-amber-500/20` | Info Needed |

### Component Structure

```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
    <Button asChild>
      <Link href="/apply"><Plus className="size-4" /> New Application</Link>
    </Button>
  </div>

  {/* Filter tabs */}
  <Tabs defaultValue="all">
    <TabsList>
      <TabsTrigger value="all">All ({total})</TabsTrigger>
      <TabsTrigger value="draft">Drafts ({drafts})</TabsTrigger>
      <TabsTrigger value="submitted">Submitted ({submitted})</TabsTrigger>
      <TabsTrigger value="approved">Approved ({approved})</TabsTrigger>
    </TabsList>
  </Tabs>

  {/* Application list */}
  <div className="space-y-3">
    {applications.map(app => <ApplicationCard key={app.id} app={app} />)}
  </div>
</div>
```

**Application Card:**
- Clickable card (entire card is a link to `/applications/[id]`)
- Left side: purpose as title (`font-semibold`), amount + term below (`text-sm text-muted-foreground`), date below that
- Right side: status badge, chevron-right icon
- Draft cards show "Continue" button instead of chevron (links to `/apply` with draft data loaded)
- `hover:bg-muted/50 transition` on the card

**Empty State:**
- Centered vertically, icon + heading + description + CTA button
- Icon: `<ClipboardList className="size-12 text-muted-foreground" />`

**shadcn components needed:** `Tabs`, `TabsList`, `TabsTrigger`, `Badge`, `Card`

---

## 6. Application Detail View

**Route:** `/applications/[id]`
**File:** `src/app/(app)/applications/[id]/page.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  [Nav bar]                                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ← Back to Dashboard                                    │
│                                                          │
│  Home Improvement Loan               [Submitted]         │
│  Application #LN-2026-0042                               │
│                                                          │
│  ┌─────────────────────────── ┬ ─────────────────────┐   │
│  │  Application Details       │  Timeline            │   │
│  │  (left col, wider)        │  (right col)          │   │
│  │                           │                       │   │
│  │  ┌─ Loan Details ──────┐  │  ● Application        │   │
│  │  │ Amount: $25,000     │  │    submitted          │   │
│  │  │ Term: 36 months     │  │    Mar 12, 2026       │   │
│  │  │ Purpose: Home imp.  │  │    10:23 AM           │   │
│  │  └─────────────────────┘  │                       │   │
│  │                           │  ● Documents           │   │
│  │  ┌─ Personal Info ─────┐  │    verified            │   │
│  │  │ Name: Jane Smith    │  │    Mar 13, 2026       │   │
│  │  │ DOB: Mar 15, 1990   │  │                       │   │
│  │  │ Phone: (555) 123... │  │  ● Under review       │   │
│  │  │ Address: 123 Main.. │  │    Mar 14, 2026       │   │
│  │  └─────────────────────┘  │                       │   │
│  │                           │                       │   │
│  │  ┌─ Employment ────────┐  │                       │   │
│  │  │ Status: Employed    │  │                       │   │
│  │  │ Employer: Acme Corp │  │                       │   │
│  │  │ Income: $120,000/yr │  │                       │   │
│  │  └─────────────────────┘  │                       │   │
│  │                           │                       │   │
│  │  ┌─ Financial Profile ─┐  │                       │   │
│  │  │ Assets: $50,000     │  │                       │   │
│  │  │ Debts: $15,000      │  │                       │   │
│  │  │ Expenses: $3,200/mo │  │                       │   │
│  │  └─────────────────────┘  │                       │   │
│  │                           │                       │   │
│  │  ┌─ Documents ─────────┐  │                       │   │
│  │  │ 📄 paystub_jan.pdf  │  │                       │   │
│  │  │ 📄 drivers_lic.jpg  │  │                       │   │
│  │  └─────────────────────┘  │                       │   │
│  └───────────────────────────┴───────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Component Structure

```tsx
<div className="space-y-6">
  {/* Back link */}
  <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
    <ArrowLeft className="size-4" /> Back to Dashboard
  </Link>

  {/* Header */}
  <div className="flex items-start justify-between">
    <div>
      <h1 className="text-2xl font-bold">{application.purposeLabel} Loan</h1>
      <p className="text-sm text-muted-foreground">Application #{application.referenceId}</p>
    </div>
    <StatusBadge status={application.status} />
  </div>

  {/* Two-column layout */}
  <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
    {/* Left: detail cards */}
    <div className="space-y-4">
      <DetailSection title="Loan Details" data={...} />
      <DetailSection title="Personal Information" data={...} />
      <DetailSection title="Employment & Income" data={...} />
      <DetailSection title="Financial Profile" data={...} />
      <DetailSection title="Documents" files={...} />
    </div>

    {/* Right: timeline */}
    <Card>
      <CardHeader><CardTitle className="text-base">Activity</CardTitle></CardHeader>
      <CardContent>
        <Timeline events={application.events} />
      </CardContent>
    </Card>
  </div>
</div>
```

### Timeline Component

Vertical timeline using relative positioning:

```tsx
<ol className="relative border-l border-border ml-3 space-y-6">
  {events.map(event => (
    <li key={event.id} className="ml-6">
      <span className="absolute -left-2 flex size-4 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
      <p className="text-sm font-medium">{event.title}</p>
      <time className="text-xs text-muted-foreground">{event.date}</time>
      {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
    </li>
  ))}
</ol>
```

### Responsive

- On mobile (<1024px): timeline moves below the detail sections (single column, stacked)
- Detail sections are always full-width on mobile

**shadcn components needed:** `Card`, `Badge`, `Separator`

---

## 7. User Profile Page

**Route:** `/profile`
**File:** `src/app/(app)/profile/page.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  [Nav bar]                                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Profile                                                 │
│                                                          │
│  ┌── Account Information ─────────────────────────────┐  │
│  │                                                    │  │
│  │  [Avatar circle - initials]                        │  │
│  │  Jane Smith                                        │  │
│  │  jane@example.com                                  │  │
│  │  Member since Mar 2026                             │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── Personal Details ───────────── [Edit] ───────────┐  │
│  │                                                    │  │
│  │  Full name         Jane Smith                      │  │
│  │  Email             jane@example.com                │  │
│  │  Phone             (555) 123-4567                  │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── Security ──────────────────────────────────────┐    │
│  │                                                    │  │
│  │  Password          ••••••••     [Change password]  │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── Danger Zone ─────────────────────────────────────┐  │
│  │                                                    │  │
│  │  Delete your account and all associated data.      │  │
│  │                              [Delete Account]      │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Component Structure

```tsx
<div className="max-w-2xl space-y-6">
  <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

  {/* Account card with avatar */}
  <Card>
    <CardContent className="flex items-center gap-4 pt-6">
      <Avatar className="size-16">
        <AvatarFallback className="text-lg">JS</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground">Member since {user.joinDate}</p>
      </div>
    </CardContent>
  </Card>

  {/* Personal details - read mode with edit toggle */}
  <Card>
    <CardHeader className="flex-row items-center justify-between">
      <CardTitle>Personal Details</CardTitle>
      <Button variant="ghost" size="sm">Edit</Button>
    </CardHeader>
    <CardContent>
      <dl className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
        <dt className="text-muted-foreground">Full name</dt><dd>{user.name}</dd>
        <dt className="text-muted-foreground">Email</dt><dd>{user.email}</dd>
        <dt className="text-muted-foreground">Phone</dt><dd>{user.phone}</dd>
      </dl>
    </CardContent>
  </Card>

  {/* Security */}
  <Card>
    <CardHeader><CardTitle>Security</CardTitle></CardHeader>
    <CardContent className="flex items-center justify-between">
      <div>
        <p className="text-sm">Password</p>
        <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
      </div>
      <Button variant="outline" size="sm">Change password</Button>
    </CardContent>
  </Card>

  {/* Danger zone */}
  <Card className="border-destructive/50">
    <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
    <CardContent className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">Delete your account and all associated data.</p>
      <Button variant="destructive" size="sm">Delete Account</Button>
    </CardContent>
  </Card>
</div>
```

### Interaction Notes

- "Edit" in Personal Details toggles fields to editable inputs inline, with Save/Cancel buttons
- "Change password" opens a dialog with: current password, new password, confirm new password
- "Delete Account" triggers a destructive `AlertDialog`: "Are you sure? This action cannot be undone. All your applications and data will be permanently deleted."

**shadcn components needed:** `Card`, `Avatar`, `AvatarFallback`, `Button`, `AlertDialog`, `Dialog`, `Input`, `Label`

---

## shadcn/ui Components Summary

Components to install (not yet in the project):

```bash
npx shadcn@latest add card input label select textarea tabs badge \
  separator avatar dropdown-menu sheet alert alert-dialog dialog \
  checkbox popover calendar progress
```

Already installed: `button`

---

## Global Patterns

### Page Container
All authenticated pages use a consistent wrapper:
```tsx
<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  {children}
</div>
```

### Form Fields
Consistent field pattern across all forms:
```tsx
<div className="space-y-2">
  <Label htmlFor={id}>{label} {required && <span className="text-destructive">*</span>}</Label>
  <Input id={id} {...props} aria-describedby={`${id}-error`} aria-invalid={!!error} />
  {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  {error && <p id={`${id}-error`} className="text-sm text-destructive" role="alert">{error}</p>}
</div>
```

### Loading States
- Page loads: skeleton cards matching the layout shape
- Button submits: spinner icon + disabled state
- Data fetching: shadcn `Skeleton` component matching content dimensions

### Error States
- Form validation: inline errors below fields
- API errors: destructive `Alert` at top of form
- 404: centered message with "Go to Dashboard" link
- Network error: toast notification

### Accessibility Checklist (applies to all pages)
- All form inputs have associated `<Label>` elements
- Error messages linked via `aria-describedby`
- Invalid fields marked with `aria-invalid="true"`
- Focus management: auto-focus first field on page load, move focus to first error on validation failure
- Color contrast: all text meets 4.5:1 ratio (ensured by shadcn neutral palette)
- Interactive elements: minimum 44x44px touch target on mobile
- Keyboard navigation: all interactive elements reachable via Tab, activatable via Enter/Space
- Screen reader: status changes announced via `aria-live="polite"` regions
- Skip-to-content link on every page
