"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "19",
      credits: 40,
      description: "Perfect for individuals and small creators",
      features: [
        "40 YouTube thumbnails generated",
        "2600+ Thumbnail Templates",
        "Highest quality images",
        "YouTube optimized dimensions",
        "Access to the template library",
        "Upload your own template",
      ],
      popular: false,
    },
    {
      name: "Standard",
      price: "49",
      credits: 110,
      description: "Best for growing YouTubers and channels",
      features: [
        "110 YouTube thumbnails generated",
        "2600+ Thumbnail Templates",
        "Highest quality images",
        "YouTube optimized dimensions",
        "Access to the template library",
        "Upload your own template",
      ],
      popular: true,
    },
    {
      name: "Custom",
      price: null,
      credits: null,
      description: "Tailored to your specific needs",
      features: [
        "Custom credit packages",
        "Priority support",
        "Dedicated account manager",
      ],
      popular: false,
      isCustom: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-background to-background/80 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your YouTube thumbnail needs. Create stunning thumbnails that get clicks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl bg-card p-8 shadow-lg ${
                plan.popular
                  ? "border-2 border-primary scale-105"
                  : "border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>

                {/* Price Section */}
                {plan.price ? (
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                      ${plan.price}
                    </span>
                    <span className="ml-1 text-xl text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <div className="mt-4 text-3xl font-bold text-foreground">
                    Contact Us
                  </div>
                )}

                {/* Description */}
                <p className="mt-4 text-muted-foreground">{plan.description}</p>
              </div>

              {/* Credits Display */}
              {plan.credits !== null && (
                <div className="mt-8">
                  <div className="flex items-center justify-center">
                    <span className="text-xl font-semibold text-primary">
                      {plan.credits.toLocaleString()} Credits
                    </span>
                  </div>
                </div>
              )}

              {/* Features */}
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button Section */}
              <div className="mt-8">
                {plan.isCustom ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full cursor-pointer"
                    asChild
                  >
                    <Link href="mailto:contact@trykrillion.com">Contact Us</Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant={plan.popular ? "default" : "secondary"}
                    className="w-full cursor-pointer"
                    asChild
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
