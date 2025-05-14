import { serverAuthFetch } from "@/lib/server-auth-fetch";
import Billing from "@/components/pages/Billing";

export default async function BillingPage() {
  const res = await serverAuthFetch("/api/user/subscription");
  const data = await res.json();

  return (
    <Billing
      credits={data.credits}
      isActive={data.isActive}
      status={data.status}
      stripeCurrentPeriodEnd={data.stripeCurrentPeriodEnd}
      stripeCustomerId={data.stripeCustomerId}
      isCancelled={data.isCancelled}
      priceId={data.stripePriceId}
    />
  );
}
