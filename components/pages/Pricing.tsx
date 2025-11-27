"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { PricingCard } from "@/components/cards/PricingCard";
import { pricingPlans, type PricingPlan } from "@/lib/plans";
import { useAuth } from "@clerk/nextjs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Pricing({ currentPlan }: { currentPlan: any }) {
  const { isSignedIn } = useAuth();
  const { authFetch } = useAuthFetch();
  const searchParams = useSearchParams();
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});
  const [subscription, setSubscription] = useState(currentPlan);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const handleSubscribe = useCallback(
    async (priceId: string, planName: string) => {
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
    },
    [authFetch]
  );

  useEffect(() => {
    setSubscription(currentPlan);
  }, [currentPlan]);

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

  const selectedPlanTier = searchParams?.get("plan");
  const selectedPriceId = searchParams?.get("priceId");

  const pendingPlan = useMemo(() => {
    if (!selectedPlanTier && !selectedPriceId) {
      return null;
    }

    return (
      pricingPlans.find((plan) => {
        if (selectedPriceId && plan.priceId === selectedPriceId) return true;
        if (selectedPlanTier && plan.tier === selectedPlanTier) return true;
        return false;
      }) ?? null
    );
  }, [selectedPlanTier, selectedPriceId]);

  const autoCheckoutTriggered = useRef(false);

  useEffect(() => {
    if (
      !isSignedIn ||
      !pendingPlan ||
      pendingPlan.isFree ||
      !pendingPlan.priceId ||
      autoCheckoutTriggered.current
    ) {
      return;
    }

    autoCheckoutTriggered.current = true;
    handlePlanSelection(pendingPlan);
  }, [handlePlanSelection, isSignedIn, pendingPlan]);

  // Find current plan's credits
  const currentPlanDetails = pricingPlans.find(
    (plan) => plan.name.toLowerCase() === subscription?.plan?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto max-w-6xl px-4 py-16 lg:py-20">
        {/* Header Section */}
        <div className="text-center mb-10 lg:mb-14">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Start free, upgrade when you&apos;re ready
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Every plan begins with 4 complimentary credits—enough to ship a full thumbnail so you can feel the workflow before paying a dollar.
          </p>
        </div>

        {pricingError && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
            <AlertDescription>{pricingError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {pricingPlans
            .filter((plan) => !(plan.isFree || plan.tier === "free"))
            .map((plan) => (
              <div key={plan.name} className="h-full">
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
