"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { TRIAL_CREDIT_ALLOCATION } from "@/constants/credits";

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
          <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Choose the plan that fits your team. Every tier includes unlimited template access and
            YouTube imports, plus {TRIAL_CREDIT_ALLOCATION} free credits the moment you add your card.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isFeatured = plan.badge === "Most Popular";
            return (
              <div
                key={plan.name}
                className={`relative rounded-[32px] border bg-white p-8 shadow-[0_25px_100px_rgba(15,23,42,0.08)] ${
                  isFeatured ? "border-rose-200 bg-gradient-to-b from-white to-rose-50/50" : "border-gray-200"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    {plan.badge}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold text-gray-900">{plan.price}</span>
                    <span className="text-sm font-medium text-muted-foreground">{plan.cadence}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <ul className="space-y-4 text-sm text-gray-800">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-rose-100 bg-white">
                        <Check className="h-3.5 w-3.5 text-rose-500" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`mt-10 w-full rounded-full shadow-lg shadow-gray-900/20 hover:opacity-90 ${
                    isFeatured
                      ? "bg-gradient-to-br from-gray-900 to-black text-white"
                      : "bg-white text-gray-900 border border-gray-200 shadow-none hover:bg-gray-50"
                  }`}
                  size="lg"
                  asChild
                >
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
