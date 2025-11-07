"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      credits: 10,
      description: "Perfect for small businesses and individuals",
      features: [
        "10 thumbnail credits",
        "Access to all templates",
        "Basic support",
        "Unlimited graphics uploads",
        "16:9 YouTube format",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      credits: 50,
      description: "Ideal for growing creators",
      features: [
        "50 thumbnail credits",
        "Access to all templates",
        "Priority support",
        "Unlimited graphics uploads",
        "Bulk thumbnail generation",
        "Advanced customization",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      credits: 200,
      description: "For large-scale operations",
      features: [
        "200 thumbnail credits",
        "Access to all templates",
        "24/7 support",
        "Unlimited graphics uploads",
        "Bulk thumbnail generation",
        "Custom templates",
        "API access",
        "White-label options",
      ],
      popular: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative w-full py-16 sm:py-24 bg-white overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h3 className="text-sm mb-4 font-medium text-gray-600">Simple pricing</h3>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-4 font-bold">
            Choose Your Plan
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-600">
            Each thumbnail costs 1 credit. Start free with 10 credits, no credit card required.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-brand-500 to-red-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}
              <Card
                className={`flex flex-col h-full transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-brand-500 shadow-xl scale-105"
                    : "border border-gray-200 shadow-lg hover:shadow-xl"
                }`}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 text-lg ml-2">
                      / {plan.credits} credits
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-brand-500 to-red-600 hover:from-brand-600 hover:to-red-700"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
