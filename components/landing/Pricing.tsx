"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$29",
    cadence: "/ month",
    description: "Good for getting started",
    badge: null,
    features: [
      "50 thumbnail generations/month",
      "Unlimited template access",
      "Unlimited YouTube import",
      "Custom asset uploads",
      "Custom template creation",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$79",
    cadence: "/ month",
    description: "Perfect for growing creators",
    badge: "Most Popular",
    features: [
      "200 thumbnail generations/month",
      "Unlimited template access",
      "Unlimited YouTube import",
      "Custom asset uploads",
      "Custom template creation",
      "Email support",
    ],
  },
  {
    name: "Power",
    price: "$199",
    cadence: "/ month",
    description: "For agencies & studios",
    badge: "Best Value",
    features: [
      "700 thumbnail generations/month",
      "Unlimited template access",
      "Unlimited YouTube import",
      "Custom asset uploads",
      "Custom template creation",
      "Email & priority WhatsApp support",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-white px-4 py-24 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Choose the plan that fits your team. Every tier includes unlimited template access and
            YouTube imports.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_25px_90px_rgba(15,23,42,0.08)] ${
                plan.badge ? "md:-mt-4" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gray-900 px-4 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
                <div className="flex items-baseline gap-2 pt-4">
                  <span className="text-4xl font-semibold text-gray-900">{plan.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">{plan.cadence}</span>
                </div>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-rose-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full rounded-full" size="lg" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
