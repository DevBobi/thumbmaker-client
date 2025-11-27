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

  const isFeatured = plan.popular;
  const badgeLabel = plan.badge || (isFeatured ? "Most Popular" : null);
  const formattedPrice = plan.isFree ? "Free" : `$${plan.price}`;

  return (
    <div
      className={`relative flex h-full flex-col rounded-[32px] border bg-white p-8 shadow-[0_25px_100px_rgba(15,23,42,0.08)] ${
        isFeatured ? "border-rose-200 bg-gradient-to-b from-white to-rose-50/60" : "border-gray-200"
      }`}
    >
      {badgeLabel && (
        <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          {badgeLabel}
        </div>
      )}

      <div className="space-y-2 text-gray-900">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold">{formattedPrice}</span>
          {!plan.isFree && <span className="text-sm font-medium text-gray-500">/ month</span>}
        </div>
        <p className="text-sm text-gray-500">{plan.description}</p>
      </div>

      <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <ul className="flex-1 space-y-4 text-sm text-gray-800">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-rose-100 bg-white">
              <Check className="h-3.5 w-3.5 text-rose-500" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {isCurrentPlan ? (
          <BillingButton
            variant={isFeatured ? "default" : "outline"}
            stripeCustomerId={stripeCustomerId}
            className={`w-full rounded-full text-sm font-semibold ${
              isFeatured
                ? "bg-gradient-to-br from-gray-900 to-black text-white hover:opacity-90"
                : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
            }`}
            size="lg"
            text="Manage Billing"
          />
        ) : (
          <Button
            size="lg"
            disabled={isLoading}
            onClick={handleGetStarted}
            className={`w-full rounded-full text-sm font-semibold shadow-lg shadow-gray-900/10 ${
              isFeatured
                ? "bg-gradient-to-br from-gray-900 to-black text-white hover:opacity-90"
                : "border border-gray-200 bg-white text-gray-900 shadow-none hover:bg-gray-50"
            }`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : getButtonText()}
          </Button>
        )}
      </div>
    </div>
  );
}
