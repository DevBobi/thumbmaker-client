"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { useRouter } from "next/navigation";
import { BillingButton } from "@/components/BillingButton";
import Breadcrumb from "@/components/Breadcrumb";
import { pricingPlans } from "@/lib/plans";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Alert, AlertDescription } from "@/components/ui/alert";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BillingProps {}

const Billing = ({}: BillingProps) => {
  const { authFetch } = useAuthFetch();
  const [billingError, setBillingError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const router = useRouter();
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
      const response = await authFetch("/user/subscription");
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
  const defaultPaidPriceId =
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_POWER_PLAN_ID ||
    "";

  const DEFAULT_TRIAL_CREDITS = 4;
  const trialCredits =
    typeof subscriptionData?.trialCredits === "number"
      ? subscriptionData.trialCredits
      : DEFAULT_TRIAL_CREDITS;
  const trialCreditsUsed = subscriptionData?.trialCreditsUsed ?? 0;
  
  // For paid plans, show plan credits. For trial/free, show remaining trial credits
  const isPaidPlan = isActive && credits > DEFAULT_TRIAL_CREDITS;
  const remainingTrialCredits = Math.max(0, trialCredits - trialCreditsUsed);
  const displayCredits = isPaidPlan ? credits : remainingTrialCredits;
  
  const trialEndsAt = subscriptionData?.trialEndsAt
    ? new Date(subscriptionData.trialEndsAt)
    : null;
  const isTrialing = ["trialing", "ending"].includes(
    subscriptionData?.trialStatus ?? ""
  );
  const handleCheckout = async (priceId?: string) => {
    const targetPriceId = priceId || defaultPaidPriceId;
    if (!targetPriceId) {
      setBillingError("No plan is configured yet. Please contact support.");
      return;
    }

    setBillingError(null);
    setIsCheckoutLoading(true);

    try {
      const response = await authFetch("/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ priceId: targetPriceId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Failed to start checkout.");
      }

      window.location.href = data.url;
    } catch (error: any) {
      setBillingError(
        error?.message || "Failed to start checkout. Please try again."
      );
    } finally {
      setIsCheckoutLoading(false);
    }
  };


  const handleRefresh = () => {
    fetchSubscription();
  };

  const formattedTrialEnds =
    trialEndsAt &&
    trialEndsAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const targetCheckoutPriceId = stripePriceId || defaultPaidPriceId;
  const shouldPromptUpgrade = credits <= 0;

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

      {billingError && (
        <Alert variant="destructive">
          <AlertDescription>{billingError}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide">
              {isPaidPlan ? "Plan Credits" : "Complimentary credits"}
            </p>
            <h2 className="text-xl font-semibold text-foreground">
              {displayCredits} credit
              {displayCredits === 1 ? "" : "s"} {isPaidPlan ? "available" : "remaining"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPaidPlan 
                ? `You have ${credits} credits from your ${plan?.name || "paid"} plan.`
                : `Every account starts with ${DEFAULT_TRIAL_CREDITS} free credits to test the workflow.`}
              {isTrialing && formattedTrialEnds && !isPaidPlan
                ? ` Trial scheduled to end on ${formattedTrialEnds}.`
                : ""}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {shouldPromptUpgrade ? (
              <Button
                className="sm:min-w-[180px]"
                disabled={isCheckoutLoading || !targetCheckoutPriceId}
                onClick={() => handleCheckout(targetCheckoutPriceId)}
              >
                {isCheckoutLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting...
                  </div>
                ) : (
                  "Buy a plan"
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="sm:min-w-[160px]"
                onClick={() => router.push("/pricing")}
              >
                View plans
              </Button>
            )}
          </div>
        </div>
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
            <Button
              variant="brand"
              disabled={isCheckoutLoading || !defaultPaidPriceId}
              onClick={() => handleCheckout(defaultPaidPriceId)}
              className="min-w-[160px]"
            >
              {isCheckoutLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </div>
              ) : (
                "Subscribe Now"
              )}
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
