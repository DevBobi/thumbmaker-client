"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is THUMBMAKER and how does it work?",
    answer:
      "THUMBMAKER is an AI-powered platform for creating high-performing YouTube thumbnails in seconds. Simply provide your video content, choose from our library of proven thumbnail templates, and let our AI generate context-aware, eye-catching thumbnails optimized for maximum click-through rates. All thumbnails are generated in the standard YouTube 16:9 ratio (1280x720 pixels).",
  },
  {
    question: "How can I try THUMBMAKER?",
    answer:
      "Click \"Get Started\" in our header or hero section to create a free account. You'll get 10 free thumbnail credits to start—no credit card required.",
  },
  {
    question: "Do I need to provide a credit card?",
    answer:
      "No credit card is required to get started. You'll receive 10 free thumbnail credits immediately upon sign-up. Only add a payment method when you're ready to create more thumbnails.",
  },
  {
    question: "Can I customize the AI-generated thumbnails?",
    answer:
      "Absolutely. After generation, you can edit text, adjust fonts, swap images, change colors, reposition elements, and fine-tune your thumbnail within our built-in editor—no design skills required.",
  },
  {
    question: "What types of thumbnail templates are available?",
    answer:
      "Our Template Gallery covers thumbnails for various YouTube niches: Gaming, Education, Tech Reviews, Vlogs, Tutorials, Business, Finance, Lifestyle, Entertainment, and more. All templates are designed in 16:9 format and optimized for high click-through rates.",
  },
  {
    question: "What thumbnail format does THUMBMAKER support?",
    answer:
      "We generate thumbnails in YouTube's standard 16:9 aspect ratio (1280x720 pixels), which is the recommended format for all YouTube videos. Thumbnails are exported as high-quality PNG or JPG files ready for upload.",
  },
  {
    question: "How does the AI understand my video content?",
    answer:
      "Our AI analyzes your video title, description, and any additional context you provide. It extracts key themes, emotional hooks, and audience insights to generate thumbnails that perfectly match your content and maximize viewer engagement.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We offer email support at contact@trykrillion.com. Our team typically responds within 24 hours to help with any questions or issues you may encounter.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      'Go to your Account settings and click "Cancel Subscription." Your plan will remain active until the end of your billing period, after which you\'ll revert to the free plan with limited features.',
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-white"
    >
      <div className="max-w-6xl mx-auto">
        <h3 className="text-sm mb-4 font-medium text-gray-600">Got questions?</h3>
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-12 font-bold">
          Frequently Asked
          <br /> Questions
        </h1>
        <div className="mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-200 rounded-xl px-4 sm:px-6 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <AccordionTrigger className="py-2 sm:py-4 cursor-pointer text-base sm:text-lg font-medium hover:no-underline text-gray-900">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-gray-600">
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
