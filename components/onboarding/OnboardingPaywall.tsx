"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { PricingCard } from "@/components/cards/PricingCard";
import { pricingPlans, type PricingPlan } from "@/lib/plans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@clerk/nextjs";

interface OnboardingPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OnboardingPaywall({
  open,
  onOpenChange,
}: OnboardingPaywallProps) {
  const router = useRouter();
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

  const handleSkip = () => {
    // Mark onboarding as complete
    if (user?.id) {
      localStorage.setItem(`hasCompletedNewOnboarding_${user.id}`, "true");
    }
    // Redirect to homepage
    router.push("/");
  };

  // Filter out free plan for onboarding paywall
  const availablePlans = pricingPlans.filter(
    (plan) => !(plan.isFree || plan.tier === "free")
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 px-1">
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

        <div className="flex justify-center pt-4 pb-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="min-w-[120px]"
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

