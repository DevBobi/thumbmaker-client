import { Button } from "../ui/button";
import { useFreeCredits } from "@/hooks/use-free-credits";
import { Check, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function FreeCreditsCard() {
  const { isSignedIn } = useUser();
  const { isLoading, error, handleGetFreeCredits } = useFreeCredits();

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
          Get 10 Free Credits
        </h3>
        <p className="text-muted-foreground">
          Connect your payment method and receive 10 free credits to try our
          service!
        </p>

        <div className="flex items-center space-x-2 text-green-500">
          <Check className="h-5 w-5" />
          <span>No upfront payment required</span>
        </div>

        <div className="flex items-center space-x-2 text-green-500">
          <Check className="h-5 w-5" />
          <span>Credits added instantly</span>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button
          onClick={handleGetFreeCredits}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : (
            "Get Free Credits"
          )}
        </Button>
      </div>
    </div>
  );
}
