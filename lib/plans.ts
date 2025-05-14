export const pricingPlans = [
  {
    name: "Basic",
    price: "19",
    credits: 40,
    description: "Perfect for individuals and small businesses",
    features: [
      "40 ad images generated",
      "2600+ Ads Templates",
      "Highest quality image",
      "Multiple aspect ratios",
      "Access to the template library",
      "Upload your own template",
    ],
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID, // <-- you'll define this env var
  },
  {
    name: "Standard",
    price: "49",
    credits: 110,
    description: "Best for growing brands and businesses",
    features: [
      "110 ad images generated",
      "2600+ Ads Templates",
      "Highest quality image",
      "Multiple aspect ratios",
      "Access to the template library",
      "Upload your own template",
    ],
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PLAN_ID, // <-- you'll define this env var
  },
];
