import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingButton } from "../BillingButton";
import type { PricingPlan } from "@/lib/plans";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface PricingCardProps {
  plan: PricingPlan;
  isLoading: boolean;
  onSelect: (plan: PricingPlan) => void;
  isCurrentPlan: boolean;
  stripeCustomerId: string;
  currentPlanCredits?: number;
}

export function PricingCard({
  plan,
  isLoading,
  onSelect,
  isCurrentPlan,
  stripeCustomerId,
  currentPlanCredits,
}: PricingCardProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (!isSignedIn) {
      if (!plan.priceId) {
        router.push("/sign-in?redirect_url=/pricing");
        return;
      }

      const targetParams = new URLSearchParams();
      targetParams.set("plan", plan.tier);
      targetParams.set("priceId", plan.priceId);

      const redirectParams = new URLSearchParams();
      redirectParams.set("redirect_url", `/pricing?${targetParams.toString()}`);

      router.push(`/sign-in?${redirectParams.toString()}`);
      return;
    }
    onSelect(plan);
  };

  const getButtonText = () => {
    if (isCurrentPlan) return "Current Plan";
    if (!currentPlanCredits) return "Get Started";

    const isUpgrade = plan.credits && plan.credits > currentPlanCredits;
    return isUpgrade ? "Upgrade Plan" : "Downgrade Plan";
  };

  return (
    <div
      className={`relative rounded-2xl bg-card p-8 shadow-lg ${
        plan.popular
          ? "border-2 border-primary scale-105"
          : "border border-border"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>

        {/* Price Section */}
        <div className="mt-4 flex items-baseline justify-center">
          <span className="text-5xl font-bold tracking-tight text-foreground">
            {plan.isFree ? "Free" : `$${plan.price}`}
          </span>
          {!plan.isFree && (
            <span className="ml-1 text-xl text-muted-foreground">/month</span>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 text-muted-foreground">{plan.description}</p>
      </div>

      {/* Credits Display */}
      {plan.credits !== null && (
        <div className="mt-8">
          <div className="flex items-center justify-center">
            <span className="text-xl font-semibold text-primary">
              {plan.credits.toLocaleString()} Credits
            </span>
          </div>
        </div>
      )}

      {/* Features */}
      <ul className="mt-8 space-y-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center">
            <Check className="h-5 w-5 text-primary mr-3" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Button Section */}
      <div className="mt-8">
        {isCurrentPlan ? (
          <BillingButton
            variant="default"
            stripeCustomerId={stripeCustomerId}
            className="w-full cursor-pointer"
            size="lg"
            text="Manage Billing"
          />
        ) : (
          <Button
            size="lg"
            disabled={isLoading}
            onClick={handleGetStarted}
            variant={plan.popular ? "default" : "secondary"}
            className="w-full cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              getButtonText()
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
