"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    question: "What is Krillion AI and how does it work?",
    answer:
      "Krillion AI is an AI-driven platform for creating high-converting static ads in seconds. Simply add your product (via URL or documentation), choose a template from our library of 2,600+ proven ad designs, and let our AI generate multiple variations of optimized ad copy and visuals automatically.",
  },
  {
    question: "How can I try Krillion AI?",
    answer:
      "Click \"Get Started – It's Free\" in our header or hero section. You'll get 10 ad credits after adding your payment method.",
  },
  {
    question: "Do I need to provide a credit card?",
    answer:
      "Yes. To receive your 10 free ad credits and access all features, you'll need to add a valid payment method. You won't be charged until you exceed those credits.",
  },
  {
    question: "Can I customize the AI-generated ads?",
    answer:
      "Absolutely. After generation, you can edit headlines, tweak copy, swap images, adjust colors, and fine-tune CTAs within our built-in editor—no design skills required.",
  },
  {
    question: "What types of ad templates are available?",
    answer:
      "Our Template Gallery covers ads for: eCommerce, SaaS, B2B lead generation, Financial services, Real estate, Retail promotions, and more—over 2,600 templates proven to drive billions in sales.",
  },
  {
    question: "What ad formats does Krillion AI support?",
    answer:
      "We support portrait, landscape, and square formats—optimized for platforms like Instagram, Facebook, LinkedIn, Google Display Network, and more. You can export directly in the dimensions you need.",
  },
  {
    question: "How does Product Intelligence work?",
    answer:
      "Our Smart Product Profiling uses AI to analyze your product URL or documentation. It extracts key features, benefits, and audience insights automatically, ensuring that every ad is perfectly tailored to your offering.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We offer email support only. You can reach us at contact@trykrillion.com, and we'll respond within 24 hours.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      'Go to your Account settings and click "Cancel Subscription." Your plan will remain active until the end of your billing period, after which you\'ll lose access to paid features.',
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-background to-background/95"
    >
      <div className="max-w-6xl mx-auto">
        <h3 className="text-sm mb-4 font-medium">Got questions?</h3>
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-12 font-bold">
          Frequently Asked
          <br /> Questions
        </h1>
        <div className="mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-xl px-4 sm:px-6 py-2 bg-background/50 hover:bg-background/80 transition-colors"
              >
                <AccordionTrigger className="py-2 sm:py-4 cursor-pointer text-base sm:text-lg font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
