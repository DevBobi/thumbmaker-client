export const pricingPlans = [
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID, // <-- you'll define this env var
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PLAN_ID, // <-- you'll define this env var
  },
];
