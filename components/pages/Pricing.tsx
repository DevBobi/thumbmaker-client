"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { PricingCard } from "@/components/cards/PricingCard";
import { CustomPricingCard } from "@/components/cards/CustomPricingCard";
import { pricingPlans, type PricingPlan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { useTrialActions } from "@/hooks/use-free-credits";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function Pricing({ currentPlan }: { currentPlan: any }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { authFetch } = useAuthFetch();
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});
  const [subscription, setSubscription] = useState(currentPlan);
  const {
    startTrial,
    convertTrial,
    isStarting,
    isConverting,
    error: trialError,
    setError: setTrialError,
  } = useTrialActions();
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

  const defaultTrialPriceId =
    process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_STANDARD_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID ||
    "";

  const DEFAULT_TRIAL_CREDITS = 4;

  const trialState = useMemo(() => {
    const rawTrialCredits = subscription?.trialCredits;
    const trialCredits =
      typeof rawTrialCredits === "number" && rawTrialCredits > 0
        ? rawTrialCredits
        : DEFAULT_TRIAL_CREDITS;
    const trialCreditsUsed = subscription?.trialCreditsUsed ?? 0;
    const remainingCredits = Math.max(0, trialCredits - trialCreditsUsed);
    const trialEndsAt = subscription?.trialEndsAt
      ? new Date(subscription.trialEndsAt)
      : null;
    const daysRemaining = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
      : null;
    const isTrialing = ["trialing", "ending"].includes(
      subscription?.trialStatus ?? ""
    );
    const hasUsedTrial = Boolean(subscription?.trialCreditsAwarded);

    return {
      trialCredits,
      remainingCredits,
      daysRemaining,
      isTrialing,
      hasUsedTrial,
    };
  }, [subscription]);

  const handleStartTrial = async (priceId?: string) => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    setTrialError(null);

    const targetPriceId = priceId || defaultTrialPriceId;

    if (!targetPriceId) {
      setTrialError("Trial plan is not configured yet.");
      return;
    }

    try {
      await startTrial(targetPriceId);
      await refreshSubscription();
    } catch {
      // handled by hook
    }
  };

  const handleConvertTrial = async () => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    setTrialError(null);

    try {
      await convertTrial();
      await refreshSubscription();
    } catch {
      // handled by hook
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

  const handlePlanSelection = async (plan: PricingPlan) => {
    if (!plan.priceId) {
      setTrialError("Plan is not available right now.");
      return;
    }

    if (plan.isFree || plan.tier === "free") {
      await handleStartTrial(plan.priceId);
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your YouTube thumbnail needs. Create stunning thumbnails that get clicks.
          </p>
        </div>

        <div className="mb-12 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide">
                Free Trial
              </p>
              {trialState.isTrialing ? (
                <h2 className="text-2xl font-semibold text-foreground">
                  {trialState.remainingCredits} credit
                  {trialState.remainingCredits === 1 ? "" : "s"} left ·{" "}
                  {trialState.daysRemaining !== null
                    ? `${trialState.daysRemaining} day${
                        trialState.daysRemaining === 1 ? "" : "s"
                      } remaining`
                    : "trial ending soon"}
                </h2>
              ) : trialState.hasUsedTrial ? (
                <h2 className="text-2xl font-semibold text-foreground">
                  Trial completed
                </h2>
              ) : (
                <h2 className="text-2xl font-semibold text-foreground">
                  Get {trialState.trialCredits} free credits before you commit
                </h2>
              )}
              <p className="mt-2 text-muted-foreground">
                {trialState.hasUsedTrial
                  ? "You’ve experienced ThumbMaker’s workflow. Pick a plan to keep generating winning thumbnails."
                  : "Start designing immediately with complimentary credits. No card required to begin."}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {!trialState.hasUsedTrial && (
                <Button
                  onClick={() => handleStartTrial()}
                  disabled={isStarting}
                  className="sm:min-w-[200px]"
                >
                  {isStarting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting trial...
                    </div>
                  ) : (
                    `Start free trial (${trialState.trialCredits} credits)`
                  )}
                </Button>
              )}
              {trialState.isTrialing && (
                <Button
                  variant="outline"
                  onClick={handleConvertTrial}
                  disabled={isConverting}
                  className="sm:min-w-[160px]"
                >
                  {isConverting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Converting...
                    </div>
                  ) : (
                    "Upgrade now"
                  )}
                </Button>
              )}
            </div>
          </div>
          {trialError && (
            <p className="mt-3 text-sm text-red-500">{trialError}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <div key={plan.name}>
                <PricingCard
                  plan={plan}
                  isLoading={loadingPlans[plan.name] || false}
                  onSubscribe={() => handlePlanSelection(plan)}
                onUpgradeOrDowngrade={handleUpgradeOrDowngrade}
                isCurrentPlan={
                  plan.name.toLowerCase() === subscription?.plan?.toLowerCase()
                }
                stripeCustomerId={subscription?.stripeCustomerId}
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
