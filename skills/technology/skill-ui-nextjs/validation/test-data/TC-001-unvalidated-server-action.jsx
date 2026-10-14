// Next.js App Router Server Action Test Fixtures (NEXT05)

"use server";

// Violation: Unvalidated Server Action mutating database without session auth or schema validation
export async function UnvalidatedServerActionViolation(formData) {
  const email = formData.get("email");
  // Direct DB update without verifying authentication session or validating input format
  await db.user.update({ where: { id: 1 }, data: { email } });
}

// Safe Counterpart: Protected Server Action with session verification and input validation
export async function SafeServerActionHandling(formData) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  const rawEmail = formData.get("email");
  const validatedEmail = emailSchema.parse(rawEmail);
  
  await db.user.update({
    where: { id: session.user.id },
    data: { email: validatedEmail }
  });
}

