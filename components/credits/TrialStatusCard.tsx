"use client";

import { CreditSummary } from "@/types/credits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TRIAL_CREDIT_ALLOCATION } from "@/constants/credits";
import { useFreeCredits } from "@/hooks/use-free-credits";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type TrialStatusCardProps = {
  summary?: CreditSummary;
  isLoading?: boolean;
  className?: string;
  onTrialUpdated?: () => void;
};

export function TrialStatusCard({
  summary,
  isLoading,
  className,
  onTrialUpdated,
}: TrialStatusCardProps) {
  const {
    handleAddPaymentMethod,
    handleActivateTrial,
    isAddingPaymentMethod,
    isActivatingTrial,
    error,
  } = useFreeCredits();
  const { toast } = useToast();

  const trialActive = summary?.trialStatus === "ACTIVE";
  const trialPercentage = summary
    ? Math.min(
        (summary.trialCredits / TRIAL_CREDIT_ALLOCATION) * 100,
        100
      )
    : 0;

  const totalCredits =
    (summary?.credits || 0) +
    (trialActive ? summary?.trialCredits || 0 : 0);

  const handleTrialActivation = async () => {
    try {
      const data = await handleActivateTrial();
      toast({
        title: "Trial activated",
        description: `You have ${data.trialCredits ?? TRIAL_CREDIT_ALLOCATION
          } free credits to start with.`,
      });
      onTrialUpdated?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to activate trial";
      toast({
        title: "Unable to activate trial",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleAddCard = async () => {
    try {
      await handleAddPaymentMethod();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start payment setup";
      toast({
        title: "Something went wrong",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={cn("border-dashed border-primary/10", className)}>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full">
            <p className="text-sm text-muted-foreground">Total available</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                {isLoading ? "—" : totalCredits}
              </span>
              {trialActive && (
                <Badge variant="secondary" className="uppercase text-[10px]">
                  Trial live
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid credits: {summary?.credits ?? 0} · Trial credits:{" "}
              {summary?.trialCredits ?? 0}
            </p>
          </div>

          <div className="space-y-1 w-full">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Card secured via Stripe
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              7-credit free trial for new accounts
            </p>
          </div>
        </div>

        {trialActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Free credits remaining</span>
              <span>
                {summary?.trialCredits ?? 0}/{TRIAL_CREDIT_ALLOCATION}
              </span>
            </div>
            <Progress value={trialPercentage} />
          </div>
        )}

        {summary?.trialStatus === "NOT_STARTED" && (
          <div className="space-y-3">
            <Alert className="bg-primary/5 border-primary/20">
              <AlertTitle>Unlock your trial</AlertTitle>
              <AlertDescription>
                Add a payment method once to keep bots out, then activate your{" "}
                {TRIAL_CREDIT_ALLOCATION}-credit trial instantly. You won’t be
                charged until you pick a plan.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={handleAddCard}
                disabled={isAddingPaymentMethod}
                className="w-full sm:flex-1"
              >
                {isAddingPaymentMethod && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Add payment method
              </Button>
              <Button
                variant="outline"
                onClick={handleTrialActivation}
                disabled={isActivatingTrial}
                className="w-full sm:flex-1"
              >
                {isActivatingTrial && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Activate free trial
              </Button>
            </div>
          </div>
        )}

        {trialActive && (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground md:max-w-[65%]">
              We’ll pause new generations when trial credits hit zero. Lock in a
              plan before that happens.
            </p>
            <Button variant="outline" asChild className="w-full md:w-auto">
              <Link href="/dashboard/billing">Browse plans</Link>
            </Button>
          </div>
        )}

        {summary?.trialStatus === "EXHAUSTED" && (
          <Alert variant="destructive">
            <AlertTitle>Trial completed</AlertTitle>
            <AlertDescription>
              Your free credits are fully used. Pick a plan to start generating
              again instantly.
            </AlertDescription>
          </Alert>
        )}

        {!summary?.hasCredits && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="w-full sm:flex-1">
              <Link href="/dashboard/billing">Upgrade plan</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:flex-1">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

