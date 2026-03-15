export async function sendRegistrationInvite(params: {
  email: string;
  firstName: string;
  referenceId: string;
}) {
  // TODO: Replace with real email provider (e.g., Resend, SendGrid)
  console.log(`[EMAIL] Registration invite sent to ${params.email}`);
  console.log(`[EMAIL] Subject: Complete your registration - Application ${params.referenceId}`);
  console.log(
    `[EMAIL] Body: Hi ${params.firstName}, your loan application ${params.referenceId} has been submitted. Create an account to track your application: /register?email=${encodeURIComponent(params.email)}`
  );
}
