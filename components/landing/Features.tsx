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
      icon: "AI",
      title: "Instant video understanding with AI",
      subtitle: "Smart Video Analysis",
      description: "Simply paste your YouTube URL or upload video details. Our AI instantly analyzes and understands your content to create perfectly tailored thumbnails that capture attention.",
      cta: "Add Your First Video",
      ctaHref: "/dashboard",
      media: "/images/features/product-create.png",
    },
    {
      icon: "📚",
      title: "Choose from 2600+ proven thumbnail templates",
      subtitle: "Template Library",
      description: "Filter and search through our library of templates used by top YouTubers. Find the perfect match for your video style, audience, and goals.",
      cta: "Explore Templates",
      ctaHref: "/dashboard",
      media: "/images/features/ad-templates.png",
    },
    {
      icon: "⚡",
      title: "One-shot thumbnail generation",
      subtitle: "AI Thumbnail Creation",
      description: "Select your video project, add context, and choose dimensions. THUMBMAKER handles everything from text overlays to visuals, creating multiple high-converting thumbnail variations instantly.",
      cta: "Create Your First Thumbnail",
      ctaHref: "/dashboard",
      media: "/images/features/ad-generation.png",
    },
    {
      icon: "📱",
      title: "Flexible Thumbnail Formats",
      subtitle: "Multi-Platform Support",
      description: "Generate thumbnails optimized for YouTube with perfect 16:9 ratio. Also works for other platforms with portrait, landscape, or square formats.",
      cta: "Try Different Formats",
      ctaHref: "/dashboard",
      media: "/images/features/ad-formats.png",
    },
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
      <div className="mb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-sm mb-4 font-medium text-gray-300">Discover what you can do</h3>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-2 font-bold">
            Powerful AI thumbnail features
            <br />
            for every creator
          </h1>
        </div>
      </div>
      <div className="space-y-8 relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* First row: 60% + 40% */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="w-full h-full shadow-xl border border-gray-200 bg-white rounded-2xl transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{features[0].icon}</span>
                  </div>
                  {features[0].subtitle && (
                    <span className="text-sm text-gray-600 font-medium">{features[0].subtitle}</span>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {features[0].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-gray-700 leading-relaxed">
                  {features[0].description}
                </CardDescription>
                
                {features[0].media && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={features[0].media}
                      alt={features[0].title}
                      width={400}
                      height={200}
                      className="object-cover w-full h-48"
                    />
                  </div>
                )}
                
                {features[0].cta && (
                  <Button asChild variant="default" className="w-full">
                    <Link href={features[0].ctaHref}>{features[0].cta}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="w-full h-full shadow-xl border border-gray-200 bg-white rounded-2xl transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{features[1].icon}</span>
                  </div>
                  {features[1].subtitle && (
                    <span className="text-sm text-gray-600 font-medium">{features[1].subtitle}</span>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {features[1].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-gray-700 leading-relaxed">
                  {features[1].description}
                </CardDescription>
                
                {features[1].media && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={features[1].media}
                      alt={features[1].title}
                      width={400}
                      height={200}
                      className="object-cover w-full h-48"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Second row: 30% + 60% */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="w-full h-full shadow-xl border border-gray-200 bg-white rounded-2xl transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{features[2].icon}</span>
                  </div>
                  {features[2].subtitle && (
                    <span className="text-sm text-gray-600 font-medium">{features[2].subtitle}</span>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {features[2].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-gray-700 leading-relaxed">
                  {features[2].description}
                </CardDescription>
                
                {features[2].media && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={features[2].media}
                      alt={features[2].title}
                      width={400}
                      height={200}
                      className="object-cover w-full h-48"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Card className="w-full h-full shadow-xl border border-gray-200 bg-white rounded-2xl transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{features[3].icon}</span>
                  </div>
                  {features[3].subtitle && (
                    <span className="text-sm text-gray-600 font-medium">{features[3].subtitle}</span>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {features[3].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-gray-700 leading-relaxed">
                  {features[3].description}
                </CardDescription>
                
                {features[3].media && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={features[3].media}
                      alt={features[3].title}
                      width={400}
                      height={200}
                      className="object-cover w-full h-48"
                    />
                  </div>
                )}
                
                {features[3].cta && (
                  <Button asChild variant="default" className="w-full">
                    <Link href={features[3].ctaHref}>{features[3].cta}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
