// TC-003: FSEC03 - Client-Side Secrets & Sensitive Build Artifacts

// VIOLATION (FSEC03): Hardcoded private secret / service role key bundled into client code
const STRIPE_SECRET_KEY = "sk_live_51NzT1234567890abcdefghijklmnopqrstuvwxyzSECRET";

export async function processDirectRefund(chargeId: string, amount: number) {
  const response = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `charge=${chargeId}&amount=${amount}`,
  });
  return response.json();
}

