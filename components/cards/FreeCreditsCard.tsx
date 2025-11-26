import { Button } from "../ui/button";
import { useTrialActions } from "@/hooks/use-free-credits";
import { AlarmClock, Check, Loader2, Sparkles } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";

type FreeCreditsCardProps = {
  subscription?: any;
  onRefresh?: () => void | Promise<void>;
};

export function FreeCreditsCard({ subscription, onRefresh }: FreeCreditsCardProps) {
  const {
    startTrial,
    convertTrial,
    isStarting,
    isConverting,
    error,
    setError,
  } = useTrialActions();

  const defaultTrialPriceId =
    process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_STANDARD_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID ||
    "";

  const DEFAULT_TRIAL_CREDITS = 4;

  const {
    trialCredits,
    remainingCredits,
    daysRemaining,
    isTrialing,
    hasUsedTrial,
    isActive,
  } = useMemo(() => {
    const baseCredits = subscription?.trialCredits;
    const credits =
      typeof baseCredits === "number" && baseCredits > 0
        ? baseCredits
        : DEFAULT_TRIAL_CREDITS;
    const used = subscription?.trialCreditsUsed ?? 0;
    const remaining = Math.max(0, credits - used);
    const endsAt = subscription?.trialEndsAt
      ? new Date(subscription.trialEndsAt)
      : null;
    const daysLeft = endsAt
      ? Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 86400000))
      : null;

    return {
      trialCredits: credits,
      remainingCredits: remaining,
      daysRemaining: daysLeft,
      isTrialing: ["trialing", "ending"].includes(
        subscription?.trialStatus ?? ""
      ),
      hasUsedTrial: Boolean(subscription?.trialCreditsAwarded),
      isActive: Boolean(subscription?.isActive),
    };
  }, [subscription]);

  const handleStartTrial = async () => {
    if (!defaultTrialPriceId) {
      setError("Trial plan is not configured yet.");
      return;
    }

    try {
      await startTrial(defaultTrialPriceId);
      await onRefresh?.();
    } catch {
      // errors handled via hook state
    }
  };

  const handleConvertTrial = async () => {
    try {
      await convertTrial();
      await onRefresh?.();
    } catch {
      // errors handled via hook state
    }
  };

  const showStartCTA = !hasUsedTrial;
  const showTrialActive = isTrialing;
  const showTrialExpired = hasUsedTrial && !isActive;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-6 shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-500">Free Trial</p>
            <h3 className="text-2xl font-semibold text-foreground">
              {showStartCTA
                ? "Start your 4-credit trial"
                : showTrialActive
                ? "Trial in progress"
                : "Trial completed"}
            </h3>
          </div>
          <div className="rounded-full bg-blue-500/20 p-3 text-blue-500">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {showStartCTA && (
          <p className="text-sm text-muted-foreground">
            Enjoy {trialCredits} complimentary credits to test the thumbnail
            workflow before you subscribe. No payment required.
          </p>
        )}

        {showTrialActive && (
          <div className="space-y-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
              <AlarmClock className="h-4 w-4" />
              <span>
                {daysRemaining !== null
                  ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
                  : "Trial ending soon"}
              </span>
            </div>
            <div className="text-sm text-blue-100">
              {remainingCredits} of {trialCredits} trial credits remaining
            </div>
          </div>
        )}

        {showTrialExpired && (
          <p className="text-sm text-muted-foreground">
            Your trial credits have been used. Choose a plan to keep generating
            thumbnails without interruption.
          </p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {showStartCTA && (
          <Button
            onClick={handleStartTrial}
            disabled={isStarting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            {isStarting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting trial...
              </div>
            ) : (
              `Start free trial (${trialCredits} credits)`
            )}
          </Button>
        )}

        {showTrialActive && (
          <Button
            variant="secondary"
            onClick={handleConvertTrial}
            disabled={isConverting}
            className="w-full"
          >
            {isConverting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating plan...
              </div>
            ) : (
              "Upgrade now"
            )}
          </Button>
        )}

        {showTrialExpired && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" asChild>
              <Link href="/pricing">View plans</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/dashboard/billing">Manage billing</Link>
            </Button>
          </div>
        )}

        {!showStartCTA && !showTrialActive && !showTrialExpired && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Check className="h-4 w-4" />
            Trial perks redeemed
          </div>
        )}
      </div>
    </div>
  );
}
