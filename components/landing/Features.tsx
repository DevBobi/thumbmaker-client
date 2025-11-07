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
  const steps = [
    {
      step: "01",
      icon: "🎬",
      title: "Create Your Product",
      subtitle: "Multiple ways to start",
      description: "Get started your way - manually enter details, let AI analyze your YouTube video, extract from text, or upload existing files. Our flexible input system adapts to your workflow.",
      media: "/images/features/product-create.png",
      methods: [
        { icon: "📺", label: "YouTube URL" },
        { icon: "✍️", label: "Manual Entry" },
        { icon: "🤖", label: "AI Analysis" },
        { icon: "📁", label: "File Upload" }
      ]
    },
    {
      step: "02",
      icon: "📚",
      title: "Choose Your Template",
      subtitle: "2600+ proven designs",
      description: "Browse our extensive library of high-converting thumbnail templates used by successful YouTubers. Filter by category, style, and performance metrics to find your perfect match.",
      media: "/images/features/ad-templates.png",
      cta: "Explore Templates",
      ctaHref: "/dashboard",
      stats: [
        { value: "2600+", label: "Templates" },
        { value: "50+", label: "Categories" },
        { value: "Top rated", label: "Quality" }
      ]
    },
    {
      step: "03",
      icon: "⚡",
      title: "Generate & Customize",
      subtitle: "AI-powered creation",
      description: "Watch as AI instantly generates multiple thumbnail variations optimized for maximum engagement. Customize colors, text, and elements in real-time with our intuitive editor.",
      media: "/images/features/ad-generation.png",
      cta: "Start Creating Now",
      ctaHref: "/dashboard",
      features: [
        "Multiple variations",
        "Real-time editing",
        "Smart text overlays",
        "Multi-platform export"
      ]
    }
  ];

  return (
    <section
      id="features"
      className="relative w-full py-16 sm:py-24"
    >
      {/* Feature overlay background */}
      <div className="absolute inset-0 z-0 bg-white">
        <Image
          src="/hero/feature-overlay.png"
          alt="Feature overlay"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Header Section */}
      <div className="mb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-sm mb-4 font-semibold text-white/80 uppercase tracking-wider">How it works</h3>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4 font-bold drop-shadow-lg">
            Three Simple Steps to
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
              Create Stunning Thumbnails
            </span>
          </h1>
          <p className="text-lg text-white font-medium max-w-3xl mx-auto drop-shadow-md">
            From video input to viral thumbnail in minutes
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="space-y-8 relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="w-full shadow-xl border border-gray-200 bg-white rounded-2xl transition-all duration-300 hover:shadow-2xl">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}>
                {/* Content Side */}
                <div className={`p-8 sm:p-10 flex flex-col justify-center ${
                  index % 2 === 1 ? 'lg:col-start-2' : ''
                }`}>
                  <CardHeader className="pb-4 px-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">{step.icon}</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{step.step}</span>
                        </div>
                      </div>
                      {step.subtitle && (
                        <span className="text-sm text-gray-500 font-medium">{step.subtitle}</span>
                      )}
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 px-0">
                    <CardDescription className="text-base text-gray-700 leading-relaxed">
                      {step.description}
                    </CardDescription>

                    {/* Step-specific content */}
                    {step.methods && (
                      <div className="grid grid-cols-2 gap-3">
                        {step.methods.map((method, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            <span className="text-lg">{method.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{method.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.stats && (
                      <div className="grid grid-cols-3 gap-3">
                        {step.stats.map((stat, i) => (
                          <div
                            key={i}
                            className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100"
                          >
                            <div className="text-xl font-bold text-blue-600 mb-1">
                              {stat.value}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.features && (
                      <div className="grid grid-cols-2 gap-2">
                        {step.features.map((feature, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2"
                          >
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-green-600 text-xs">✓</span>
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.cta && (
                      <Button asChild variant="default" className="w-full sm:w-auto mt-2">
                        <Link href={step.ctaHref}>{step.cta}</Link>
                      </Button>
                    )}
                  </CardContent>
                </div>

                {/* Media Side */}
                <div className={`relative p-8 sm:p-10 flex items-center justify-center ${
                  index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''
                }`}>
                  {step.media && (
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={step.media}
                        alt={step.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
