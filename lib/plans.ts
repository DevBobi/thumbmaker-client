export type PricingPlan = {
  tier: "free" | "starter" | "pro" | "power";
  name: string;
  price: string;
  credits: number;
  description: string;
  features: string[];
  popular: boolean;
  priceId?: string | null;
  badge?: string;
  isFree?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    tier: "free",
    name: "Free",
    price: "0",
    credits: 4,
    description: "Test the workflow with 4 complimentary credits.",
    features: [
      "4 thumbnail generations total",
      "All template categories",
      "Upload your assets",
      "Start trial in seconds",
    ],
    popular: false,
    isFree: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID,
  },
  {
    tier: "starter",
    name: "Starter",
    price: "29",
    credits: 50,
    description: "Perfect for creators shipping every week.",
    features: [
      "50 thumbnail generations / month",
      "Unlimited template access",
      "Unlimited YouTube imports",
      "Custom asset uploads",
      "Custom template creation",
      "Email support",
    ],
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_ID,
  },
  {
    tier: "pro",
    name: "Pro",
    price: "79",
    credits: 200,
    description: "Best for teams producing at scale.",
    features: [
      "200 thumbnail generations / month",
      "Unlimited template access",
      "Unlimited YouTube imports",
      "Custom asset uploads",
      "Custom template creation",
      "Priority email support",
    ],
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID,
  },
  {
    tier: "power",
    name: "Power",
    price: "199",
    credits: 700,
    description: "Agencies & studios that need serious throughput.",
    features: [
      "700 thumbnail generations / month",
      "Unlimited template access",
      "Unlimited YouTube imports",
      "Custom asset uploads",
      "Custom template creation",
      "Priority email & WhatsApp support",
    ],
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_POWER_PLAN_ID,
  },
];
