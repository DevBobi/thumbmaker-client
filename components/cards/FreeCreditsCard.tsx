import { Button } from "../ui/button";
import { useFreeCredits } from "@/hooks/use-free-credits";
import { Check, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { TRIAL_CREDIT_ALLOCATION } from "@/constants/credits";

export function FreeCreditsCard() {
  const { isSignedIn } = useUser();
  const {
    isAddingPaymentMethod,
    isActivatingTrial,
    error,
    handleAddPaymentMethod,
    handleActivateTrial,
  } = useFreeCredits();

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20 shadow-lg">
    
      <div className="absolute top-0 right-0 -mt-4 -mr-4">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
          Special Offer
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Get {TRIAL_CREDIT_ALLOCATION} Free Credits
        </h3>
        <p className="text-muted-foreground">
          Add a payment method once to unlock your trial credits. No billing until you pick a plan.
        </p>

        <div className="flex items-center space-x-2 text-green-500">
          <Check className="h-5 w-5" />
          <span>No upfront payment required</span>
        </div>

        <div className="flex items-center space-x-2 text-green-500">
          <Check className="h-5 w-5" />
          <span>Secure Stripe checkout</span>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleAddPaymentMethod}
            disabled={isAddingPaymentMethod}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            {isAddingPaymentMethod ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting...
              </div>
            ) : (
              "Add payment method"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={handleActivateTrial}
            disabled={isActivatingTrial}
            className="w-full"
          >
            {isActivatingTrial ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating...
              </div>
            ) : (
              "Activate trial credits"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
