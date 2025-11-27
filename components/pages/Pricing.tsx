"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { PricingCard } from "@/components/cards/PricingCard";
import { pricingPlans, type PricingPlan } from "@/lib/plans";
import { useAuth } from "@clerk/nextjs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Pricing({ currentPlan }: { currentPlan: any }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { authFetch } = useAuthFetch();
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});
  const [subscription, setSubscription] = useState(currentPlan);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoadingPlans((prev) => ({ ...prev, [planName]: true }));
    setPricingError(null);

    try {
      const response = await authFetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ priceId }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const data = await response.json().catch(() => ({}));
        setPricingError(data?.message || "Failed to start checkout.");
        setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
      }
    } catch {
      setPricingError("Failed to start checkout. Please try again.");
      setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
    }
  };

  const refreshSubscription = useCallback(async () => {
    try {
      const response = await authFetch("/api/user/subscription");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  }, [authFetch]);

  useEffect(() => {
    setSubscription(currentPlan);
  }, [currentPlan]);

  const handlePlanSelection = async (plan: PricingPlan) => {
    if (!plan.priceId) {
      setPricingError("Plan is not available right now.");
      return;
    }

    await handleSubscribe(plan.priceId, plan.name);
  };

  // Find current plan's credits
  const currentPlanDetails = pricingPlans.find(
    (plan) => plan.name.toLowerCase() === subscription?.plan?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-28">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Start free, upgrade when you&apos;re ready
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every plan begins with 4 complimentary credits—enough to ship a full thumbnail so you can feel the workflow before paying a dollar.
          </p>
        </div>

        {pricingError && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
            <AlertDescription>{pricingError}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 max-w-7xl mx-auto">
          {pricingPlans
            .filter((plan) => !(plan.isFree || plan.tier === "free"))
            .map((plan) => (
              <div key={plan.name}>
                <PricingCard
                  plan={plan}
                  isLoading={loadingPlans[plan.name] || false}
                  onSelect={handlePlanSelection}
                  isCurrentPlan={
                    plan.name.toLowerCase() === subscription?.plan?.toLowerCase()
                  }
                  stripeCustomerId={subscription?.stripeCustomerId}
                  currentPlanCredits={currentPlanDetails?.credits || 0}
                />
              </div>
            ))}
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
