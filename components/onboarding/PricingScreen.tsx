"use client";

import { useState, useCallback } from "react";
import { PricingCard } from "@/components/cards/PricingCard";
import { pricingPlans, type PricingPlan } from "@/lib/plans";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useUser } from "@clerk/nextjs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PricingScreen() {
  const { authFetch } = useAuthFetch();
  const { user } = useUser();
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>(
    {}
  );
  const [pricingError, setPricingError] = useState<string | null>(null);

  const handleSubscribe = useCallback(
    async (priceId: string, planName: string) => {
      setLoadingPlans((prev) => ({ ...prev, [planName]: true }));
      setPricingError(null);

      try {
        const response = await authFetch("/stripe/create-checkout-session", {
          method: "POST",
          body: JSON.stringify({ priceId }),
        });

        if (response.ok) {
          const data = await response.json();
          // Mark onboarding as complete before redirecting
          if (user?.id) {
            localStorage.setItem(
              `hasCompletedNewOnboarding_${user.id}`,
              "true"
            );
          }
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
    },
    [authFetch, user?.id]
  );

  const handlePlanSelection = useCallback(
    async (plan: PricingPlan) => {
      if (!plan.priceId) {
        setPricingError("Plan is not available right now.");
        return;
      }

      await handleSubscribe(plan.priceId, plan.name);
    },
    [handleSubscribe]
  );

  // Filter out free plan for onboarding paywall
  const availablePlans = pricingPlans.filter(
    (plan) => !(plan.isFree || plan.tier === "free")
  );

  return (
    <div className="w-full py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Select a plan to start creating thumbnails
          </p>
        </div>

        {pricingError && (
          <Alert variant="destructive">
            <AlertDescription>{pricingError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availablePlans.map((plan) => (
            <div key={plan.name} className="h-full">
              <PricingCard
                plan={plan}
                isLoading={loadingPlans[plan.name] || false}
                onSelect={handlePlanSelection}
                isCurrentPlan={false}
                stripeCustomerId=""
                currentPlanCredits={0}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

