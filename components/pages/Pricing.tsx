"use client";

import { motion } from "framer-motion";
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoadingPlans((prev) => ({ ...prev, [planName]: true }));
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage("");

    try {
      const response = await authFetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ priceId }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        setIsError(true);
        setErrorMessage("Failed to create checkout session");
        setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage("Failed to create checkout session");
      setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
    }
  };

  const handleUpgradeOrDowngrade = async (
    priceId: string,
    planName: string
  ) => {
    setLoadingPlans((prev) => ({ ...prev, [planName]: true }));
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage("");

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
        setIsError(true);
        setErrorMessage("Failed to upgrade or downgrade subscription");
        setLoadingPlans((prev) => ({ ...prev, [planName]: false }));
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage("Failed to upgrade or downgrade subscription");
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
            Choose the perfect plan for your advertising needs. Pay only for the
            credits you need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
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
            </motion.div>
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
