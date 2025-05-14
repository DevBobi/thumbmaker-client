"use client";
import React from "react";
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
import { Check, Shield, RefreshCw } from "lucide-react";
import Link from "next/link";
import { BillingButton } from "@/components/BillingButton";
import Breadcrumb from "@/components/Breadcrumb";
import { pricingPlans } from "@/lib/plans";
import { useRouter } from "next/navigation";

interface BillingProps {
  credits: number;
  isActive: boolean;
  status: string | null;
  stripeCurrentPeriodEnd: string | null;
  stripeCustomerId: string;
  isCancelled: boolean;
  priceId: string | null;
}

const Billing = ({
  credits,
  isActive,
  stripeCurrentPeriodEnd,
  stripeCustomerId,
  isCancelled,
  priceId,
}: BillingProps) => {
  const router = useRouter();
  const plan = pricingPlans.find((p) => p.priceId === priceId);

  const handleRefresh = () => {
    router.refresh();
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
              <Badge className="bg-brand-600 capitalize hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white dark:text-primary">
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
                      ? new Date(stripeCurrentPeriodEnd).toLocaleDateString()
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
                      ? new Date(stripeCurrentPeriodEnd).toLocaleDateString()
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
