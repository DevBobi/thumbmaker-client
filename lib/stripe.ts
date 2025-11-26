import Stripe from "stripe";

const stripeApiKey = process.env.STRIPE_API_KEY;

if (!stripeApiKey) {
  // During builds or in environments without Stripe configured, avoid crashing
  console.warn(
    "STRIPE_API_KEY is not set. Stripe client is disabled and Stripe features will not work."
  );
}

export const stripe = stripeApiKey
  ? new Stripe(stripeApiKey, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    })
  : (null as unknown as Stripe);
