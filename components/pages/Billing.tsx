"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { BillingButton } from "@/components/BillingButton";
import Breadcrumb from "@/components/Breadcrumb";
import { pricingPlans } from "@/lib/plans";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useTrialActions } from "@/hooks/use-free-credits";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BillingProps {}

const Billing = ({}: BillingProps) => {
  const { authFetch } = useAuthFetch();
  const {
    startTrial,
    convertTrial,
    isStarting,
    isConverting,
    error: trialError,
    setError: setTrialError,
  } = useTrialActions();
  const [subscriptionData, setSubscriptionData] = useState<any>({
    credits: 0,
    isActive: false,
    status: null,
    stripeCurrentPeriodEnd: null,
    stripeCustomerId: "",
    isCancelled: false,
    stripePriceId: null,
  });

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await authFetch("/api/user/subscription");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const { credits, isActive, stripeCurrentPeriodEnd, stripeCustomerId, isCancelled, stripePriceId } = subscriptionData;
  const plan = pricingPlans.find((p) => p.priceId === stripePriceId);
  const defaultTrialPriceId =
    process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_STANDARD_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID ||
    "";

  const DEFAULT_TRIAL_CREDITS = 4;

  const trialState = useMemo(() => {
    const rawTrialCredits = subscriptionData?.trialCredits;
    const trialCredits =
      typeof rawTrialCredits === "number" && rawTrialCredits > 0
        ? rawTrialCredits
        : DEFAULT_TRIAL_CREDITS;
    const trialCreditsUsed = subscriptionData?.trialCreditsUsed ?? 0;
    const remainingCredits = Math.max(0, trialCredits - trialCreditsUsed);
    const trialEndsAt = subscriptionData?.trialEndsAt
      ? new Date(subscriptionData.trialEndsAt)
      : null;
    const daysRemaining = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
      : null;
    const isTrialing = ["trialing", "ending"].includes(
      subscriptionData?.trialStatus ?? ""
    );
    const hasUsedTrial = Boolean(subscriptionData?.trialCreditsAwarded);

    return {
      trialCredits,
      remainingCredits,
      daysRemaining,
      trialEndsAt,
      isTrialing,
      hasUsedTrial,
    };
  }, [subscriptionData]);

  const handleStartTrial = async () => {
    if (!defaultTrialPriceId) {
      setTrialError("Trial plan is not configured yet.");
      return;
    }

    try {
      await startTrial(defaultTrialPriceId);
      await fetchSubscription();
    } catch {
      // Error handled by hook
    }
  };

  const handleConvertTrial = async () => {
    try {
      await convertTrial();
      await fetchSubscription();
    } catch {
      // Error handled by hook
    }
  };

  const handleRefresh = () => {
    fetchSubscription();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Billing", href: "/dashboard/billing" },
        ]}
      />
      <div className="mb-6 flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription plan and payment methods.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-500">Free trial</p>
            {trialState.isTrialing ? (
              <h2 className="text-xl font-semibold text-foreground">
                {trialState.remainingCredits} credit
                {trialState.remainingCredits === 1 ? "" : "s"} left •{" "}
                {trialState.daysRemaining !== null
                  ? `${trialState.daysRemaining} day${
                      trialState.daysRemaining === 1 ? "" : "s"
                    } remaining`
                  : "trial ending soon"}
              </h2>
            ) : trialState.hasUsedTrial ? (
              <h2 className="text-xl font-semibold text-foreground">
                Trial completed
              </h2>
            ) : (
              <h2 className="text-xl font-semibold text-foreground">
                Start your {trialState.trialCredits}-credit trial
              </h2>
            )}
            <p className="text-sm text-muted-foreground">
              {trialState.hasUsedTrial
                ? "Your trial credits have been used. Pick a plan to keep generating thumbnails."
                : "Test the full workflow with complimentary credits before upgrading."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {!trialState.hasUsedTrial && (
              <Button
                onClick={handleStartTrial}
                disabled={isStarting}
                className="sm:min-w-[180px]"
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
                variant="secondary"
                onClick={handleConvertTrial}
                disabled={isConverting}
                className="sm:min-w-[150px]"
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

      {isActive ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your subscription details and usage
                </CardDescription>
              </div>
              <Badge variant="default" className="capitalize">
                {plan?.name || "Pro Plan"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <div className="text-sm text-muted-foreground mb-1">
                  Monthly Price
                </div>
                <div className="text-2xl font-bold">
                  ${plan?.price || "49.99"}
                </div>
              </div>
              {!isCancelled ? (
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="text-sm text-muted-foreground mb-1">
                    Renews On
                  </div>
                  <div className="text-2xl font-bold">
                    {stripeCurrentPeriodEnd
                      ? new Date(stripeCurrentPeriodEnd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : "N/A"}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="text-sm text-muted-foreground mb-1">
                    Subscription Ends
                  </div>
                  <div className="text-2xl font-bold">
                    {stripeCurrentPeriodEnd
                      ? new Date(stripeCurrentPeriodEnd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : "N/A"}
                  </div>
                </div>
              )}
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <div className="text-sm text-muted-foreground mb-1">
                  Credits
                </div>
                <div className="text-2xl font-bold">{credits}</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
              <h3 className="font-medium mb-2">{plan?.name} Plan Features</h3>
              <ul className="space-y-2">
                {plan?.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <BillingButton
              variant="outline"
              stripeCustomerId={stripeCustomerId}
              className="w-full cursor-pointer"
            />
            {/* <Button variant="brand">Upgrade Plan</Button> */}
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  Subscribe to unlock premium features
                </CardDescription>
              </div>
              {/* <Badge variant="outline">Free Plan</Badge> */}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <div className="text-sm text-muted-foreground mb-1">
                  Current Credits
                </div>
                <div className="text-2xl font-bold">{credits}</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
              <h3 className="font-medium mb-2">Upgrade to Pro Plan</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 mr-2" />
                  <span>500 ad generations per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 mr-2" />
                  <span>Custom template creation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 mr-2" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 mr-2" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="brand">
              <Link href="/pricing">Subscribe Now</Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-start gap-3 mt-6">
        <Shield className="h-5 w-5 text-brand-600 dark:text-brand-400 mt-0.5" />
        <div>
          <h3 className="font-medium">Secure Billing</h3>
          <p className="text-sm text-muted-foreground">
            Your payment information is encrypted and securely processed. We
            never store your full credit card details on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Billing;
