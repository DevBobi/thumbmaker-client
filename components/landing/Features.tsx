"use client";
import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      title: "Instant product understanding with AI",
      subtitle: "Smart Product Profiling",
      description:
        "Simply paste your URL or upload product documentation. Our AI instantly analyzes and understands your offering to create perfectly tailored ads.",
      cta: "Add Your First Product",
      ctaHref: "/dashboard",
      media: "/images/features/product-create.png", // placeholder
    },
    {
      title: "Choose from 2600+ proven ad templates",
      subtitle: "Template Library",
      description:
        "Filter and search through our library of templates that have generated billions in revenue. Find the perfect match for your product, audience, and goals.",
      cta: "Explore Templates",
      ctaHref: "/dashboard",
      media: "/images/features/ad-templates.png", // placeholder
    },
    {
      title: "One-shot ad generation",
      subtitle: "AI Ad Creation",
      description:
        "Select your product, campaign context, and ad dimensions. Krillion AI handles everything from copywriting to visuals, creating multiple high-converting variations instantly.",
      cta: "Create Your First Ad",
      ctaHref: "/dashboard",
      media: "/images/features/ad-generation.png", // placeholder
    },
    {
      title: "Flexible Ad Formats",
      subtitle: "Multi-Platform Support",
      description:
        "Generate ads in portrait, landscape, or square formats. Perfect for any platform from Instagram to Facebook, LinkedIn to Google Display Network.",
      media: "/images/features/ad-formats.png", // placeholder
      cta: "Try Different Formats",
      ctaHref: "/dashboard",
    },
    {
      title: "Endless possibilities with generative AI",
      subtitle: "Ad Expansion",
      description:
        "Take your best-performing ads and use our generative tools to expand into new formats & dimensions.",
      cta: "Try Ad Expansion",
      ctaHref: "/dashboard",
      secondaryCta: "Book a Strategy Call",
      secondaryCtaHref: "https://cal.com/jayships/30-min-meeting-krillion-ai",
      media: "/images/features/ad-expand.png", // placeholder
    },
  ];

  return (
    <section
      id="features"
      className="max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto py-16 sm:py-24"
    >
      <div className="mb-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm mb-4 font-medium">Discover what you can do</h3>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-2 font-bold">
            Powerful AI ad features
            <br />
            for every marketer
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-16">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${
              idx % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Media */}
            <div className="w-full md:w-1/2 flex justify-center">
              <motion.div
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 + 0.2 }}
                className="rounded-2xl overflow-hidden border w-full max-w-lg aspect-video flex items-center justify-center"
              >
                <Image
                  src={feature.media}
                  alt={feature.title}
                  width={800}
                  height={450}
                  className="object-contain w-full h-full transition-all duration-300"
                  priority={idx === 0}
                />
              </motion.div>
            </div>
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: idx % 2 === 0 ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.2 + 0.3 }}
              className="w-full md:w-1/2 flex flex-col items-center md:items-start"
            >
              <Card className="w-full max-w-xl mx-auto shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 rounded-2xl transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center md:text-left">
                    {feature.title}
                  </CardTitle>
                  {feature.subtitle && (
                    <div className="text-lg text-slate-500 dark:text-slate-400 text-center md:text-left">
                      {feature.subtitle}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-8">
                  <CardDescription className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed text-center md:text-left">
                    {feature.description}
                  </CardDescription>
                  {(feature.cta || feature.secondaryCta) && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4">
                      {feature.cta && (
                        <Button asChild variant="brand">
                          <Link href={feature.ctaHref}>{feature.cta}</Link>
                        </Button>
                      )}
                      {feature.secondaryCta && (
                        <Button asChild variant="outline">
                          <Link href={feature.secondaryCtaHref}>
                            {feature.secondaryCta}
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
