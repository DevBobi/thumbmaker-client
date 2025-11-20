"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TRIAL_CREDIT_ALLOCATION } from "@/constants/credits";

const faqItems = [
  {
    question: "What is ThumbMaker?",
    answer:
      "ThumbMaker is an AI-powered platform that turns your scripts, YouTube links, or ideas into high-performing thumbnail batches in a few clicks.",
  },
  {
    question: "How does the 7-credit trial work?",
    answer: `Add a payment method once via Stripe to verify your account. We instantly drop ${TRIAL_CREDIT_ALLOCATION} credits into your workspace and only charge you if you later pick a plan.`,
  },
  {
    question: "How many thumbnails can I generate at once?",
    answer:
      "Every project produces 20 variations instantly. Choose your favorites, edit details, and publish the winners.",
  },
  {
    question: "Can I use my own images in the thumbnails?",
    answer:
      "Absolutely. Upload brand assets, screenshots, or custom photos and ThumbMaker will blend them into the generated concepts.",
  },
  {
    question: "How does the YouTube import work?",
    answer:
      "Drop a YouTube link and we automatically pull the title, description, and transcripts so the AI understands the full context.",
  },
  {
    question: "Can I create my own templates?",
    answer:
      "Yes. Customize any template or build from scratch to create reusable layouts that match your visual identity.",
  },
  {
    question: "What if I run out of generations?",
    answer:
      "Upgrade anytime or purchase top-up credits. Your projects and templates stay intact no matter what.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "We offer a 7-day refund window for unused credits. Reach out to contact@trykrillion.com and we’ll help right away.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-[#F8F4FF] px-4 py-24 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <div className="max-w-sm space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            FAQ
          </p>
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-muted-foreground">
            Still curious? We’ve answered the most common questions creators ask before shipping
            their next viral video.
          </p>
        </div>
        <div className="flex-1">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="rounded-2xl border border-black/5 bg-white px-6 py-2 shadow-sm"
            >
              <AccordionTrigger className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-gray-900 hover:no-underline [&>svg]:text-gray-400 [&[data-state=open]>svg]:text-rose-500">
                {item.question}
              </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-muted-foreground">
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
