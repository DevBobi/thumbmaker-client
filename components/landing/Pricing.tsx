import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      credits: 10,
      description: "Perfect for small businesses and individuals",
      features: [
        "10 ad credits",
        "Access to all templates",
        "Basic support",
        "Unlimited graphics uploads",
      ],
    },
    {
      name: "Professional",
      price: "$29",
      credits: 50,
      description: "Ideal for growing businesses",
      features: [
        "50 ad credits",
        "Access to all templates",
        "Priority support",
        "Unlimited graphics uploads",
        "Bulk ad generation",
      ],
    },
    {
      name: "Enterprise",
      price: "$99",
      credits: 200,
      description: "For large-scale operations",
      features: [
        "200 ad credits",
        "Access to all templates",
        "24/7 support",
        "Unlimited graphics uploads",
        "Bulk ad generation",
        "Custom templates",
        "API access",
      ],
    },
  ];

  return (
    <section className="container py-24 sm:py-32">
      <div className="grid gap-4 px-4 text-center md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Choose the plan that works best for you. Each ad costs 1 credit.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">
                  {" "}
                  / {plan.credits} credits
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Get Started</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
