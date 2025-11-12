import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingButton } from "../BillingButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface PricingPlan {
  name: string;
  price: string | null;
  credits: number | null;
  description: string;
  features: string[];
  popular: boolean;
  priceId: string | undefined | null;
}

interface PricingCardProps {
  plan: PricingPlan;
  isLoading: boolean;
  onSubscribe: (priceId: string, planName: string) => void;
  onUpgradeOrDowngrade: (priceId: string, planName: string) => void;
  isCurrentPlan: boolean;
  stripeCustomerId: string;
  currentPlanCredits?: number;
}

export function PricingCard({
  plan,
  isLoading,
  onSubscribe,
  onUpgradeOrDowngrade,
  isCurrentPlan,
  stripeCustomerId,
  currentPlanCredits,
}: PricingCardProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }
    if (plan.priceId) {
      onSubscribe(plan.priceId, plan.name);
    }
  };

  const handleUpgradeOrDowngrade = () => {
    if (plan.priceId) {
      onUpgradeOrDowngrade(plan.priceId, plan.name);
    }
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
            ${plan.price}
          </span>
          <span className="ml-1 text-xl text-muted-foreground">/month</span>
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
            onClick={
              stripeCustomerId ? handleUpgradeOrDowngrade : handleGetStarted
            }
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
