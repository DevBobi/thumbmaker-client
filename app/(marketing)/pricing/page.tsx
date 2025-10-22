import Pricing from "@/components/pages/Pricing";
import { serverAuthFetch } from "@/lib/server-auth-fetch";

export default async function PricingPage() {
  let currentPlan = null;

  try {
    const res = await serverAuthFetch("/api/user/subscription");
    if (res.ok) {
      currentPlan = await res.json();
    }
  } catch (error) {
    // User is not authenticated, which is fine
    console.log("User not authenticated, showing public pricing", error);
  }

  return (
    <Pricing
      currentPlan={
        currentPlan || {
          plan: null,
          stripeCustomerId: null,
          gotFreeCredits: false,
        }
      }
    />
  );
}
