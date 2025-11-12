"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { PricingCard } from "@/components/cards/PricingCard";
import { CustomPricingCard } from "@/components/cards/CustomPricingCard";
import { pricingPlans } from "@/lib/plans";

export default function Pricing({ currentPlan }: { currentPlan: any }) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoadingPlans((prev) => ({ ...prev, [planName]: true }));

    try {
      const response = await authFetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ priceId }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
      }
    } catch {
      setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
    }
  };

  const handleUpgradeOrDowngrade = async (
    priceId: string,
    planName: string
  ) => {
    setLoadingPlans((prev) => ({ ...prev, [planName]: true }));

    try {
      const response = await authFetch(
        "/api/stripe/upgrade-or-downgrade-subscription",
        {
          method: "POST",
          body: JSON.stringify({ priceId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        router.push(data.url);
      } else {
        setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
      }
    } catch {
      setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
    }
  };

  // Find current plan's credits
  const currentPlanDetails = pricingPlans.find(
    (plan) => plan.name.toLowerCase() === currentPlan.plan?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-28">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your YouTube thumbnail needs. Create stunning thumbnails that get clicks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <div key={plan.name}>
              <PricingCard
                plan={plan}
                isLoading={loadingPlans[plan.name] || false}
                onSubscribe={handleSubscribe}
                onUpgradeOrDowngrade={handleUpgradeOrDowngrade}
                isCurrentPlan={
                  plan.name.toLowerCase() === currentPlan.plan?.toLowerCase()
                }
                stripeCustomerId={currentPlan.stripeCustomerId}
                currentPlanCredits={currentPlanDetails?.credits || 0}
              />
            </div>
          ))}
          <CustomPricingCard />
        </div>

        {/* FAQ Section */}
        {/* <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Need help? Check out our FAQ section or contact our support team.
          </p>
        </div> */}
      </div>
    </div>
  );
}
